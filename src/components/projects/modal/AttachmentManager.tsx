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
import { 
  Paperclip, 
  Upload, 
  File, 
  Image, 
  Download,
  Trash2,
  Link
} from "lucide-react";
import { ProjectCard, Attachment } from "@/types/projects";
import { useProjects } from "@/contexts/ProjectsContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AttachmentManagerProps {
  isOpen: boolean;
  onClose: () => void;
  card?: ProjectCard;
  attachments?: Attachment[];
  onAttachmentsChange?: (attachments: Attachment[]) => void;
  isCreationMode?: boolean;
}

export const AttachmentManager = ({
  isOpen,
  onClose,
  card,
  attachments,
  onAttachmentsChange,
  isCreationMode = false
}: AttachmentManagerProps) => {
  const { actions } = useProjects();
  const { toast } = useToast();
  
  const currentAttachments = isCreationMode ? (attachments || []) : (card?.attachments || []);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isAddingLink, setIsAddingLink] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkName, setLinkName] = useState("");

  const handleFileUpload = async (files: FileList) => {
    const newAttachments: Attachment[] = [];
    
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Generate unique file path
        const fileExt = file.name.split('.').pop();
        const fileName = `${crypto.randomUUID()}.${fileExt}`;
        const filePath = `projects/${card?.listId || 'temp'}/${card?.id || 'new'}/${fileName}`;
        
        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from('project-attachments')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });
        
        if (uploadError) {
          console.error('Upload error:', uploadError);
          toast({
            title: "Erro ao enviar arquivo",
            description: `Falha ao enviar ${file.name}`,
            variant: "destructive",
          });
          continue;
        }
        
        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('project-attachments')
          .getPublicUrl(filePath);
        
        const attachment: Attachment = {
          id: `attachment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: file.name,
          type: file.type,
          size: file.size,
          url: publicUrl,
          uploadedAt: new Date().toISOString(),
          uploadedBy: "user-1"
        };
        
        newAttachments.push(attachment);
      }
      
      if (newAttachments.length > 0) {
        if (isCreationMode && onAttachmentsChange) {
          onAttachmentsChange([...currentAttachments, ...newAttachments]);
        } else if (card) {
          const updatedCard = {
            ...card,
            attachments: [...(card.attachments || []), ...newAttachments]
          };
          
          actions.updateCard(updatedCard);
          actions.addActivity(card.id, 'attachment', `anexou ${newAttachments.length} arquivo(s)`);
        }
        
        toast({
          title: "Anexos adicionados",
          description: `${newAttachments.length} arquivo(s) foram anexados.`,
        });
      }
    } catch (error) {
      console.error('Error uploading files:', error);
      toast({
        title: "Erro ao enviar arquivos",
        description: "Ocorreu um erro ao processar os arquivos.",
        variant: "destructive",
      });
    }
    
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
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
        uploadedBy: "user-1"
      };
      
      if (isCreationMode && onAttachmentsChange) {
        onAttachmentsChange([...currentAttachments, attachment]);
      } else if (card) {
        const updatedCard = {
          ...card,
          attachments: [...(card.attachments || []), attachment]
        };
        
        actions.updateCard(updatedCard);
        actions.addActivity(card.id, 'attachment', `anexou link "${attachment.name}"`);
      }
      
      setLinkUrl("");
      setLinkName("");
      setIsAddingLink(false);
    }
  };

  const handleRemoveAttachment = async (attachmentId: string) => {
    const attachment = currentAttachments.find(a => a.id === attachmentId);
    
    // Delete from storage if it's a storage URL (not data URL or external link)
    if (attachment && attachment.url.includes('project-attachments')) {
      try {
        const urlParts = attachment.url.split('/project-attachments/');
        if (urlParts.length > 1) {
          const filePath = urlParts[1].split('?')[0];
          await supabase.storage
            .from('project-attachments')
            .remove([filePath]);
        }
      } catch (error) {
        console.error('Error deleting file from storage:', error);
      }
    }
    
    if (isCreationMode && onAttachmentsChange) {
      onAttachmentsChange(currentAttachments.filter(a => a.id !== attachmentId));
    } else if (card) {
      const updatedCard = {
        ...card,
        attachments: (card.attachments || []).filter(a => a.id !== attachmentId)
      };
      actions.updateCard(updatedCard);
      
      if (attachment) {
        actions.addActivity(card.id, 'attachment', `removeu anexo "${attachment.name}"`);
      }
    }
    
    toast({
      title: "Anexo removido",
      description: "O anexo foi removido com sucesso.",
    });
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
      <DialogContent className="max-w-2xl max-h-[80vh]" onClick={(e) => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Paperclip className="h-4 w-4" />
            Anexos
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
              className="flex-1"
            >
              <Upload className="h-4 w-4 mr-2" />
              Carregar arquivo
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => { e.stopPropagation(); setIsAddingLink(!isAddingLink); }}
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

          {isAddingLink && (
            <div className="p-4 border rounded-md space-y-3" onClick={(e) => e.stopPropagation()}>
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
                <Button size="sm" onClick={(e) => { e.stopPropagation(); handleAddLink(); }} disabled={!linkUrl.trim()}>
                  Adicionar
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={(e) => {
                    e.stopPropagation();
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

          <ScrollArea className="max-h-60">
            <div className="space-y-2">
              {currentAttachments.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Nenhum anexo adicionado ainda
                </p>
              )}
              
              {currentAttachments.map((attachment) => (
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
              onClick={(e) => {
                e.stopPropagation();
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
              onClick={(e) => { e.stopPropagation(); handleRemoveAttachment(attachment.id); }}
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