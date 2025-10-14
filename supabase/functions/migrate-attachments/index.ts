import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Attachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  uploadedAt: string;
  uploadedBy: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Starting attachment migration...');

    // Buscar todos os cartões com attachments em base64
    const { data: cards, error: fetchError } = await supabase
      .from('project_cards')
      .select('id, list_id, custom_fields')
      .not('custom_fields->attachments', 'is', null);

    if (fetchError) {
      throw fetchError;
    }

    console.log(`Found ${cards?.length || 0} cards with attachments`);

    let migratedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const card of cards || []) {
      try {
        const attachments = (card.custom_fields as any)?.attachments || [];
        let hasChanges = false;
        const updatedAttachments: Attachment[] = [];

        for (const attachment of attachments) {
          // Verificar se é um data URL (base64)
          if (attachment.url && attachment.url.startsWith('data:')) {
            try {
              console.log(`Migrating attachment ${attachment.name} from card ${card.id}`);

              // Extrair dados do data URL
              const matches = attachment.url.match(/^data:([^;]+);base64,(.+)$/);
              if (!matches) {
                console.error(`Invalid data URL format for ${attachment.name}`);
                errorCount++;
                updatedAttachments.push(attachment);
                continue;
              }

              const [, mimeType, base64Data] = matches;
              
              // Decodificar base64
              const binaryData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));

              // Gerar caminho único no storage
              const fileExt = attachment.name.split('.').pop() || 'bin';
              const fileName = `${crypto.randomUUID()}.${fileExt}`;
              const filePath = `projects/${card.list_id}/${card.id}/${fileName}`;

              // Upload para Supabase Storage
              const { error: uploadError } = await supabase.storage
                .from('project-attachments')
                .upload(filePath, binaryData, {
                  contentType: mimeType,
                  cacheControl: '3600',
                  upsert: false
                });

              if (uploadError) {
                console.error(`Upload error for ${attachment.name}:`, uploadError);
                errorCount++;
                updatedAttachments.push(attachment);
                continue;
              }

              // Obter URL pública
              const { data: { publicUrl } } = supabase.storage
                .from('project-attachments')
                .getPublicUrl(filePath);

              // Atualizar attachment com nova URL
              updatedAttachments.push({
                ...attachment,
                url: publicUrl,
                type: mimeType || attachment.type
              });

              hasChanges = true;
              migratedCount++;
              console.log(`✓ Migrated ${attachment.name} to ${publicUrl}`);
            } catch (err) {
              console.error(`Error migrating attachment ${attachment.name}:`, err);
              errorCount++;
              updatedAttachments.push(attachment);
            }
          } else {
            // Já é URL do storage ou link externo, manter como está
            updatedAttachments.push(attachment);
            skippedCount++;
          }
        }

        // Atualizar o cartão se houve mudanças
        if (hasChanges) {
          const updatedCustomFields = {
            ...(card.custom_fields as any),
            attachments: updatedAttachments
          };

          const { error: updateError } = await supabase
            .from('project_cards')
            .update({ custom_fields: updatedCustomFields })
            .eq('id', card.id);

          if (updateError) {
            console.error(`Error updating card ${card.id}:`, updateError);
            errorCount++;
          } else {
            console.log(`✓ Updated card ${card.id} with ${updatedAttachments.length} attachments`);
          }
        }
      } catch (err) {
        console.error(`Error processing card ${card.id}:`, err);
        errorCount++;
      }
    }

    const result = {
      success: true,
      message: `Migration completed: ${migratedCount} attachments migrated, ${skippedCount} skipped, ${errorCount} errors`,
      stats: {
        totalCards: cards?.length || 0,
        migratedAttachments: migratedCount,
        skippedAttachments: skippedCount,
        errors: errorCount
      }
    };

    console.log('Migration result:', result);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Migration error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        message: 'Failed to migrate attachments'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
