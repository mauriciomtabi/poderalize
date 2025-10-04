import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { Member } from "@/types/projects";
import { Users } from "lucide-react";
import { getInitials } from "@/lib/utils";

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

  // Sync tempSelected when dialog opens or selectedMembers change
  useEffect(() => {
    if (isOpen) {
      setTempSelected(selectedMembers);
    }
  }, [isOpen, selectedMembers]);

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
          {availableMembers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Nenhum membro no projeto ainda.</p>
              <p className="text-xs mt-1">Adicione colaboradores ao quadro para atribuí-los aos cartões.</p>
            </div>
          ) : (
            availableMembers.map(member => {
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