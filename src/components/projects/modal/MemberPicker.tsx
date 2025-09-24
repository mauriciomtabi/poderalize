import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { Member } from "@/types/projects";
import { Users } from "lucide-react";

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
        </DialogHeader>
        
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {availableMembers.map(member => {
            const isSelected = tempSelected.some(m => m.id === member.id);
            return (
              <div 
                key={member.id} 
                className="flex items-center space-x-3 p-2 rounded hover:bg-muted cursor-pointer"
                onClick={() => handleToggleMember(member)}
              >
                <Checkbox checked={isSelected} onChange={() => {}} />
                <Avatar className="h-8 w-8">
                  <AvatarImage src={member.avatar} />
                  <AvatarFallback className="text-xs">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-sm">{member.name}</p>
                  <p className="text-xs text-muted-foreground">{member.role}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={handleCancel}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>
            Salvar ({tempSelected.length})
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};