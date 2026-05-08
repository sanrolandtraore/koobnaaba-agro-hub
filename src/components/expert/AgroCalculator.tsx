import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const num = (v: string) => {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : 0;
};

export function AgroCalculator() {
  // Densité de semis
  const [pmg, setPmg] = useState("25"); // g pour 1000 grains
  const [grainsM2, setGrainsM2] = useState("250");
  const dens_kgha = ((num(grainsM2) * 10000 * num(pmg)) / 1000) / 1000; // (grains/ha * g/grain) /1000

  // Conversion
  const [m2, setM2] = useState("10000");
  const ha = num(m2) / 10000;

  // Dose produit
  const [surfaceHa, setSurfaceHa] = useState("1");
  const [dosePerHa, setDosePerHa] = useState("2");
  const [volumeBouillieHa, setVolumeBouillieHa] = useState("200");
  const totalProduit = num(surfaceHa) * num(dosePerHa);
  const totalBouillie = num(surfaceHa) * num(volumeBouillieHa);

  // Besoin en eau ETc
  const [eto, setEto] = useState("5"); // mm/jour
  const [kc, setKc] = useState("1.0");
  const [duree, setDuree] = useState("90");
  const [surfaceEau, setSurfaceEau] = useState("1");
  const etc = num(eto) * num(kc); // mm/jour
  const totalMm = etc * num(duree);
  const totalM3 = (totalMm / 1000) * num(surfaceEau) * 10000;

  // Rendement potentiel
  const [plantsM2, setPlantsM2] = useState("8");
  const [grainsParPlante, setGrainsParPlante] = useState("300");
  const [pmgYield, setPmgYield] = useState("25");
  const yieldKgHa = (num(plantsM2) * 10000 * num(grainsParPlante) * num(pmgYield)) / 1_000_000;

  return (
    <Tabs defaultValue="density">
      <TabsList className="w-full grid grid-cols-5">
        <TabsTrigger value="density" className="text-xs">Semis</TabsTrigger>
        <TabsTrigger value="convert" className="text-xs">Unités</TabsTrigger>
        <TabsTrigger value="phyto" className="text-xs">Dose</TabsTrigger>
        <TabsTrigger value="water" className="text-xs">Eau</TabsTrigger>
        <TabsTrigger value="yield" className="text-xs">Rdt</TabsTrigger>
      </TabsList>

      <TabsContent value="density">
        <Card className="p-4 space-y-3">
          <div><Label>PMG (g pour 1000 grains)</Label><Input type="number" value={pmg} onChange={e => setPmg(e.target.value)} /></div>
          <div><Label>Densité visée (grains/m²)</Label><Input type="number" value={grainsM2} onChange={e => setGrainsM2(e.target.value)} /></div>
          <div className="bg-primary/10 p-3 rounded-lg">
            <p className="text-sm text-muted-foreground">Quantité semence</p>
            <p className="text-2xl font-bold">{dens_kgha.toFixed(2)} kg/ha</p>
          </div>
        </Card>
      </TabsContent>

      <TabsContent value="convert">
        <Card className="p-4 space-y-3">
          <div><Label>Surface en m²</Label><Input type="number" value={m2} onChange={e => setM2(e.target.value)} /></div>
          <div className="bg-primary/10 p-3 rounded-lg space-y-1 text-sm">
            <p>= <strong>{ha.toFixed(4)} ha</strong></p>
            <p>= <strong>{(ha * 100).toFixed(2)} ares</strong></p>
            <p>= <strong>{(num(m2) * 0.0001).toFixed(4)} ha</strong></p>
          </div>
        </Card>
      </TabsContent>

      <TabsContent value="phyto">
        <Card className="p-4 space-y-3">
          <div><Label>Surface (ha)</Label><Input type="number" value={surfaceHa} onChange={e => setSurfaceHa(e.target.value)} /></div>
          <div><Label>Dose produit par ha (L ou kg)</Label><Input type="number" value={dosePerHa} onChange={e => setDosePerHa(e.target.value)} /></div>
          <div><Label>Volume bouillie par ha (L)</Label><Input type="number" value={volumeBouillieHa} onChange={e => setVolumeBouillieHa(e.target.value)} /></div>
          <div className="bg-primary/10 p-3 rounded-lg space-y-1">
            <p className="text-sm">Quantité produit : <strong>{totalProduit.toFixed(2)}</strong></p>
            <p className="text-sm">Volume bouillie total : <strong>{totalBouillie.toFixed(0)} L</strong></p>
          </div>
        </Card>
      </TabsContent>

      <TabsContent value="water">
        <Card className="p-4 space-y-3">
          <div><Label>ETo (mm/jour)</Label><Input type="number" value={eto} onChange={e => setEto(e.target.value)} /></div>
          <div><Label>Kc (coef. cultural)</Label><Input type="number" step="0.05" value={kc} onChange={e => setKc(e.target.value)} /></div>
          <div><Label>Durée (jours)</Label><Input type="number" value={duree} onChange={e => setDuree(e.target.value)} /></div>
          <div><Label>Surface (ha)</Label><Input type="number" value={surfaceEau} onChange={e => setSurfaceEau(e.target.value)} /></div>
          <div className="bg-primary/10 p-3 rounded-lg space-y-1">
            <p className="text-sm">ETc journalier : <strong>{etc.toFixed(2)} mm/j</strong></p>
            <p className="text-sm">Besoin total : <strong>{totalMm.toFixed(0)} mm</strong></p>
            <p className="text-sm">Volume : <strong>{totalM3.toFixed(0)} m³</strong></p>
          </div>
        </Card>
      </TabsContent>

      <TabsContent value="yield">
        <Card className="p-4 space-y-3">
          <div><Label>Plants/m²</Label><Input type="number" value={plantsM2} onChange={e => setPlantsM2(e.target.value)} /></div>
          <div><Label>Grains/plante</Label><Input type="number" value={grainsParPlante} onChange={e => setGrainsParPlante(e.target.value)} /></div>
          <div><Label>PMG (g)</Label><Input type="number" value={pmgYield} onChange={e => setPmgYield(e.target.value)} /></div>
          <div className="bg-primary/10 p-3 rounded-lg">
            <p className="text-sm text-muted-foreground">Rendement potentiel</p>
            <p className="text-2xl font-bold">{(yieldKgHa / 1000).toFixed(2)} t/ha</p>
            <p className="text-xs text-muted-foreground">({yieldKgHa.toFixed(0)} kg/ha)</p>
          </div>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
