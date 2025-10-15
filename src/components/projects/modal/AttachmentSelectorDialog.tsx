import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, ExternalLink, FileText, Image, Link as LinkIcon } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Attachment {
  id: string;
  url: string;
  name: string;
  type?: string;
}

interface AttachmentSelectorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  attachments: Attachment[];
}

export const AttachmentSelectorDialog = ({
  isOpen,
  onClose,
  attachments,
}: AttachmentSelectorDialogProps) => {
  const getAttachmentIcon = (attachment: Attachment) => {
    const isUrl = attachment.url.startsWith('http://') || attachment.url.startsWith('https://');
    
    if (isUrl && !attachment.type) {
      return <LinkIcon className="h-5 w-5 text-primary" />;
    }
    
    const type = attachment.type?.toLowerCase() || '';
    if (type.includes('image')) {
      return <Image className="h-5 w-5 text-primary" />;
    }
    
    return <FileText className="h-5 w-5 text-primary" />;
  };

  const handleOpen = (attachment: Attachment, e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(attachment.url, '_blank');
  };

  const handleDownload = async (attachment: Attachment, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const response = await fetch(attachment.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = attachment.name || 'download';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Erro ao baixar anexo:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Selecione um Anexo</DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[60vh]">
          <div className="space-y-2 pr-4">
            {attachments.map((attachment) => (
              <div
                key={attachment.id}
                className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
              >
                <div className="flex-shrink-0">
                  {getAttachmentIcon(attachment)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{attachment.name}</p>
                  {attachment.type && (
                    <p className="text-xs text-muted-foreground">{attachment.type}</p>
                  )}
                </div>
                
                <div className="flex gap-2 flex-shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => handleOpen(attachment, e)}
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Abrir
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => handleDownload(attachment, e)}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Baixar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
