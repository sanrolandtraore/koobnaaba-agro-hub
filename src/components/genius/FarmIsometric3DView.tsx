import React, { useRef, useState, useEffect, useCallback } from "react";
import { FarmZoningPlan } from "@/lib/nafaGeniusEngine";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Layers, RotateCw, Download, Box, Sun, Droplets, Home } from "lucide-react";
import { toast } from "sonner";

interface FarmIsometric3DViewProps {
  plan: FarmZoningPlan;
}

export const FarmIsometric3DView: React.FC<FarmIsometric3DViewProps> = ({ plan }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Contrôles interactifs de la vue 3D isométrique
  const [rotationAngleDeg, setRotationAngleDeg] = useState<number>(35); // 0 à 90°
  const [elevationFactor, setElevationFactor] = useState<number>(1.5); // 0.5 à 3.0
  const [zoomLevel, setZoomLevel] = useState<number>(1.0);
  const [showWaterLines, setShowWaterLines] = useState<boolean>(true);
  const [showFence, setShowFence] = useState<boolean>(true);

  // Projection isométrique 3D : (x, y, z) -> (screenX, screenY)
  const projectIso = useCallback(
    (
      x: number,
      y: number,
      z: number,
      originX: number,
      originY: number,
      angleRad: number
    ): { px: number; py: number } => {
      // Rotation autour de l'axe vertical Z
      const cosA = Math.cos(angleRad);
      const sinA = Math.sin(angleRad);
      const rotX = x * cosA - y * sinA;
      const rotY = x * sinA + y * cosA;

      // Projection isométrique axonométrique classique
      // px = (rotX - rotY) * cos(30°)
      // py = (rotX + rotY) * sin(30°) - z
      const isoCos = 0.866025; // cos(30°)
      const isoSin = 0.5; // sin(30°)

      const px = originX + (rotX - rotY) * isoCos * zoomLevel;
      const py = originY + (rotX + rotY) * isoSin * zoomLevel - z * elevationFactor * zoomLevel;

      return { px, py };
    },
    [zoomLevel, elevationFactor]
  );

  const drawScene = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    // Fond ciel / atmosphère sahélienne épurée
    const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
    skyGrad.addColorStop(0, "#f8fafc");
    skyGrad.addColorStop(1, "#f1f5f9");
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, width, height);

    const originX = width / 2;
    const originY = height * 0.42;
    const angleRad = (rotationAngleDeg * Math.PI) / 180;

    const plotSize = 240; // demi-taille du terrain en unités 3D

    // 1. Dalle de terrain / Plateau géologique surélevé
    const zBase = 0;
    const zThickness = 22; // Épaisseur de la coupe géologique du socle

    const c1 = projectIso(-plotSize, -plotSize, zBase, originX, originY, angleRad);
    const c2 = projectIso(plotSize, -plotSize, zBase, originX, originY, angleRad);
    const c3 = projectIso(plotSize, plotSize, zBase, originX, originY, angleRad);
    const c4 = projectIso(-plotSize, plotSize, zBase, originX, originY, angleRad);

    const b1 = projectIso(-plotSize, -plotSize, zBase - zThickness, originX, originY, angleRad);
    const b2 = projectIso(plotSize, -plotSize, zBase - zThickness, originX, originY, angleRad);
    const b3 = projectIso(plotSize, plotSize, zBase - zThickness, originX, originY, angleRad);
    const b4 = projectIso(-plotSize, plotSize, zBase - zThickness, originX, originY, angleRad);

    // Tranches géologiques latérales (ombrage 3D socle rocheux)
    ctx.fillStyle = "#94a3b8"; // Face avant-droite
    ctx.beginPath();
    ctx.moveTo(c2.px, c2.py);
    ctx.lineTo(c3.px, c3.py);
    ctx.lineTo(b3.px, b3.py);
    ctx.lineTo(b2.px, b2.py);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#64748b"; // Face avant-gauche
    ctx.beginPath();
    ctx.moveTo(c3.px, c3.py);
    ctx.lineTo(c4.px, c4.py);
    ctx.lineTo(b4.px, b4.py);
    ctx.lineTo(b3.px, b3.py);
    ctx.closePath();
    ctx.fill();

    // Surface supérieure du terrain (Terre fertile cultivée)
    const groundGrad = ctx.createLinearGradient(c1.px, c1.py, c3.px, c3.py);
    groundGrad.addColorStop(0, "#86efac"); // Vert clair
    groundGrad.addColorStop(1, "#bbf7d0");
    ctx.fillStyle = groundGrad;
    ctx.beginPath();
    ctx.moveTo(c1.px, c1.py);
    ctx.lineTo(c2.px, c2.py);
    ctx.lineTo(c3.px, c3.py);
    ctx.lineTo(c4.px, c4.py);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#16a34a";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // 2. Grillage de clôture périphérique sécurisée si activée
    if (showFence) {
      ctx.strokeStyle = "rgba(100, 116, 139, 0.6)";
      ctx.lineWidth = 1.5;
      const fencePosts = 16;
      for (let i = 0; i <= fencePosts; i++) {
        const t = (i / fencePosts) * 2 - 1;
        // Poteau bord Sud-Est
        const pBot = projectIso(plotSize, t * plotSize, zBase, originX, originY, angleRad);
        const pTop = projectIso(plotSize, t * plotSize, zBase + 12, originX, originY, angleRad);
        ctx.beginPath();
        ctx.moveTo(pBot.px, pBot.py);
        ctx.lineTo(pTop.px, pTop.py);
        ctx.stroke();

        // Poteau bord Sud-Ouest
        const qBot = projectIso(t * plotSize, plotSize, zBase, originX, originY, angleRad);
        const qTop = projectIso(t * plotSize, plotSize, zBase + 12, originX, originY, angleRad);
        ctx.beginPath();
        ctx.moveTo(qBot.px, qBot.py);
        ctx.lineTo(qTop.px, qTop.py);
        ctx.stroke();
      }
    }

    // 3. Dessin des Parcelles de Cultures Maraîchères (Planches de culture en relief)
    const cropX1 = -50;
    const cropX2 = 180;
    const cropY1 = -20;
    const cropY2 = 180;

    // Rangs de cultures verdoyants
    ctx.strokeStyle = "#15803d";
    ctx.lineWidth = 3 * zoomLevel;
    for (let yOffset = cropY1; yOffset < cropY2; yOffset += 18) {
      const rStart = projectIso(cropX1, yOffset, zBase + 2, originX, originY, angleRad);
      const rEnd = projectIso(cropX2, yOffset, zBase + 2, originX, originY, angleRad);
      ctx.beginPath();
      ctx.moveTo(rStart.px, rStart.py);
      ctx.lineTo(rEnd.px, rEnd.py);
      ctx.stroke();
    }

    // 4. BÂTIMENT AVICOLE BIOCLIMATIQUE 3D (Axe Est-Ouest)
    const bldgCenterX = 20;
    const bldgCenterY = -120;
    const bldgHalfW = 100; // Longueur bâtiment
    const bldgHalfD = 35; // Largeur 8-10m
    const bldgEaveH = 26; // Hauteur sablière
    const bldgRidgeH = 38; // Hauteur faîtage

    // Murs du bâtiment
    const w1 = projectIso(bldgCenterX - bldgHalfW, bldgCenterY - bldgHalfD, zBase, originX, originY, angleRad);
    const w2 = projectIso(bldgCenterX + bldgHalfW, bldgCenterY - bldgHalfD, zBase, originX, originY, angleRad);
    const w3 = projectIso(bldgCenterX + bldgHalfW, bldgCenterY + bldgHalfD, zBase, originX, originY, angleRad);
    const w4 = projectIso(bldgCenterX - bldgHalfW, bldgCenterY + bldgHalfD, zBase, originX, originY, angleRad);

    const ew1 = projectIso(bldgCenterX - bldgHalfW, bldgCenterY - bldgHalfD, bldgEaveH, originX, originY, angleRad);
    const ew2 = projectIso(bldgCenterX + bldgHalfW, bldgCenterY - bldgHalfD, bldgEaveH, originX, originY, angleRad);
    const ew3 = projectIso(bldgCenterX + bldgHalfW, bldgCenterY + bldgHalfD, bldgEaveH, originX, originY, angleRad);
    const ew4 = projectIso(bldgCenterX - bldgHalfW, bldgCenterY + bldgHalfD, bldgEaveH, originX, originY, angleRad);

    // Faîtage central avec lanterneau
    const ridge1 = projectIso(bldgCenterX - bldgHalfW, bldgCenterY, bldgRidgeH, originX, originY, angleRad);
    const ridge2 = projectIso(bldgCenterX + bldgHalfW, bldgCenterY, bldgRidgeH, originX, originY, angleRad);

    // Murs maçonnés
    ctx.fillStyle = "#fdba74"; // Orange doux / brique
    ctx.beginPath();
    ctx.moveTo(w2.px, w2.py);
    ctx.lineTo(w3.px, w3.py);
    ctx.lineTo(ew3.px, ew3.py);
    ctx.lineTo(ew2.px, ew2.py);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#fb923c";
    ctx.beginPath();
    ctx.moveTo(w3.px, w3.py);
    ctx.lineTo(w4.px, w4.py);
    ctx.lineTo(ew4.px, ew4.py);
    ctx.lineTo(ew3.px, ew3.py);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Toiture Bac Alu réfléchissante inclinée à deux pans
    ctx.fillStyle = "#cbd5e1"; // Pan Nord
    ctx.beginPath();
    ctx.moveTo(ew1.px, ew1.py);
    ctx.lineTo(ew2.px, ew2.py);
    ctx.lineTo(ridge2.px, ridge2.py);
    ctx.lineTo(ridge1.px, ridge1.py);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#94a3b8";
    ctx.stroke();

    ctx.fillStyle = "#e2e8f0"; // Pan Sud (éclairé)
    ctx.beginPath();
    ctx.moveTo(ew4.px, ew4.py);
    ctx.lineTo(ew3.px, ew3.py);
    ctx.lineTo(ridge2.px, ridge2.py);
    ctx.lineTo(ridge1.px, ridge1.py);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Lanterneau de ventilation faîtière
    ctx.fillStyle = "#f97316";
    const lt1 = projectIso(bldgCenterX - bldgHalfW + 10, bldgCenterY, bldgRidgeH + 5, originX, originY, angleRad);
    const lt2 = projectIso(bldgCenterX + bldgHalfW - 10, bldgCenterY, bldgRidgeH + 5, originX, originY, angleRad);
    ctx.beginPath();
    ctx.moveTo(lt1.px, lt1.py);
    ctx.lineTo(lt2.px, lt2.py);
    ctx.lineWidth = 3;
    ctx.stroke();

    // 5. CHÂTEAU D'EAU MÉTALLIQUE 3D (H = 8m)
    const towerX = -150;
    const towerY = -140;
    const towerLegH = 50;
    const tankR = 18;
    const tankH = 22;

    const tBase = projectIso(towerX, towerY, zBase, originX, originY, angleRad);
    const tTop = projectIso(towerX, towerY, towerLegH, originX, originY, angleRad);
    const tTankTop = projectIso(towerX, towerY, towerLegH + tankH, originX, originY, angleRad);

    // Pieds du treillis métallique
    ctx.strokeStyle = "#475569";
    ctx.lineWidth = 2;
    [-12, 12].forEach((dx) => {
      [-12, 12].forEach((dy) => {
        const foot = projectIso(towerX + dx, towerY + dy, zBase, originX, originY, angleRad);
        ctx.beginPath();
        ctx.moveTo(foot.px, foot.py);
        ctx.lineTo(tTop.px, tTop.py);
        ctx.stroke();
      });
    });

    // Cuve cylindrique château d'eau
    ctx.fillStyle = "#0284c7"; // Bleu technique réservoir
    ctx.beginPath();
    ctx.arc(tTop.px, tTop.py - (tankH / 2) * zoomLevel, tankR * zoomLevel, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#0369a1";
    ctx.lineWidth = 2;
    ctx.stroke();

    // 6. CHAMP SOLAIRE PHOTOVOLTAÏQUE 3D
    const solX = -140;
    const solY = -40;
    for (let row = 0; row < 3; row++) {
      const sp1 = projectIso(solX + row * 18, solY - 20, zBase + 4, originX, originY, angleRad);
      const sp2 = projectIso(solX + row * 18, solY + 20, zBase + 4, originX, originY, angleRad);
      const sp3 = projectIso(solX + row * 18 + 12, solY + 20, zBase + 12, originX, originY, angleRad);
      const sp4 = projectIso(solX + row * 18 + 12, solY - 20, zBase + 12, originX, originY, angleRad);

      ctx.fillStyle = "#1e3a8a"; // Bleu silicium solaire
      ctx.beginPath();
      ctx.moveTo(sp1.px, sp1.py);
      ctx.lineTo(sp2.px, sp2.py);
      ctx.lineTo(sp3.px, sp3.py);
      ctx.lineTo(sp4.px, sp4.py);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#38bdf8";
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // 7. Canalisations d'eau principales (Ligne bleue si activée)
    if (showWaterLines) {
      ctx.strokeStyle = "#0284c7";
      ctx.lineWidth = 2.5;
      ctx.setLineDash([4, 4]);

      // Du château d'eau vers les maraîchages
      const pipeStart = projectIso(towerX, towerY, zBase, originX, originY, angleRad);
      const pipeJunc = projectIso(cropX1, cropY1, zBase, originX, originY, angleRad);
      const pipeEnd = projectIso(cropX1, cropY2, zBase, originX, originY, angleRad);

      ctx.beginPath();
      ctx.moveTo(pipeStart.px, pipeStart.py);
      ctx.lineTo(pipeJunc.px, pipeJunc.py);
      ctx.lineTo(pipeEnd.px, pipeEnd.py);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Badge d'orientation 3D
    ctx.save();
    ctx.fillStyle = "rgba(15, 23, 42, 0.75)";
    ctx.beginPath();
    ctx.roundRect(14, 14, 170, 26, 6);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 11px sans-serif";
    ctx.fillText(`Jumeau Numérique 3D (${rotationAngleDeg}°)`, 24, 31);
    ctx.restore();
  }, [rotationAngleDeg, elevationFactor, zoomLevel, showWaterLines, showFence, projectIso]);

  useEffect(() => {
    drawScene();
  }, [drawScene]);

  const download3dImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `jumeau_numerique_3d_${plan.projectName.replace(/\s+/g, "_")}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
    toast.success("Vue 3D isométrique exportée en PNG !");
  };

  return (
    <div className="flex flex-col gap-3 w-full bg-card rounded-xl border border-border p-4 shadow-xs">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/20 font-semibold gap-1">
            <Box className="h-3 w-3" /> Modélisation 3D Isométrique & Relief
          </Badge>
          <span className="text-xs text-muted-foreground hidden sm:inline">
            Aperçu spatial immersif de la ferme (bâtiments bioclimatiques, pompage solaire, réseau hydraulique).
          </span>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <Button
            size="sm"
            variant="outline"
            className="h-8 text-xs gap-1"
            onClick={() => setShowWaterLines(!showWaterLines)}
          >
            <Droplets className="h-3.5 w-3.5 text-sky-600" />
            {showWaterLines ? "Masquer canalisations" : "Réseau hydraulique"}
          </Button>

          <Button
            size="sm"
            variant="outline"
            className="h-8 text-xs gap-1"
            onClick={() => setShowFence(!showFence)}
          >
            <Layers className="h-3.5 w-3.5 text-emerald-600" />
            {showFence ? "Masquer clôture" : "Afficher clôture"}
          </Button>

          <Button
            size="sm"
            variant="outline"
            className="h-8 text-xs gap-1"
            onClick={download3dImage}
          >
            <Download className="h-3.5 w-3.5" /> Exporter 3D
          </Button>
        </div>
      </div>

      {/* Surface du Canvas 3D */}
      <div className="relative w-full overflow-hidden rounded-lg border border-border/80 bg-slate-100 dark:bg-slate-900 flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={900}
          height={480}
          className="w-full h-auto max-h-[480px] object-contain select-none"
        />
      </div>

      {/* Barre de contrôles 3D (Rotation, Relief, Zoom) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 px-1">
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-medium">
            <span>Angle de rotation : {rotationAngleDeg}°</span>
            <RotateCw className="h-3 w-3 text-muted-foreground" />
          </div>
          <Slider
            min={0}
            max={90}
            step={5}
            value={[rotationAngleDeg]}
            onValueChange={([val]) => setRotationAngleDeg(val)}
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-medium">
            <span>Exagération du relief : x{elevationFactor.toFixed(1)}</span>
            <Layers className="h-3 w-3 text-muted-foreground" />
          </div>
          <Slider
            min={0.5}
            max={3.0}
            step={0.1}
            value={[elevationFactor]}
            onValueChange={([val]) => setElevationFactor(val)}
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-medium">
            <span>Échelle de zoom : {Math.round(zoomLevel * 100)}%</span>
            <Box className="h-3 w-3 text-muted-foreground" />
          </div>
          <Slider
            min={0.7}
            max={1.5}
            step={0.05}
            value={[zoomLevel]}
            onValueChange={([val]) => setZoomLevel(val)}
          />
        </div>
      </div>
    </div>
  );
};
