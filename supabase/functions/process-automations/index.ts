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
        // TEMPORAL PROTECTION: Skip if card was created less than 1 hour ago
        if (recurringCard.last_created_at) {
          const lastCreated = new Date(recurringCard.last_created_at);
          const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
          
          if (lastCreated > oneHourAgo) {
            console.log(`Skipping recurring card ${recurringCard.id} - created less than 1 hour ago`);
            continue;
          }
        }

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

        // IDEMPOTENCY CHECK: Verify if a card with the same title was created in the last 24 hours
        const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const { data: recentCards } = await supabase
          .from('project_cards')
          .select('id, created_at')
          .eq('list_id', recurringCard.list_id)
          .eq('title', recurringCard.title)
          .gte('created_at', twentyFourHoursAgo.toISOString())
          .limit(1);

        if (recentCards && recentCards.length > 0) {
          console.log(`Skipping recurring card ${recurringCard.id} - card with same title already exists (created at ${recentCards[0].created_at})`);
          
          // Log the duplicate prevention
          await supabase.from('automation_logs').insert({
            board_id: recurringCard.board_id,
            automation_id: recurringCard.id,
            automation_type: 'recurring_card',
            action: 'duplicate_prevented',
            status: 'success',
            metadata: {
              title: recurringCard.title,
              existing_card_id: recentCards[0].id,
              existing_card_created_at: recentCards[0].created_at
            }
          });
          
          continue;
        }

        // Calculate next creation time BEFORE creating the card
        let nextCreation = new Date(recurringCard.next_creation_at);
        const [hours, minutes] = (recurringCard.time_of_day || '09:00').split(':').map(Number);

        // Get template config for frequency calculation
        const config = typeof recurringCard.template_config === 'object' && recurringCard.template_config !== null
          ? recurringCard.template_config as Record<string, any>
          : {};

        if (recurringCard.frequency === 'daily') {
          const daysOfWeek = Array.isArray((config as any).utc_days_of_week)
            ? (config as any).utc_days_of_week
            : (Array.isArray((config as any).days_of_week) ? (config as any).days_of_week : []);
          
          if (daysOfWeek.length > 0) {
            const sortedDays = [...daysOfWeek].sort((a: number, b: number) => a - b);
            for (let i = 1; i <= 7; i++) {
              const testDate = new Date(nextCreation);
              testDate.setDate(testDate.getDate() + i);
              if (sortedDays.includes(testDate.getUTCDay())) {
                nextCreation = testDate;
                break;
              }
            }
          } else {
            nextCreation.setDate(nextCreation.getDate() + 1);
          }
        } else if (recurringCard.frequency === 'weekly') {
          nextCreation.setDate(nextCreation.getDate() + 7);
        } else if (recurringCard.frequency === 'biweekly') {
          const firstDay = typeof config.biweekly_first_day === 'number' ? config.biweekly_first_day : 5;
          const secondDay = typeof config.biweekly_second_day === 'number' ? config.biweekly_second_day : 20;
          const currentDay = nextCreation.getDate();
          const currentMonth = nextCreation.getMonth();
          
          if (currentDay === firstDay) {
            nextCreation.setDate(secondDay);
          } else if (currentDay === secondDay) {
            nextCreation.setMonth(currentMonth + 1);
            nextCreation.setDate(firstDay);
          } else {
            if (currentDay < firstDay) {
              nextCreation.setDate(firstDay);
            } else if (currentDay < secondDay) {
              nextCreation.setDate(secondDay);
            } else {
              nextCreation.setMonth(currentMonth + 1);
              nextCreation.setDate(firstDay);
            }
          }
        } else if (recurringCard.frequency === 'monthly') {
          const targetDay = recurringCard.day_of_month || 1;
          nextCreation.setMonth(nextCreation.getMonth() + 1);
          nextCreation.setDate(targetDay);
        }

        // Set the time
        nextCreation.setUTCHours(hours, minutes, 0, 0);

        // Check if next_creation_at would be after end_date
        if (recurringCard.end_date) {
          const endDate = new Date(recurringCard.end_date);
          if (nextCreation > endDate) {
            console.log(`Next creation would be after end_date. Disabling automation.`);
            await supabase
              .from('recurring_cards')
              .update({ 
                enabled: false,
                last_created_at: now.toISOString()
              })
              .eq('id', recurringCard.id);
            
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
            
            continue;
          }
        }

        // UPDATE next_creation_at BEFORE creating the card (prevents race conditions)
        const { error: updateBeforeError } = await supabase
          .from('recurring_cards')
          .update({
            next_creation_at: nextCreation.toISOString(),
            last_created_at: now.toISOString(),
          })
          .eq('id', recurringCard.id);

        if (updateBeforeError) {
          console.error('Error updating recurring card before creation:', updateBeforeError);
          throw updateBeforeError;
        }

        console.log(`Updated next_creation_at to ${nextCreation.toISOString()} before card creation`);

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
        // Reuse config from earlier calculation
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
          // First, verify which member IDs actually exist in project_members
          const { data: existingMembers, error: membersCheckError } = await supabase
            .from('project_members')
            .select('id')
            .in('id', config.assignee_ids);
          
          if (membersCheckError) {
            console.error('Error checking members:', membersCheckError);
          } else if (existingMembers && existingMembers.length > 0) {
            const validMemberIds = existingMembers.map(m => m.id);
            const assigneeInserts = validMemberIds.map((memberId: string) => ({
              card_id: newCard.id,
              member_id: memberId,
            }));
            
            const { error: assigneesError } = await supabase
              .from('project_card_assignees')
              .insert(assigneeInserts);
              
            if (assigneesError) {
              console.error('Error adding assignees:', assigneesError);
            } else {
              console.log(`Added ${validMemberIds.length} assignees to card`);
            }
            
            // Log if some members were not found
            const missingMembers = config.assignee_ids.filter((id: string) => !validMemberIds.includes(id));
            if (missingMembers.length > 0) {
              console.log(`Warning: ${missingMembers.length} member(s) not found in project_members:`, missingMembers);
            }
          } else {
            console.log('No valid members found for assignment');
          }
        }

        // Add checklist from template if specified
        if (config.checklist_template_id) {
          console.log(`Creating checklist from template: ${config.checklist_template_id}`);
          
          // Fetch the template
          const { data: template, error: templateError } = await supabase
            .from('checklist_templates')
            .select('id, title')
            .eq('id', config.checklist_template_id)
            .single();
          
          if (templateError) {
            console.error('Error fetching checklist template:', templateError);
          } else if (template) {
            // Create the checklist
            const { data: newChecklist, error: checklistError } = await supabase
              .from('project_checklists')
              .insert({
                card_id: newCard.id,
                title: template.title,
                position: 0,
              })
              .select()
              .single();
            
            if (checklistError) {
              console.error('Error creating checklist:', checklistError);
            } else {
              console.log(`Created checklist: ${newChecklist.id}`);
              
              // Fetch template items
              const { data: templateItems, error: itemsError } = await supabase
                .from('checklist_template_items')
                .select('*')
                .eq('template_id', template.id)
                .order('position', { ascending: true });
              
              if (itemsError) {
                console.error('Error fetching template items:', itemsError);
              } else if (templateItems && templateItems.length > 0) {
                // Create checklist items
                const itemInserts = templateItems.map((item: any) => ({
                  checklist_id: newChecklist.id,
                  text: item.text,
                  position: item.position,
                  completed: false,
                }));
                
                const { error: itemsInsertError } = await supabase
                  .from('project_checklist_items')
                  .insert(itemInserts);
                
                if (itemsInsertError) {
                  console.error('Error creating checklist items:', itemsInsertError);
                } else {
                  console.log(`Created ${itemInserts.length} checklist items`);
                }
              }
            }
          }
        }

        // next_creation_at already updated before card creation

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
          // First, verify which member IDs actually exist in project_members
          const { data: existingMembers, error: membersCheckError } = await supabase
            .from('project_members')
            .select('id')
            .in('id', config.assignee_ids);
          
          if (membersCheckError) {
            console.error('Error checking members:', membersCheckError);
          } else if (existingMembers && existingMembers.length > 0) {
            const validMemberIds = existingMembers.map(m => m.id);
            const assigneeInserts = validMemberIds.map((memberId: string) => ({
              card_id: newCard.id,
              member_id: memberId,
            }));
            
            const { error: assigneesError } = await supabase
              .from('project_card_assignees')
              .insert(assigneeInserts);
              
            if (assigneesError) {
              console.error('Error adding assignees:', assigneesError);
            } else {
              console.log(`Added ${validMemberIds.length} assignees to card`);
            }
            
            // Log if some members were not found
            const missingMembers = config.assignee_ids.filter((id: string) => !validMemberIds.includes(id));
            if (missingMembers.length > 0) {
              console.log(`Warning: ${missingMembers.length} member(s) not found in project_members:`, missingMembers);
            }
          } else {
            console.log('No valid members found for assignment');
          }
        }

        // Add checklist from template if specified
        if (config.checklist_template_id) {
          console.log(`Creating checklist from template: ${config.checklist_template_id}`);
          
          // Fetch the template
          const { data: template, error: templateError } = await supabase
            .from('checklist_templates')
            .select('id, title')
            .eq('id', config.checklist_template_id)
            .single();
          
          if (templateError) {
            console.error('Error fetching checklist template:', templateError);
          } else if (template) {
            // Create the checklist
            const { data: newChecklist, error: checklistError } = await supabase
              .from('project_checklists')
              .insert({
                card_id: newCard.id,
                title: template.title,
                position: 0,
              })
              .select()
              .single();
            
            if (checklistError) {
              console.error('Error creating checklist:', checklistError);
            } else {
              console.log(`Created checklist: ${newChecklist.id}`);
              
              // Fetch template items
              const { data: templateItems, error: itemsError } = await supabase
                .from('checklist_template_items')
                .select('*')
                .eq('template_id', template.id)
                .order('position', { ascending: true });
              
              if (itemsError) {
                console.error('Error fetching template items:', itemsError);
              } else if (templateItems && templateItems.length > 0) {
                // Create checklist items
                const itemInserts = templateItems.map((item: any) => ({
                  checklist_id: newChecklist.id,
                  text: item.text,
                  position: item.position,
                  completed: false,
                }));
                
                const { error: itemsInsertError } = await supabase
                  .from('project_checklist_items')
                  .insert(itemInserts);
                
                if (itemsInsertError) {
                  console.error('Error creating checklist items:', itemsInsertError);
                } else {
                  console.log(`Created ${itemInserts.length} checklist items`);
                }
              }
            }
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

    // Process auto-archive for lists with auto_archive_after_days configured
    console.log('Processing auto-archive for lists...');
    
    const { data: listsWithAutoArchive, error: listsError } = await supabase
      .from('project_lists')
      .select('id, board_id, title, rules')
      .eq('archived', false);

    if (listsError) {
      console.error('Error fetching lists for auto-archive:', listsError);
    }

    let autoArchivedCount = 0;
    
    for (const list of listsWithAutoArchive || []) {
      try {
        // Parse rules to get auto_archive_after_days
        const rules = typeof list.rules === 'string' 
          ? JSON.parse(list.rules || '{}') 
          : (list.rules || {});
        
        const autoArchiveDays = rules?.auto_archive_after_days;
        
        if (!autoArchiveDays || autoArchiveDays <= 0) continue;
        
        console.log(`List "${list.title}" has auto-archive after ${autoArchiveDays} days`);
        
        // Calculate the cutoff date
        const cutoffDate = new Date(now.getTime() - autoArchiveDays * 24 * 60 * 60 * 1000);
        
        // Find cards that have been in this list longer than the configured days
        const { data: cardsToArchive, error: cardsError } = await supabase
          .from('project_cards')
          .select('id, title, moved_to_list_at')
          .eq('list_id', list.id)
          .eq('archived', false)
          .lte('moved_to_list_at', cutoffDate.toISOString());
        
        if (cardsError) {
          console.error(`Error fetching cards for list ${list.id}:`, cardsError);
          continue;
        }
        
        if (!cardsToArchive || cardsToArchive.length === 0) continue;
        
        console.log(`Found ${cardsToArchive.length} cards to auto-archive in list "${list.title}"`);
        
        // Archive each card
        for (const card of cardsToArchive) {
          const { error: archiveError } = await supabase
            .from('project_cards')
            .update({ archived: true })
            .eq('id', card.id);
          
          if (archiveError) {
            console.error(`Error archiving card ${card.id}:`, archiveError);
            continue;
          }
          
          autoArchivedCount++;
          console.log(`Auto-archived card: ${card.title}`);
          
          // Log the action
          await supabase.from('automation_logs').insert({
            board_id: list.board_id,
            automation_type: 'auto_archive',
            automation_id: list.id,
            action: `Auto-archived card: ${card.title}`,
            status: 'success',
            metadata: {
              card_id: card.id,
              card_title: card.title,
              days_in_list: autoArchiveDays,
              moved_to_list_at: card.moved_to_list_at
            }
          });
        }
      } catch (error: any) {
        console.error(`Error processing auto-archive for list ${list.id}:`, error);
      }
    }
    
    console.log(`Auto-archived ${autoArchivedCount} cards total`);

    return new Response(
      JSON.stringify({ 
        success: true,
        processed: {
          recurring: recurringCards?.length || 0,
          scheduled: scheduledCards?.length || 0,
          auto_archived: autoArchivedCount,
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
