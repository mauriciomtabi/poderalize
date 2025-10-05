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

        // Create the card
        const { data: newCard, error: cardError } = await supabase
          .from('project_cards')
          .insert({
            list_id: recurringCard.list_id,
            title: recurringCard.title,
            description: recurringCard.description,
            position: nextPosition,
            status: 'todo',
            priority: 'medium',
            archived: false,
            watching: false,
            created_by: '00000000-0000-0000-0000-000000000000', // System user
          })
          .select()
          .single();

        if (cardError) {
          console.error('Error creating card:', cardError);
          throw cardError;
        }

        console.log(`Created card: ${newCard.id}`);

        // Calculate next creation time
        let nextCreation = new Date(recurringCard.next_creation_at);
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
            const currentDay = nextCreation.getDay();
            
            // Find next day from the selected days
            let nextDay = sortedDays.find((day: number) => day > currentDay);
            
            // If no day found after current day, wrap to first day of next week
            if (nextDay === undefined) {
              nextDay = sortedDays[0];
              const daysToAdd = (7 - currentDay + nextDay) % 7;
              nextCreation.setDate(nextCreation.getDate() + (daysToAdd || 7));
            } else {
              nextCreation.setDate(nextCreation.getDate() + (nextDay - currentDay));
            }
          } else {
            // No specific days configured, create daily
            nextCreation.setDate(nextCreation.getDate() + 1);
          }
        } else if (recurringCard.frequency === 'weekly') {
          nextCreation.setDate(nextCreation.getDate() + 7);
        } else if (recurringCard.frequency === 'monthly') {
          nextCreation.setMonth(nextCreation.getMonth() + 1);
        }

        nextCreation.setHours(hours, minutes, 0, 0);

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

        const { data: newCard, error: cardError } = await supabase
          .from('project_cards')
          .insert({
            list_id: scheduledCard.list_id,
            title: scheduledCard.title,
            description: scheduledCard.description,
            position: nextPosition,
            status: 'todo',
            priority: 'medium',
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
