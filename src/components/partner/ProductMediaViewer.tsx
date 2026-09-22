import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Play, Image as ImageIcon, Video, Film, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import { MediaItem } from "@/lib/partnerStorage";

interface ProductMediaViewerProps {
  media?: MediaItem[];
  fallbackImage?: string | null;
  title: string;
  className?: string;
  aspectRatio?: "video" | "square" | "wide";
}

export default function ProductMediaViewer({
  media = [],
  fallbackImage,
  title,
  className = "",
  aspectRatio = "video",
}: ProductMediaViewerProps) {
  const [open, setOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Normalize media items: if no structured media, fall back to fallbackImage
  const items: MediaItem[] =
    media && media.length > 0
      ? media
      : fallbackImage
      ? [{ id: "fallback", type: "image", url: fallbackImage, title }]
      : [];

  const hasVideo = items.some((m) => m.type === "video");
  const videoCount = items.filter((m) => m.type === "video").length;
  const imageCount = items.filter((m) => m.type === "image").length;

  const currentItem = items[currentIndex] || items[0];

  const aspectClass =
    aspectRatio === "square"
      ? "aspect-square"
      : aspectRatio === "wide"
      ? "aspect-[21/9]"
      : "aspect-video";

  if (items.length === 0) {
    return (
      <div
        className={`w-full ${aspectClass} rounded-xl bg-muted/60 border flex flex-col items-center justify-center text-muted-foreground/60 ${className}`}
      >
        <ImageIcon className="h-8 w-8 mb-1" />
        <span className="text-xs">Aucun média</span>
      </div>
    );
  }

  const primaryItem = items[0];

  const handleOpenAt = (index: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCurrentIndex(index);
    setOpen(true);
  };

  const next = () => setCurrentIndex((prev) => (prev + 1) % items.length);
  const prev = () => setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);

  return (
    <>
      <div
        onClick={() => handleOpenAt(0)}
        className={`group relative w-full ${aspectClass} rounded-xl overflow-hidden bg-slate-900 border cursor-pointer hover:shadow-md transition-all ${className}`}
      >
        {primaryItem.type === "image" ? (
          <img
            src={primaryItem.url}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full relative flex items-center justify-center bg-slate-950">
            {primaryItem.url.startsWith("data:video") || primaryItem.url.endsWith(".mp4") ? (
              <video src={primaryItem.url} className="w-full h-full object-cover opacity-70" />
            ) : null}
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <div className="w-11 h-11 rounded-full bg-primary/95 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Play className="h-5 w-5 ml-0.5 fill-white" />
              </div>
            </div>
          </div>
        )}

        {/* Overlay hover prompt */}
        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
          <Badge className="bg-background/90 text-foreground text-xs font-semibold backdrop-blur-xs flex items-center gap-1.5 shadow-md">
            <Eye className="h-3.5 w-3.5" /> Voir la galerie ({items.length})
          </Badge>
        </div>

        {/* Media Badges */}
        <div className="absolute top-2 left-2 flex items-center gap-1.5">
          {hasVideo && (
            <Badge className="bg-amber-600/90 hover:bg-amber-600 text-white text-[10px] px-2 py-0.5 backdrop-blur-xs font-semibold flex items-center gap-1 shadow-sm">
              <Video className="h-3 w-3" />
              Vidéo démo
            </Badge>
          )}
          {items.length > 1 && (
            <Badge
              variant="secondary"
              className="bg-black/60 text-white text-[10px] px-2 py-0.5 backdrop-blur-xs"
            >
              {items.length} médias
            </Badge>
          )}
        </div>
      </div>

      {/* Lightbox / Video Player Modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl p-4 sm:p-6 bg-background/95 backdrop-blur-md">
          <DialogHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-base sm:text-lg font-heading font-bold">
                  {title}
                </DialogTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {currentItem?.title || `Média ${currentIndex + 1} sur ${items.length}`}
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                {imageCount > 0 && (
                  <span className="flex items-center gap-1">
                    <ImageIcon className="h-3.5 w-3.5" /> {imageCount} photo(s)
                  </span>
                )}
                {videoCount > 0 && (
                  <span className="flex items-center gap-1 ml-2 text-amber-600 font-medium">
                    <Video className="h-3.5 w-3.5" /> {videoCount} vidéo(s)
                  </span>
                )}
              </div>
            </div>
          </DialogHeader>

          {/* Active Media Container */}
          <div className="relative rounded-xl overflow-hidden bg-black flex items-center justify-center min-h-[300px] max-h-[65vh]">
            {currentItem?.type === "image" ? (
              <img
                src={currentItem.url}
                alt={currentItem.title || title}
                className="max-h-[65vh] w-auto max-w-full object-contain mx-auto"
              />
            ) : currentItem?.url.includes("youtube.com") || currentItem?.url.includes("youtu.be") ? (
              <iframe
                src={currentItem.url.replace("watch?v=", "embed/")}
                className="w-full aspect-video min-h-[350px]"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title="Lecteur Vidéo"
              />
            ) : (
              <video
                src={currentItem?.url}
                controls
                autoPlay
                className="w-full max-h-[65vh] object-contain"
              >
                Votre navigateur ne prend pas en charge cette vidéo.
              </video>
            )}

            {/* Navigation buttons if multiple items */}
            {items.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={prev}
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 text-white hover:bg-black/90 transition-colors"
                  aria-label="Média précédent"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={next}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 text-white hover:bg-black/90 transition-colors"
                  aria-label="Média suivant"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}
          </div>

          {/* Thumbnails row */}
          {items.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto pt-2 pb-1">
              {items.map((it, idx) => (
                <button
                  key={it.id}
                  type="button"
                  onClick={() => setCurrentIndex(idx)}
                  className={`relative rounded-lg overflow-hidden shrink-0 w-16 h-12 border-2 transition-all ${
                    idx === currentIndex
                      ? "border-primary ring-2 ring-primary/40 scale-105"
                      : "border-transparent opacity-70 hover:opacity-100"
                  }`}
                >
                  {it.type === "image" ? (
                    <img src={it.url} alt="vignette" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-slate-900 flex items-center justify-center text-white">
                      <Play className="h-4 w-4 fill-white" />
                    </div>
                  )}
                  {it.type === "video" && (
                    <div className="absolute bottom-0 right-0 p-0.5 bg-amber-600 text-white rounded-tl">
                      <Video className="h-2.5 w-2.5" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

export { ProductMediaViewer };

