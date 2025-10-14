import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MigrationStats {
  totalCards: number;
  cardsProcessed: number;
  attachmentsMigrated: number;
  errors: string[];
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify admin user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check if user is admin
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (!roleData || roleData.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Admin access required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Starting attachment migration...');
    
    const stats: MigrationStats = {
      totalCards: 0,
      cardsProcessed: 0,
      attachmentsMigrated: 0,
      errors: [],
    };

    // Fetch all cards with attachments (in batches)
    const batchSize = 50;
    let offset = 0;
    let hasMore = true;

    while (hasMore) {
      const { data: cards, error: fetchError } = await supabase
        .from('project_cards')
        .select('id, list_id, custom_fields')
        .not('custom_fields->attachments', 'is', null)
        .range(offset, offset + batchSize - 1);

      if (fetchError) {
        console.error('Error fetching cards:', fetchError);
        stats.errors.push(`Fetch error: ${fetchError.message}`);
        break;
      }

      if (!cards || cards.length === 0) {
        hasMore = false;
        break;
      }

      stats.totalCards += cards.length;

      // Process each card
      for (const card of cards) {
        try {
          const customFields = card.custom_fields as any;
          const attachments = customFields?.attachments || [];
          
          if (!Array.isArray(attachments) || attachments.length === 0) {
            continue;
          }

          let migratedCount = 0;
          const updatedAttachments = [];

          for (const attachment of attachments) {
            // Check if it's a data URL that needs migration
            if (attachment.url && attachment.url.startsWith('data:')) {
              try {
                // Extract base64 data
                const matches = attachment.url.match(/^data:([^;]+);base64,(.+)$/);
                if (!matches) {
                  stats.errors.push(`Invalid data URL in card ${card.id}`);
                  updatedAttachments.push(attachment);
                  continue;
                }

                const mimeType = matches[1];
                const base64Data = matches[2];
                
                // Convert base64 to blob
                const binaryString = atob(base64Data);
                const bytes = new Uint8Array(binaryString.length);
                for (let i = 0; i < binaryString.length; i++) {
                  bytes[i] = binaryString.charCodeAt(i);
                }
                const blob = new Blob([bytes], { type: mimeType });

                // Generate file path
                const fileExt = attachment.name?.split('.').pop() || 'bin';
                const fileName = `${crypto.randomUUID()}.${fileExt}`;
                const filePath = `projects/${card.list_id}/${card.id}/${fileName}`;

                // Upload to storage
                const { error: uploadError } = await supabase.storage
                  .from('project-attachments')
                  .upload(filePath, blob, {
                    contentType: mimeType,
                    cacheControl: '3600',
                    upsert: false,
                  });

                if (uploadError) {
                  console.error(`Upload error for card ${card.id}:`, uploadError);
                  stats.errors.push(`Upload failed for ${attachment.name} in card ${card.id}`);
                  updatedAttachments.push(attachment);
                  continue;
                }

                // Get public URL
                const { data: { publicUrl } } = supabase.storage
                  .from('project-attachments')
                  .getPublicUrl(filePath);

                // Update attachment with new URL
                updatedAttachments.push({
                  ...attachment,
                  url: publicUrl,
                });

                migratedCount++;
                stats.attachmentsMigrated++;
                console.log(`Migrated: ${attachment.name} -> ${publicUrl}`);
              } catch (err) {
                console.error(`Error migrating attachment in card ${card.id}:`, err);
                stats.errors.push(`Migration error: ${err.message}`);
                updatedAttachments.push(attachment);
              }
            } else {
              // Keep non-data URL attachments as-is
              updatedAttachments.push(attachment);
            }
          }

          // Update card if any attachments were migrated
          if (migratedCount > 0) {
            const { error: updateError } = await supabase
              .from('project_cards')
              .update({
                custom_fields: {
                  ...customFields,
                  attachments: updatedAttachments,
                },
              })
              .eq('id', card.id);

            if (updateError) {
              console.error(`Error updating card ${card.id}:`, updateError);
              stats.errors.push(`Update failed for card ${card.id}`);
            } else {
              stats.cardsProcessed++;
              console.log(`Card ${card.id}: migrated ${migratedCount} attachments`);
            }
          }
        } catch (err) {
          console.error(`Error processing card ${card.id}:`, err);
          stats.errors.push(`Card ${card.id}: ${err.message}`);
        }
      }

      offset += batchSize;
    }

    console.log('Migration completed:', stats);

    return new Response(JSON.stringify({
      success: true,
      stats,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Migration error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
