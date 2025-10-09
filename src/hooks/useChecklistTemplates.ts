import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ChecklistTemplate, ChecklistTemplateItem } from "@/types/projects";
import { useToast } from "@/hooks/use-toast";

export const useChecklistTemplates = (boardId?: string) => {
  const [templates, setTemplates] = useState<ChecklistTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchTemplates = async () => {
    try {
      setIsLoading(true);
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      // Fetch templates (user-owned OR global OR board-specific)
      const orFilters = [
        `user_id.eq.${user.user.id}`,
        `is_global.eq.true`,
        ...(boardId ? [`board_id.eq.${boardId}`] : []),
      ];
      const { data: templatesData, error: templatesError } = await supabase
        .from('checklist_templates')
        .select('*')
        .or(orFilters.join(','))
        .order('position', { ascending: true, nullsFirst: false })
        .order('created_at', { ascending: false });

      if (templatesError) throw templatesError;

      // Fetch items for all templates
      const templateIds = templatesData?.map(t => t.id) || [];
      const { data: itemsData, error: itemsError } = await supabase
        .from('checklist_template_items')
        .select('*')
        .in('template_id', templateIds)
        .order('position', { ascending: true });

      if (itemsError) throw itemsError;

      // Group items by template
      const itemsByTemplate = (itemsData || []).reduce((acc, item) => {
        if (!acc[item.template_id]) acc[item.template_id] = [];
        acc[item.template_id].push({
          id: item.id,
          templateId: item.template_id,
          text: item.text,
          position: item.position,
          createdAt: item.created_at,
          updatedAt: item.updated_at,
        });
        return acc;
      }, {} as Record<string, ChecklistTemplateItem[]>);

      // Combine templates with items
      const combinedTemplates: ChecklistTemplate[] = (templatesData || []).map(template => ({
        id: template.id,
        userId: template.user_id,
        boardId: template.board_id || undefined,
        title: template.title,
        description: template.description || undefined,
        isGlobal: template.is_global,
        items: itemsByTemplate[template.id] || [],
        createdAt: template.created_at,
        updatedAt: template.updated_at,
      }));

      setTemplates(combinedTemplates);
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast({
        title: "Erro ao carregar templates",
        description: "Não foi possível carregar os templates de checklists.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, [boardId]);

  const createTemplate = async (
    title: string,
    items: string[],
    description?: string,
    isGlobal: boolean = true,
    templateBoardId?: string
  ) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      // Insert template
      const { data: template, error: templateError } = await supabase
        .from('checklist_templates')
        .insert({
          user_id: user.user.id,
          board_id: templateBoardId || null,
          title,
          description: description || null,
          is_global: isGlobal,
        })
        .select()
        .single();

      if (templateError) throw templateError;

      // Insert items
      const itemsToInsert = items.map((text, index) => ({
        template_id: template.id,
        text,
        position: index,
      }));

      const { error: itemsError } = await supabase
        .from('checklist_template_items')
        .insert(itemsToInsert);

      if (itemsError) throw itemsError;

      toast({
        title: "Template criado",
        description: `Template "${title}" criado com sucesso.`,
      });

      await fetchTemplates();
      return template.id;
    } catch (error) {
      console.error('Error creating template:', error);
      toast({
        title: "Erro ao criar template",
        description: "Não foi possível criar o template.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateTemplate = async (
    templateId: string,
    title: string,
    items: Array<{ id?: string; text: string }>,
    description?: string,
    isGlobal?: boolean
  ) => {
    try {
      // Update template
      const updateData: any = { title };
      if (description !== undefined) updateData.description = description;
      if (isGlobal !== undefined) updateData.is_global = isGlobal;

      const { error: templateError } = await supabase
        .from('checklist_templates')
        .update(updateData)
        .eq('id', templateId);

      if (templateError) throw templateError;

      // Get existing items
      const { data: existingItems } = await supabase
        .from('checklist_template_items')
        .select('id')
        .eq('template_id', templateId);

      const existingIds = new Set((existingItems || []).map(i => i.id));
      const keptIds = new Set(items.filter(i => i.id).map(i => i.id!));

      // Delete removed items
      const toDelete = Array.from(existingIds).filter(id => !keptIds.has(id));
      if (toDelete.length > 0) {
        await supabase
          .from('checklist_template_items')
          .delete()
          .in('id', toDelete);
      }

      // Update or insert items
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.id) {
          // Update existing
          await supabase
            .from('checklist_template_items')
            .update({ text: item.text, position: i })
            .eq('id', item.id);
        } else {
          // Insert new
          await supabase
            .from('checklist_template_items')
            .insert({
              template_id: templateId,
              text: item.text,
              position: i,
            });
        }
      }

      toast({
        title: "Template atualizado",
        description: "Template atualizado com sucesso.",
      });

      await fetchTemplates();
    } catch (error) {
      console.error('Error updating template:', error);
      toast({
        title: "Erro ao atualizar template",
        description: "Não foi possível atualizar o template.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteTemplate = async (templateId: string) => {
    try {
      const { error } = await supabase
        .from('checklist_templates')
        .delete()
        .eq('id', templateId);

      if (error) throw error;

      toast({
        title: "Template excluído",
        description: "Template excluído com sucesso.",
      });

      await fetchTemplates();
    } catch (error) {
      console.error('Error deleting template:', error);
      toast({
        title: "Erro ao excluir template",
        description: "Não foi possível excluir o template.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const reorderTemplates = async (reorderedTemplates: Array<{ id: string; position: number }>) => {
    try {
      // Update positions in batch
      const updates = reorderedTemplates.map(({ id, position }) =>
        supabase
          .from('checklist_templates')
          .update({ position })
          .eq('id', id)
      );

      await Promise.all(updates);

      // Refresh templates to reflect new order
      await fetchTemplates();
    } catch (error) {
      console.error('Error reordering templates:', error);
      toast({
        title: "Erro ao reordenar templates",
        description: "Não foi possível reordenar os templates.",
        variant: "destructive",
      });
    }
  };

  return {
    templates,
    isLoading,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    reorderTemplates,
    refreshTemplates: fetchTemplates,
  };
};
