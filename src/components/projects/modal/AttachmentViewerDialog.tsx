import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Attachment } from "@/types/projects";

interface AttachmentViewerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  attachment: Attachment | null;
}

function dataUrlToObjectUrl(dataUrl: string): string | null {
  try {
    if (!dataUrl.startsWith("data:")) return null;
    const commaIndex = dataUrl.indexOf(',');
    if (commaIndex === -1) return null;
    const header = dataUrl.substring(0, commaIndex);
    const base64 = dataUrl.substring(commaIndex + 1);
    const mimeMatch = header.match(/^data:([^;]+);base64$/);
    const mime = mimeMatch ? mimeMatch[1] : "application/octet-stream";
    const byteChars = atob(base64);
    const bytes = new Uint8Array(byteChars.length);
    for (let i = 0; i < byteChars.length; i++) bytes[i] = byteChars.charCodeAt(i);
    const blob = new Blob([bytes], { type: mime });
    return URL.createObjectURL(blob);
  } catch {
    return null;
  }
}

export function AttachmentViewerDialog({ isOpen, onClose, attachment }: AttachmentViewerDialogProps) {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);

  const isPDF = useMemo(() => {
    const name = attachment?.name?.toLowerCase() || "";
    return attachment?.type === "application/pdf" || name.endsWith(".pdf");
  }, [attachment]);

  const isImage = useMemo(() => attachment?.type?.startsWith("image/") ?? false, [attachment]);

  useEffect(() => {
    // Prepare object URL for data URLs to ensure proper viewing
    if (!attachment?.url) return;
    if (attachment.url.startsWith("data:")) {
      const url = dataUrlToObjectUrl(attachment.url);
      setObjectUrl(url);
      return () => {
        if (url) URL.revokeObjectURL(url);
      };
    } else {
      setObjectUrl(null); // Use direct URL
    }
  }, [attachment?.url]);

  const viewerSrc = attachment
    ? attachment.url.startsWith("data:")
      ? objectUrl || undefined
      : attachment.url
    : undefined;

  const handleDownload = () => {
    if (!attachment?.url) return;
    const link = document.createElement("a");
    link.href = attachment.url.startsWith("data:") && objectUrl ? objectUrl : attachment.url;
    link.download = attachment.name || "arquivo";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl w-[95vw] h-[85vh]" onClick={(e) => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle className="truncate">{attachment?.name || "Visualizar anexo"}</DialogTitle>
          <DialogDescription className="sr-only">Visualização do anexo selecionado</DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-end gap-2 pb-2">
          {attachment && (
            <Button size="sm" variant="outline" onClick={handleDownload}>
              Baixar
            </Button>
          )}
        </div>

        <div className="w-full h-full border rounded-md overflow-hidden bg-background">
          {attachment && isPDF && viewerSrc ? (
            <iframe
              src={viewerSrc}
              title={attachment.name}
              className="w-full h-full"
            />
          ) : attachment && isImage && viewerSrc ? (
            <img src={viewerSrc} alt={attachment.name} className="w-full h-full object-contain" />
          ) : attachment ? (
            <div className="p-6 text-sm text-muted-foreground">
              Este tipo de arquivo não possui visualização embutida. Você pode baixá-lo para abrir no seu dispositivo.
            </div>
          ) : (
            <div className="p-6 text-sm text-muted-foreground">Nenhum anexo selecionado.</div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
