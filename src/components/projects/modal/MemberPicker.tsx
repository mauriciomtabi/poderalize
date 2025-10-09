import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { Member } from "@/types/projects";
import { Users } from "lucide-react";
import { getInitials } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useProjects } from "@/contexts/ProjectsContext";

interface MemberPickerProps {
  isOpen: boolean;
  onClose: () => void;
  availableMembers: Member[];
  selectedMembers: Member[];
  onMembersChange: (members: Member[]) => void;
}

export const MemberPicker = ({
  isOpen,
  onClose,
  availableMembers,
  selectedMembers,
  onMembersChange
}: MemberPickerProps) => {
  const [tempSelected, setTempSelected] = useState<Member[]>(selectedMembers);
  const [allMembers, setAllMembers] = useState<Member[]>(availableMembers);
  const { state } = useProjects();

  // Load ALL active colaboradores when dialog opens
  useEffect(() => {
    const loadAllMembers = async () => {
      if (!isOpen || !state.currentBoard?.id) return;

      try {
        // Get current user
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        if (!currentUser) return;

        // Fetch all active colaboradores
        const { data: colaboradoresData } = await supabase
          .from('colaboradores')
          .select('*')
          .eq('status', 'ativo');

        if (!colaboradoresData || colaboradoresData.length === 0) return;

        // Fetch profiles
        const userIds = colaboradoresData.map(c => c.user_id).filter(Boolean);
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('user_id, avatar_url, full_name, email')
          .in('user_id', userIds.length ? userIds : ['00000000-0000-0000-0000-000000000000']);

        // Upsert all colaboradores as project members to ensure they exist in the board
        const membersToUpsert = colaboradoresData
          .filter(c => c.user_id)
          .map(c => {
            const profile = profilesData?.find(p => p.user_id === c.user_id);
            return {
              board_id: state.currentBoard!.id,
              user_id: c.user_id,
              name: c.nome || profile?.full_name || profile?.email || 'Usuário',
              email: c.email || profile?.email || '',
              avatar: profile?.avatar_url,
              role: 'member',
              added_by: currentUser.id
            };
          });

        // Upsert all members (insert if not exists, update if exists)
        if (membersToUpsert.length > 0) {
          await supabase
            .from('project_members')
            .upsert(membersToUpsert, { 
              onConflict: 'board_id,user_id',
              ignoreDuplicates: false 
            });
        }

        // Now fetch all project_members with correct IDs
        const { data: projectMembers } = await supabase
          .from('project_members')
          .select('*')
          .eq('board_id', state.currentBoard.id);

        if (!projectMembers) return;

        // Build members list using project_members.id
        const members: Member[] = projectMembers.map(pm => ({
          id: pm.id, // Always use project_members.id
          name: pm.name,
          email: pm.email,
          avatar: pm.avatar || undefined,
          role: pm.role as any
        }));

        setAllMembers(members);
      } catch (error) {
        console.error('Error loading all members:', error);
        setAllMembers(availableMembers);
      }
    };

    if (isOpen) {
      setTempSelected(selectedMembers);
      loadAllMembers();
    }
  }, [isOpen, selectedMembers, state.currentBoard?.id, availableMembers]);

  const handleToggleMember = (member: Member) => {
    const isSelected = tempSelected.some(m => m.id === member.id);
    if (isSelected) {
      setTempSelected(tempSelected.filter(m => m.id !== member.id));
    } else {
      setTempSelected([...tempSelected, member]);
    }
  };

  const handleSave = () => {
    onMembersChange(tempSelected);
    onClose();
  };

  const handleCancel = () => {
    setTempSelected(selectedMembers);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Selecionar Membros
          </DialogTitle>
          <DialogDescription>
            Escolha os membros que deseja atribuir ao cartão.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 max-h-96 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
          {allMembers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Nenhum colaborador ativo ainda.</p>
              <p className="text-xs mt-1">Adicione colaboradores no sistema para atribuí-los aos cartões.</p>
            </div>
          ) : (
            allMembers.map(member => {
              const isSelected = tempSelected.some(m => m.id === member.id);
              const avatarSrc = member.avatar && /^(https?:)?\/\//.test(member.avatar) 
                ? member.avatar 
                : undefined;
              
              return (
                <div 
                  key={member.id} 
                  className="flex items-center space-x-3 p-2 rounded hover:bg-muted cursor-pointer"
                  onClick={(e) => { e.stopPropagation(); handleToggleMember(member); }}
                >
                  <Checkbox checked={isSelected} onChange={() => {}} />
                  <Avatar className="h-8 w-8">
                    {avatarSrc && <AvatarImage src={avatarSrc} alt={member.name} />}
                    <AvatarFallback className="text-xs">
                      {getInitials(member.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm">{member.name}</p>
                    <p className="text-xs text-muted-foreground">{member.role}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={(e) => { e.stopPropagation(); handleCancel(); }}>
            Cancelar
          </Button>
          <Button onClick={(e) => { e.stopPropagation(); handleSave(); }}>
            Salvar ({tempSelected.length})
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};