import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { 
  Paperclip, 
  Upload, 
  File, 
  Image, 
  Download,
  Trash2,
  Plus,
  Link
} from "lucide-react";
import { ProjectCard, Attachment } from "@/types/projects";
import { useProjects } from "@/contexts/ProjectsContext";
import { cn } from "@/lib/utils";

interface AttachmentManagerProps {
  isOpen: boolean;
  onClose: () => void;
  card: ProjectCard;
}

export const AttachmentManager = ({
  isOpen,
  onClose,
  card,
}: AttachmentManagerProps) => {
  const { actions } = useProjects();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isAddingLink, setIsAddingLink] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkName, setLinkName] = useState("");

  const handleFileUpload = (files: FileList) => {
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const attachment: Attachment = {
          id: `attachment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: file.name,
          url: e.target?.result as string,
          type: file.type,
          size: file.size,
          uploadedAt: new Date().toISOString(),
          uploadedBy: "user-1" // TODO: Get from current user
        };
        
        const updatedCard = {
          ...card,
          attachments: [...(card.attachments || []), attachment]
        };
        
        actions.updateCard(updatedCard);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleAddLink = () => {
    if (linkUrl.trim()) {
      const attachment: Attachment = {
        id: `link-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: linkName.trim() || linkUrl,
        url: linkUrl.trim(),
        type: "link",
        size: 0,
        uploadedAt: new Date().toISOString(),
        uploadedBy: "user-1" // TODO: Get from current user
      };
      
      const updatedCard = {
        ...card,
        attachments: [...(card.attachments || []), attachment]
      };
      
      actions.updateCard(updatedCard);
      setLinkUrl("");
      setLinkName("");
      setIsAddingLink(false);
    }
  };

  const handleRemoveAttachment = (attachmentId: string) => {
    const updatedCard = {
      ...card,
      attachments: (card.attachments || []).filter(a => a.id !== attachmentId)
    };
    actions.updateCard(updatedCard);
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="h-4 w-4" />;
    if (type === 'link') return <Link className="h-4 w-4" />;
    return <File className="h-4 w-4" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Paperclip className="h-4 w-4" />
            Anexos
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Upload Actions */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="flex-1"
            >
              <Upload className="h-4 w-4 mr-2" />
              Carregar arquivo
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAddingLink(!isAddingLink)}
              className="flex-1"
            >
              <Link className="h-4 w-4 mr-2" />
              Adicionar link
            </Button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
          />

          {/* Add Link Form */}
          {isAddingLink && (
            <div className="p-4 border rounded-md space-y-3">
              <Input
                placeholder="URL do link"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
              />
              <Input
                placeholder="Nome do link (opcional)"
                value={linkName}
                onChange={(e) => setLinkName(e.target.value)}
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleAddLink} disabled={!linkUrl.trim()}>
                  Adicionar
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => {
                    setIsAddingLink(false);
                    setLinkUrl("");
                    setLinkName("");
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          )}

          {/* Attachments List */}
          <ScrollArea className="max-h-60">
            <div className="space-y-2">
              {card.attachments?.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Nenhum anexo adicionado ainda
                </p>
              )}
              
              {card.attachments?.map((attachment) => (
                <div
                  key={attachment.id}
                  className="flex items-center gap-3 p-3 border rounded-md hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-2 flex-1">
                    {getFileIcon(attachment.type)}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{attachment.name}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{formatFileSize(attachment.size)}</span>
                        <span>•</span>
                        <span>{new Date(attachment.uploadedAt).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        if (attachment.type === 'link') {
                          window.open(attachment.url, '_blank');
                        } else {
                          const link = document.createElement('a');
                          link.href = attachment.url;
                          link.download = attachment.name;
                          link.click();
                        }
                      }}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleRemoveAttachment(attachment.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};