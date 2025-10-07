import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Processing automations...');
    const now = new Date();

    // Process recurring cards
    const { data: recurringCards, error: recurringError } = await supabase
      .from('recurring_cards')
      .select('*')
      .eq('enabled', true)
      .lte('next_creation_at', now.toISOString());

    if (recurringError) {
      console.error('Error fetching recurring cards:', recurringError);
      throw recurringError;
    }

    console.log(`Found ${recurringCards?.length || 0} recurring cards to process`);

    for (const recurringCard of recurringCards || []) {
      try {
        // Check if end_date has passed
        if (recurringCard.end_date) {
          const endDate = new Date(recurringCard.end_date);
          if (now > endDate) {
            console.log(`Recurring card ${recurringCard.id} has passed its end date. Disabling...`);
            
            // Disable the recurring card
            await supabase
              .from('recurring_cards')
              .update({ enabled: false })
              .eq('id', recurringCard.id);
            
            // Log the action
            await supabase.from('automation_logs').insert({
              board_id: recurringCard.board_id,
              automation_id: recurringCard.id,
              automation_type: 'recurring_card',
              action: 'disabled_by_end_date',
              status: 'success',
              metadata: {
                title: recurringCard.title,
                end_date: recurringCard.end_date
              }
            });
            
            continue; // Skip to next card
          }
        }

        console.log(`Processing recurring card: ${recurringCard.id} - ${recurringCard.title}`);

        // Get the next position in the list
        const { data: existingCards } = await supabase
          .from('project_cards')
          .select('position')
          .eq('list_id', recurringCard.list_id)
          .order('position', { ascending: false })
          .limit(1);

        const nextPosition = existingCards && existingCards.length > 0 
          ? existingCards[0].position + 1 
          : 0;

        // Get template config
        const config = typeof recurringCard.template_config === 'object' && recurringCard.template_config !== null
          ? recurringCard.template_config as Record<string, any>
          : {};

        // Calculate dates if offsets are provided
        const creationDate = new Date();
        const startDate = config.start_date_offset > 0
          ? new Date(creationDate.getTime() + config.start_date_offset * 24 * 60 * 60 * 1000)
          : null;
        const dueDate = config.due_date_offset > 0
          ? new Date(creationDate.getTime() + config.due_date_offset * 24 * 60 * 60 * 1000)
          : null;

        // Create the card with all properties
        const { data: newCard, error: cardError } = await supabase
          .from('project_cards')
          .insert({
            list_id: recurringCard.list_id,
            title: recurringCard.title,
            description: recurringCard.description,
            position: nextPosition,
            status: 'todo',
            priority: config.priority || 'medium',
            start_date: startDate?.toISOString(),
            due_date: dueDate?.toISOString(),
            estimated_hours: config.estimated_hours || null,
            client_id: config.client_id || null,
            archived: false,
            watching: false,
            created_by: '00000000-0000-0000-0000-000000000000',
          })
          .select()
          .single();

        if (cardError) {
          console.error('Error creating card:', cardError);
          throw cardError;
        }

        console.log(`Created card: ${newCard.id}`);

        // Add labels if specified
        if (Array.isArray(config.label_ids) && config.label_ids.length > 0) {
          const labelInserts = config.label_ids.map((labelId: string) => ({
            card_id: newCard.id,
            label_id: labelId,
          }));
          
          const { error: labelsError } = await supabase
            .from('project_card_labels')
            .insert(labelInserts);
            
          if (labelsError) {
            console.error('Error adding labels:', labelsError);
          }
        }

        // Add assignees if specified
        if (Array.isArray(config.assignee_ids) && config.assignee_ids.length > 0) {
          const assigneeInserts = config.assignee_ids.map((memberId: string) => ({
            card_id: newCard.id,
            member_id: memberId,
          }));
          
          const { error: assigneesError } = await supabase
            .from('project_card_assignees')
            .insert(assigneeInserts);
            
          if (assigneesError) {
            console.error('Error adding assignees:', assigneesError);
          }
        }

        // Calculate next creation time
        let nextCreation = new Date(recurringCard.next_creation_at);
        
        // Extract the configured time before any date manipulation
        const [hours, minutes] = (recurringCard.time_of_day || '09:00').split(':').map(Number);

        if (recurringCard.frequency === 'daily') {
          // Check if days_of_week is configured
          const config = typeof recurringCard.template_config === 'object' && recurringCard.template_config !== null
            ? recurringCard.template_config as Record<string, any>
            : {};
          const daysOfWeek = Array.isArray(config.days_of_week) ? config.days_of_week : [];
          
          if (daysOfWeek.length > 0) {
            // Find next occurrence based on selected days
            const sortedDays = [...daysOfWeek].sort((a: number, b: number) => a - b);
            
            // Try to find the next valid day starting from tomorrow
            for (let i = 1; i <= 7; i++) {
              const testDate = new Date(nextCreation);
              testDate.setDate(testDate.getDate() + i);
              
              if (sortedDays.includes(testDate.getUTCDay())) {
                nextCreation = testDate;
                break;
              }
            }
          } else {
            // No specific days configured, create daily
            nextCreation.setDate(nextCreation.getDate() + 1);
          }
        } else if (recurringCard.frequency === 'weekly') {
          nextCreation.setDate(nextCreation.getDate() + 7);
        } else if (recurringCard.frequency === 'biweekly') {
          nextCreation.setDate(nextCreation.getDate() + 14);
        } else if (recurringCard.frequency === 'monthly') {
          // For monthly, preserve the target day of month
          const targetDay = recurringCard.day_of_month || 1;
          nextCreation.setMonth(nextCreation.getMonth() + 1);
          nextCreation.setDate(targetDay);
        }

        // Set the time AFTER all date calculations using UTC to avoid timezone issues
        nextCreation.setUTCHours(hours, minutes, 0, 0);

        // Update recurring card
        const { error: updateError } = await supabase
          .from('recurring_cards')
          .update({
            last_created_at: now.toISOString(),
            next_creation_at: nextCreation.toISOString(),
          })
          .eq('id', recurringCard.id);

        if (updateError) {
          console.error('Error updating recurring card:', updateError);
          throw updateError;
        }

        // Log success
        await supabase.from('automation_logs').insert({
          board_id: recurringCard.board_id,
          automation_type: 'recurring',
          automation_id: recurringCard.id,
          action: `Created card: ${newCard.title}`,
          status: 'success',
          metadata: {
            card_id: newCard.id,
            next_creation: nextCreation.toISOString(),
          },
        });

        console.log(`Successfully processed recurring card: ${recurringCard.id}`);
      } catch (error: any) {
        console.error(`Error processing recurring card ${recurringCard.id}:`, error);
        
        // Log error
        await supabase.from('automation_logs').insert({
          board_id: recurringCard.board_id,
          automation_type: 'recurring',
          automation_id: recurringCard.id,
          action: `Failed to create card: ${recurringCard.title}`,
          status: 'error',
          error_message: error.message,
        });
      }
    }

    // Process scheduled cards
    const { data: scheduledCards, error: scheduledError } = await supabase
      .from('scheduled_cards')
      .select('*')
      .eq('executed', false)
      .lte('scheduled_for', now.toISOString());

    if (scheduledError) {
      console.error('Error fetching scheduled cards:', scheduledError);
      throw scheduledError;
    }

    console.log(`Found ${scheduledCards?.length || 0} scheduled cards to process`);

    for (const scheduledCard of scheduledCards || []) {
      try {
        console.log(`Processing scheduled card: ${scheduledCard.id} - ${scheduledCard.title}`);

        const { data: existingCards } = await supabase
          .from('project_cards')
          .select('position')
          .eq('list_id', scheduledCard.list_id)
          .order('position', { ascending: false })
          .limit(1);

        const nextPosition = existingCards && existingCards.length > 0 
          ? existingCards[0].position + 1 
          : 0;

        // Get template config
        const config = typeof scheduledCard.template_config === 'object' && scheduledCard.template_config !== null
          ? scheduledCard.template_config as Record<string, any>
          : {};

        // Calculate dates if offsets are provided
        const creationDate = new Date();
        const startDate = config.start_date_offset > 0
          ? new Date(creationDate.getTime() + config.start_date_offset * 24 * 60 * 60 * 1000)
          : null;
        const dueDate = config.due_date_offset > 0
          ? new Date(creationDate.getTime() + config.due_date_offset * 24 * 60 * 60 * 1000)
          : null;

        const { data: newCard, error: cardError } = await supabase
          .from('project_cards')
          .insert({
            list_id: scheduledCard.list_id,
            title: scheduledCard.title,
            description: scheduledCard.description,
            position: nextPosition,
            status: 'todo',
            priority: config.priority || 'medium',
            start_date: startDate?.toISOString(),
            due_date: dueDate?.toISOString(),
            estimated_hours: config.estimated_hours || null,
            client_id: config.client_id || null,
            archived: false,
            watching: false,
            created_by: '00000000-0000-0000-0000-000000000000',
          })
          .select()
          .single();

        if (cardError) {
          console.error('Error creating scheduled card:', cardError);
          throw cardError;
        }

        // Add labels if specified
        if (Array.isArray(config.label_ids) && config.label_ids.length > 0) {
          const labelInserts = config.label_ids.map((labelId: string) => ({
            card_id: newCard.id,
            label_id: labelId,
          }));
          
          const { error: labelsError } = await supabase
            .from('project_card_labels')
            .insert(labelInserts);
            
          if (labelsError) {
            console.error('Error adding labels:', labelsError);
          }
        }

        // Add assignees if specified
        if (Array.isArray(config.assignee_ids) && config.assignee_ids.length > 0) {
          const assigneeInserts = config.assignee_ids.map((memberId: string) => ({
            card_id: newCard.id,
            member_id: memberId,
          }));
          
          const { error: assigneesError } = await supabase
            .from('project_card_assignees')
            .insert(assigneeInserts);
            
          if (assigneesError) {
            console.error('Error adding assignees:', assigneesError);
          }
        }

        const { error: updateError } = await supabase
          .from('scheduled_cards')
          .update({
            executed: true,
            executed_at: now.toISOString(),
          })
          .eq('id', scheduledCard.id);

        if (updateError) {
          console.error('Error updating scheduled card:', updateError);
          throw updateError;
        }

        await supabase.from('automation_logs').insert({
          board_id: scheduledCard.board_id,
          automation_type: 'scheduled',
          automation_id: scheduledCard.id,
          action: `Created card: ${newCard.title}`,
          status: 'success',
          metadata: { card_id: newCard.id },
        });

        console.log(`Successfully processed scheduled card: ${scheduledCard.id}`);
      } catch (error: any) {
        console.error(`Error processing scheduled card ${scheduledCard.id}:`, error);
        
        await supabase.from('automation_logs').insert({
          board_id: scheduledCard.board_id,
          automation_type: 'scheduled',
          automation_id: scheduledCard.id,
          action: `Failed to create card: ${scheduledCard.title}`,
          status: 'error',
          error_message: error.message,
        });
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        processed: {
          recurring: recurringCards?.length || 0,
          scheduled: scheduledCards?.length || 0,
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error('Error in process-automations:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
