import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  UploadCloud, Image as ImageIcon, Video, Trash2, Plus, Play,
  Film, ExternalLink, X, CheckCircle2, AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import { MediaItem } from "@/lib/partnerStorage";

interface ProductMediaUploaderProps {
  media: MediaItem[];
  onChange: (media: MediaItem[]) => void;
  maxFiles?: number;
}

export default function ProductMediaUploader({
  media,
  onChange,
  maxFiles = 8,
}: ProductMediaUploaderProps) {
  const [activeTab, setActiveTab] = useState<"file" | "url">("file");
  const [urlInput, setUrlInput] = useState("");
  const [urlType, setUrlType] = useState<"image" | "video">("image");
  const [urlTitle, setUrlTitle] = useState("");
  const [previewMedia, setPreviewMedia] = useState<MediaItem | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Convert File to compressed Data URL
  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    if (media.length + files.length > maxFiles) {
      toast.error(`Vous pouvez ajouter au maximum ${maxFiles} médias.`);
      return;
    }

    setUploading(true);
    const newItems: MediaItem[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const isVideo = file.type.startsWith("video/");
      const isImage = file.type.startsWith("image/");

      if (!isImage && !isVideo) {
        toast.error(`Le fichier ${file.name} n'est ni une image ni une vidéo.`);
        continue;
      }

      // Max size: 25MB for video, 8MB for image
      if (isVideo && file.size > 25 * 1024 * 1024) {
        toast.error(`La vidéo ${file.name} dépasse 25 Mo.`);
        continue;
      }
      if (isImage && file.size > 8 * 1024 * 1024) {
        toast.error(`L'image ${file.name} dépasse 8 Mo.`);
        continue;
      }

      try {
        const dataUrl = await readFileAsDataUrl(file);
        newItems.push({
          id: "m-" + Date.now() + "-" + Math.random().toString(36).substring(2, 7),
          type: isVideo ? "video" : "image",
          url: dataUrl,
          title: file.name,
          size: file.size,
        });
      } catch (err) {
        toast.error(`Erreur de lecture du fichier ${file.name}`);
      }
    }

    setUploading(false);
    if (newItems.length > 0) {
      onChange([...media, ...newItems]);
      toast.success(`${newItems.length} média(s) importé(s) avec succès !`);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const readFileAsDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleAddUrl = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUrl = urlInput.trim();
    if (!cleanUrl) {
      toast.error("Veuillez saisir un lien URL valide");
      return;
    }

    // Auto-detect YouTube or video links
    const isYoutube = cleanUrl.includes("youtube.com") || cleanUrl.includes("youtu.be");
    const isVideoExt = cleanUrl.match(/\.(mp4|webm|mov|ogg)(\?.*)?$/i);
    const resolvedType: "image" | "video" = isYoutube || isVideoExt || urlType === "video" ? "video" : "image";

    const newItem: MediaItem = {
      id: "m-" + Date.now() + "-" + Math.random().toString(36).substring(2, 7),
      type: resolvedType,
      url: cleanUrl,
      title: urlTitle.trim() || (resolvedType === "video" ? "Vidéo de présentation" : "Photo du produit"),
    };

    onChange([...media, newItem]);
    setUrlInput("");
    setUrlTitle("");
    toast.success("Média ajouté via lien URL !");
  };

  const handleRemove = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(media.filter((m) => m.id !== id));
    toast.info("Média supprimé.");
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-semibold flex items-center gap-2">
          <Film className="h-4 w-4 text-primary" />
          Photos & Vidéos du produit / service ({media.length}/{maxFiles})
        </Label>
        <div className="flex gap-1 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab("file")}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              activeTab === "file" ? "bg-primary text-primary-foreground font-medium" : "text-muted-foreground hover:bg-muted"
            }`}
          >
            Importer fichier
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("url")}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              activeTab === "url" ? "bg-primary text-primary-foreground font-medium" : "text-muted-foreground hover:bg-muted"
            }`}
          >
            Lien Web / Vidéo
          </button>
        </div>
      </div>

      {activeTab === "file" ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleFiles(e.dataTransfer.files);
          }}
          className="border-2 border-dashed border-primary/30 hover:border-primary/70 bg-primary/5 hover:bg-primary/10 rounded-xl p-5 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2"
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,video/mp4,video/webm,video/quicktime"
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
          <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
            <UploadCloud className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-foreground">
              Glissez-déposez vos photos et vidéos ici, ou <span className="text-primary underline">parcourez vos fichiers</span>
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Images (JPG, PNG, WebP jusqu'à 8 Mo) · Vidéos (MP4, WebM jusqu'à 25 Mo)
            </p>
          </div>
          {uploading && (
            <p className="text-xs text-primary font-medium animate-pulse">
              Chargement des médias en cours…
            </p>
          )}
        </div>
      ) : (
        <div className="border rounded-xl p-3 bg-muted/30 space-y-2">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div className="sm:col-span-2">
              <Input
                placeholder="Lien URL de l'image ou vidéo (ex: YouTube, Vimeo, MP4)..."
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                className="text-xs h-9"
              />
            </div>
            <div>
              <Input
                placeholder="Titre du média (facultatif)"
                value={urlTitle}
                onChange={(e) => setUrlTitle(e.target.value)}
                className="text-xs h-9"
              />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-xs">
              <label className="flex items-center gap-1 cursor-pointer">
                <input
                  type="radio"
                  name="media-type"
                  checked={urlType === "image"}
                  onChange={() => setUrlType("image")}
                  className="text-primary"
                />
                Photo / Image
              </label>
              <label className="flex items-center gap-1 cursor-pointer">
                <input
                  type="radio"
                  name="media-type"
                  checked={urlType === "video"}
                  onChange={() => setUrlType("video")}
                  className="text-primary"
                />
                Vidéo (YouTube, MP4)
              </label>
            </div>
            <Button size="sm" type="button" onClick={handleAddUrl} className="h-8 text-xs">
              <Plus className="h-3.5 w-3.5 mr-1" /> Ajouter le média
            </Button>
          </div>
        </div>
      )}

      {/* Grid of uploaded media */}
      {media.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
          {media.map((item, idx) => (
            <div
              key={item.id}
              onClick={() => setPreviewMedia(item)}
              className="group relative rounded-lg border bg-muted/40 overflow-hidden cursor-pointer aspect-video flex items-center justify-center hover:ring-2 hover:ring-primary transition-all"
            >
              {item.type === "image" ? (
                <img
                  src={item.url}
                  alt={item.title || "Image produit"}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-slate-900 flex flex-col items-center justify-center text-white relative">
                  {item.url.startsWith("data:video") || item.url.endsWith(".mp4") ? (
                    <video src={item.url} className="w-full h-full object-cover opacity-60" />
                  ) : null}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-9 h-9 rounded-full bg-primary/90 text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                      <Play className="h-4 w-4 ml-0.5 fill-white" />
                    </div>
                  </div>
                </div>
              )}

              {/* Badges & Actions */}
              <div className="absolute top-1 left-1">
                <Badge
                  variant="secondary"
                  className="text-[10px] px-1.5 py-0 bg-background/80 backdrop-blur-xs font-medium"
                >
                  {item.type === "video" ? (
                    <span className="flex items-center gap-0.5 text-amber-600">
                      <Video className="h-2.5 w-2.5" /> Vidéo
                    </span>
                  ) : (
                    <span className="flex items-center gap-0.5 text-emerald-600">
                      <ImageIcon className="h-2.5 w-2.5" /> {idx === 0 ? "Principale" : "Photo"}
                    </span>
                  )}
                </Badge>
              </div>

              <button
                type="button"
                onClick={(e) => handleRemove(item.id, e)}
                className="absolute top-1 right-1 p-1 rounded-md bg-destructive/90 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive shadow-xs"
                title="Supprimer ce média"
              >
                <Trash2 className="h-3 w-3" />
              </button>

              {item.title && (
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-1.5 text-[10px] text-white truncate">
                  {item.title}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal Preview */}
      <Dialog open={!!previewMedia} onOpenChange={(open) => !open && setPreviewMedia(null)}>
        <DialogContent className="max-w-3xl p-4">
          <DialogHeader>
            <DialogTitle className="text-base flex items-center justify-between">
              <span>{previewMedia?.title || "Aperçu du média"}</span>
              <Badge variant="outline" className="text-xs">
                {previewMedia?.type === "video" ? "Vidéo" : "Image"}
              </Badge>
            </DialogTitle>
          </DialogHeader>
          <div className="mt-2 rounded-xl overflow-hidden bg-black flex items-center justify-center max-h-[70vh]">
            {previewMedia?.type === "image" ? (
              <img
                src={previewMedia.url}
                alt={previewMedia.title || "Aperçu"}
                className="max-h-[70vh] w-auto object-contain mx-auto"
              />
            ) : previewMedia?.url.includes("youtube.com") || previewMedia?.url.includes("youtu.be") ? (
              <iframe
                src={previewMedia.url.replace("watch?v=", "embed/")}
                className="w-full aspect-video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title="Lecteur YouTube"
              />
            ) : (
              <video
                src={previewMedia?.url}
                controls
                autoPlay
                className="w-full max-h-[70vh] object-contain"
              >
                Votre navigateur ne prend pas en charge la lecture de cette vidéo.
              </video>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export { ProductMediaUploader };

