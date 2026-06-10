import { useState, useCallback, useEffect, useRef } from "react";
import Cropper, { type Area } from "react-easy-crop";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Loader2, ZoomIn } from "lucide-react";
import { getCroppedImg, type FormatoRecorte } from "@/lib/crop-image";

interface AvatarCropperModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageSrc: string | null;
  onConfirm: (file: File) => Promise<void>;
  title?: string;
  description?: string;
  confirmLabel?: string;
  outputFileName?: string;
  hint?: string;
  showAppPreview?: boolean;
  formatoRecorte?: FormatoRecorte;
}

export function AvatarCropperModal({
  open,
  onOpenChange,
  imageSrc,
  onConfirm,
  title = "Organize sua foto",
  description,
  confirmLabel = "Usar esta foto",
  outputFileName = "avatar.jpg",
  hint = "Arraste para posicionar e use o controle para dar zoom. O recorte será circular.",
  showAppPreview = false,
  formatoRecorte = "round",
}: AvatarCropperModalProps) {
  const recorteQuadrado = formatoRecorte === "rect";
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const previewObjectUrl = useRef<string | null>(null);

  const onCropComplete = useCallback((_croppedArea: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels);
  }, []);

  useEffect(() => {
    if (!showAppPreview || !imageSrc || !croppedAreaPixels) {
      setPreviewUrl(null);
      return;
    }

    let cancelado = false;
    const timer = window.setTimeout(() => {
      void getCroppedImg(imageSrc, croppedAreaPixels, formatoRecorte)
        .then((blob) => {
          if (cancelado) return;
          if (previewObjectUrl.current) {
            URL.revokeObjectURL(previewObjectUrl.current);
          }
          const url = URL.createObjectURL(blob);
          previewObjectUrl.current = url;
          setPreviewUrl(url);
        })
        .catch(() => {
          if (!cancelado) setPreviewUrl(null);
        });
    }, 200);

    return () => {
      cancelado = true;
      window.clearTimeout(timer);
    };
  }, [showAppPreview, imageSrc, croppedAreaPixels, crop, zoom, formatoRecorte]);

  useEffect(() => {
    if (!open) {
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setCroppedAreaPixels(null);
      setPreviewUrl(null);
      if (previewObjectUrl.current) {
        URL.revokeObjectURL(previewObjectUrl.current);
        previewObjectUrl.current = null;
      }
    }
  }, [open]);

  useEffect(
    () => () => {
      if (previewObjectUrl.current) {
        URL.revokeObjectURL(previewObjectUrl.current);
      }
    },
    [],
  );

  const handleConfirm = async () => {
    if (!imageSrc || !croppedAreaPixels) return;

    setSaving(true);
    try {
      const blob = await getCroppedImg(imageSrc, croppedAreaPixels, formatoRecorte);
      const file = new File([blob], outputFileName, { type: "image/jpeg" });
      await onConfirm(file);
      onOpenChange(false);
    } catch (e) {
      console.error("Erro ao recortar:", e);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-md p-0 gap-0 overflow-hidden"
        onPointerDownOutside={handleCancel}
        onEscapeKeyDown={handleCancel}
      >
        <DialogHeader className="p-4 pb-0">
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        <div className="relative w-full aspect-square bg-muted">
          {imageSrc && (
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={1}
              cropShape={recorteQuadrado ? "rect" : "round"}
              showGrid={false}
              onCropChange={setCrop}
              onCropComplete={onCropComplete}
              onZoomChange={setZoom}
              style={{
                containerStyle: {
                  backgroundColor: "hsl(var(--muted))",
                },
                cropAreaStyle: {
                  border: "2px solid hsl(var(--primary))",
                  boxShadow: "0 0 0 9999px rgba(0,0,0,0.4)",
                },
              }}
            />
          )}
        </div>

        <div className="p-4 space-y-4">
          <div className="flex items-center gap-3">
            <ZoomIn className="h-4 w-4 text-muted-foreground shrink-0" />
            <Slider
              value={[zoom]}
              min={1}
              max={3}
              step={0.1}
              onValueChange={([v]) => setZoom(v ?? 1)}
              className="flex-1"
            />
          </div>
          <p className="text-xs text-muted-foreground">{hint}</p>

          {showAppPreview && previewUrl && (
            <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-2">
              <p className="text-xs font-medium text-foreground">Como vai aparecer no app</p>
              <div className="flex items-center justify-center gap-6">
                {recorteQuadrado ? (
                  <div className="text-center space-y-1.5">
                    <div className="mx-auto h-14 w-14 overflow-hidden rounded-lg ring-1 ring-primary/25">
                      <img
                        src={previewUrl}
                        alt="Prévia no menu"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <p className="text-[10px] text-muted-foreground">Menu / cabeçalho</p>
                  </div>
                ) : (
                  <>
                    <div className="text-center space-y-1.5">
                      <img
                        src={previewUrl}
                        alt="Prévia circular"
                        className="h-14 w-14 rounded-full border-2 border-primary object-cover mx-auto bg-background"
                      />
                      <p className="text-[10px] text-muted-foreground">Avatar</p>
                    </div>
                    <div className="text-center space-y-1.5">
                      <div className="mx-auto h-14 w-14 overflow-hidden rounded-lg ring-1 ring-primary/25">
                        <img
                          src={previewUrl}
                          alt="Prévia cabeçalho"
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <p className="text-[10px] text-muted-foreground">Cabeçalho</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="p-4 pt-0 gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleCancel} disabled={saving}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm} disabled={saving || !croppedAreaPixels}>
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Salvando...
              </>
            ) : (
              confirmLabel
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
