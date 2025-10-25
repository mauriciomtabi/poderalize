import { useState, useRef, useEffect } from "react";
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
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
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
import { supabase } from "@/integrations/supabase/client";

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
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isAddingLink, setIsAddingLink] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkName, setLinkName] = useState("");
  const [confirmRemoveOpen, setConfirmRemoveOpen] = useState(false);
  const [attachmentToRemove, setAttachmentToRemove] = useState<string | null>(null);
  
  // Load attachments from database when modal opens
  const [loadedAttachments, setLoadedAttachments] = useState<Attachment[]>([]);
  
  // Use loaded attachments for existing cards, or provided attachments for creation mode
  const currentAttachments = isCreationMode ? (attachments || []) : loadedAttachments;
  
  // Load attachments from database when modal opens (edit mode only)
  useEffect(() => {
    if (!isOpen || isCreationMode || !card?.id) {
      return;
    }
    
    let mounted = true;
    
    (async () => {
      try {
        const { data: authData } = await supabase.auth.getUser();
        const userId = authData.user?.id;
        
        if (!userId) return;
        
        let customFields: any = null;
        
        // Try admin RPC first
        const { data: adminFull, error: adminErr } = await supabase
          .rpc('get_card_full_admin' as any, { 
            _user_id: userId, 
            _card_id: card.id 
          })
          .maybeSingle() as any;
        
        if (adminFull && !adminErr) {
          customFields = adminFull.custom_fields;
        } else {
          // Fallback for non-admin users
          const { data: fallback } = await supabase
            .from('project_cards')
            .select('custom_fields')
            .eq('id', card.id)
            .maybeSingle();
          
          customFields = fallback?.custom_fields;
        }
        
        if (mounted && customFields?.attachments) {
          setLoadedAttachments(
            Array.isArray(customFields.attachments) ? customFields.attachments : []
          );
        } else if (mounted) {
          setLoadedAttachments([]);
        }
      } catch (error) {
        console.error('Error loading attachments:', error);
        if (mounted) {
          setLoadedAttachments([]);
        }
      }
    })();
    
    return () => {
      mounted = false;
    };
  }, [isOpen, card?.id, isCreationMode]);

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
        
        if (isCreationMode && onAttachmentsChange) {
          onAttachmentsChange([...currentAttachments, attachment]);
        } else if (card) {
          // Use loadedAttachments to preserve existing attachments
          const updatedAttachments = [...loadedAttachments, attachment];
          setLoadedAttachments(updatedAttachments);
          
          const updatedCard = {
            ...card,
            attachments: updatedAttachments
          };
          
          actions.updateCard(updatedCard);
          actions.addActivity(card.id, 'attachment', `anexou "${attachment.name}"`);
        }
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
      
      if (isCreationMode && onAttachmentsChange) {
        onAttachmentsChange([...currentAttachments, attachment]);
      } else if (card) {
        // Use loadedAttachments to preserve existing attachments
        const updatedAttachments = [...loadedAttachments, attachment];
        setLoadedAttachments(updatedAttachments);
        
        const updatedCard = {
          ...card,
          attachments: updatedAttachments
        };
        
        actions.updateCard(updatedCard);
        actions.addActivity(card.id, 'attachment', `anexou link "${attachment.name}"`);
      }
      
      setLinkUrl("");
      setLinkName("");
      setIsAddingLink(false);
    }
  };

  const handleRemoveAttachment = (attachmentId: string) => {
    setAttachmentToRemove(attachmentId);
    setConfirmRemoveOpen(true);
  };

  const confirmRemoveAttachment = () => {
    if (!attachmentToRemove) return;
    
    const attachment = currentAttachments.find(a => a.id === attachmentToRemove);
    
    if (isCreationMode && onAttachmentsChange) {
      onAttachmentsChange(currentAttachments.filter(a => a.id !== attachmentToRemove));
    } else if (card) {
      // Use loadedAttachments to preserve other existing attachments
      const updatedAttachments = loadedAttachments.filter(a => a.id !== attachmentToRemove);
      setLoadedAttachments(updatedAttachments);
      
      const updatedCard = {
        ...card,
        attachments: updatedAttachments
      };
      actions.updateCard(updatedCard);
      
      if (attachment) {
        actions.addActivity(card.id, 'attachment', `removeu anexo "${attachment.name}"`);
      }
    }
    
    setAttachmentToRemove(null);
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
            Anexos {currentAttachments.length > 0 && <Badge variant="secondary" className="ml-1">{currentAttachments.length}</Badge>}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Upload Actions */}
          <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
              className="flex-1"
            >
              <Upload className="h-4 w-4 mr-2" />
              Carregar arquivos
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => { e.stopPropagation(); setIsAddingLink(!isAddingLink); }}
              className="flex-1"
            >
              <Plus className="h-4 w-4 mr-2" />
              {currentAttachments.some(a => a.type === 'link') ? 'Adicionar outro link' : 'Adicionar link'}
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
                <Button size="sm" onClick={(e) => { 
                  e.stopPropagation(); 
                  handleAddLink();
                  setLinkUrl("");
                  setLinkName("");
                }} disabled={!linkUrl.trim()}>
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
                  Fechar
                </Button>
              </div>
            </div>
          )}

          {/* Attachments List */}
          <ScrollArea className="max-h-60">
            <div className="space-y-2">
              {currentAttachments.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Nenhum anexo adicionado ainda
                </p>
              )}
              
              {currentAttachments.map((attachment) => {
                const isPDF = attachment.type === 'application/pdf' || attachment.name?.toLowerCase().endsWith('.pdf');
                const isImage = attachment.type?.startsWith('image/');
                const isLink = attachment.type === 'link';
                
                return (
                  <div
                    key={attachment.id}
                    className="flex items-center justify-between gap-3 p-3 border rounded-md hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {getFileIcon(attachment.type)}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm break-all whitespace-normal">{attachment.name}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{formatFileSize(attachment.size)}</span>
                          {attachment.size > 0 && <span>•</span>}
                          <span>{new Date(attachment.uploadedAt).toLocaleDateString('pt-BR')}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {isPDF && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(attachment.url, '_blank');
                          }}
                          title="Visualizar PDF"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
                            <circle cx="12" cy="12" r="3"/>
                          </svg>
                        </Button>
                      )}
                      {isLink ? (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(attachment.url, '_blank');
                          }}
                          title="Abrir link"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                            <polyline points="15 3 21 3 21 9"/>
                            <line x1="10" x2="21" y1="14" y2="3"/>
                          </svg>
                        </Button>
                      ) : (
                        <>
                          {(isImage || isPDF) && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(attachment.url, '_blank');
                              }}
                              title={isPDF ? "Visualizar PDF" : "Ver imagem"}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
                                <circle cx="12" cy="12" r="3"/>
                              </svg>
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              const link = document.createElement('a');
                              link.href = attachment.url;
                              link.download = attachment.name;
                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);
                            }}
                            title="Baixar"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                              <polyline points="7 10 12 15 17 10"/>
                              <line x1="12" x2="12" y1="15" y2="3"/>
                            </svg>
                          </Button>
                        </>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          handleRemoveAttachment(attachment.id); 
                        }}
                        title="Remover"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
      
      <ConfirmationDialog
        isOpen={confirmRemoveOpen}
        onClose={() => {
          setConfirmRemoveOpen(false);
          setAttachmentToRemove(null);
        }}
        onConfirm={confirmRemoveAttachment}
        title="Remover anexo"
        description="Tem certeza que deseja remover este anexo? Esta ação não pode ser desfeita."
        confirmText="Remover"
        cancelText="Cancelar"
        variant="destructive"
      />
    </Dialog>
  );
};