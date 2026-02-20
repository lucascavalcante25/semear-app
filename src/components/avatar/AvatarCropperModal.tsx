import { useState, useCallback } from "react";
import Cropper, { type Area } from "react-easy-crop";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Loader2, ZoomIn } from "lucide-react";
import { getCroppedImg } from "@/lib/crop-image";

interface AvatarCropperModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageSrc: string | null;
  onConfirm: (file: File) => Promise<void>;
}

export function AvatarCropperModal({
  open,
  onOpenChange,
  imageSrc,
  onConfirm,
}: AvatarCropperModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [saving, setSaving] = useState(false);

  const onCropComplete = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleConfirm = async () => {
    if (!imageSrc || !croppedAreaPixels) return;

    setSaving(true);
    try {
      const blob = await getCroppedImg(imageSrc, croppedAreaPixels);
      const file = new File([blob], "avatar.jpg", { type: "image/jpeg" });
      await onConfirm(file);
      onOpenChange(false);
    } catch (e) {
      console.error("Erro ao recortar:", e);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
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
          <DialogTitle>Organize sua foto</DialogTitle>
        </DialogHeader>

        <div className="relative w-full aspect-square bg-muted">
          {imageSrc && (
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={1}
              cropShape="round"
              showGrid={false}
              onCropChange={setCrop}
              onCropComplete={onCropComplete}
              onZoomChange={setZoom}
              style={{
                containerStyle: {
                  backgroundColor: "hsl(var(--muted))",
                },
                cropAreaStyle: {
                  border: "2px solid hsl(var(--olive))",
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
          <p className="text-xs text-muted-foreground">
            Arraste para posicionar e use o controle para dar zoom. O recorte será circular.
          </p>
        </div>

        <DialogFooter className="p-4 pt-0 gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleCancel} disabled={saving}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Salvando...
              </>
            ) : (
              "Usar esta foto"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
