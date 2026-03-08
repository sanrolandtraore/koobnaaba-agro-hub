import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Plus, Trash2, MapPin, Wheat, Layers } from "lucide-react";

const cropTypes = [
  "Maïs", "Riz", "Sorgho", "Mil", "Arachide", "Coton", "Soja", "Niébé",
  "Sésame", "Igname", "Manioc", "Patate douce", "Oignon", "Tomate",
];
const seasons = ["Saison sèche 2025", "Saison pluvieuse 2025", "Saison sèche 2026", "Saison pluvieuse 2026"];

type Parcel = {
  id: string; name: string; area_ha: number; location: string | null;
  crop_type: string | null; season: string | null; status: string;
  assigned_members: string[] | null; notes: string | null;
};

const CooperativeParcelsPage = () => {
  const { user } = useAuth();
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "", area_ha: "", location: "", crop_type: "", season: "", notes: "",
  });

  const fetchParcels = async () => {
    if (!user) return;
    const { data } = await supabase.from("cooperative_parcels").select("*").order("created_at", { ascending: false });
    setParcels((data as any[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchParcels(); }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.area_ha) { toast.error("Nom et superficie requis"); return; }
    const { error } = await supabase.from("cooperative_parcels").insert({
      cooperative_user_id: user!.id,
      name: form.name,
      area_ha: parseFloat(form.area_ha),
      location: form.location || null,
      crop_type: form.crop_type || null,
      season: form.season || null,
      notes: form.notes || null,
    });
    if (error) { toast.error(error.message); return; }
    toast.success("Parcelle ajoutée");
    setOpen(false);
    setForm({ name: "", area_ha: "", location: "", crop_type: "", season: "", notes: "" });
    fetchParcels();
  };

  const deleteParcel = async (id: string) => {
    await supabase.from("cooperative_parcels").delete().eq("id", id);
    toast.success("Parcelle supprimée"); fetchParcels();
  };

  const totalArea = parcels.reduce((s, p) => s + Number(p.area_ha), 0);

  if (loading) return <div className="space-y-4"><div className="h-8 w-64 bg-muted animate-pulse rounded" /></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold flex items-center gap-2">
            <Layers className="h-6 w-6 text-primary" /> Parcelles groupées
          </h1>
          <p className="text-muted-foreground mt-1">Production collective sur parcelles mutualisées</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />Nouvelle parcelle</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Ajouter une parcelle groupée</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div><Label>Nom *</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Superficie (ha) *</Label><Input type="number" step="0.1" value={form.area_ha} onChange={e => setForm(f => ({ ...f, area_ha: e.target.value }))} required /></div>
                <div><Label>Localisation</Label><Input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} /></div>
              </div>
              <div><Label>Culture</Label>
                <Select value={form.crop_type} onValueChange={v => setForm(f => ({ ...f, crop_type: v }))}>
                  <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                  <SelectContent>{cropTypes.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Saison</Label>
                <Select value={form.season} onValueChange={v => setForm(f => ({ ...f, season: v }))}>
                  <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                  <SelectContent>{seasons.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Notes</Label><Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} /></div>
              <Button type="submit" className="w-full">Enregistrer</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Parcelles</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{parcels.length}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Superficie totale</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{totalArea.toFixed(1)} ha</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Cultures</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{new Set(parcels.map(p => p.crop_type).filter(Boolean)).size}</p></CardContent></Card>
      </div>

      {parcels.length === 0 ? (
        <Card className="border-dashed"><CardContent className="flex flex-col items-center py-12"><MapPin className="h-12 w-12 text-muted-foreground mb-4" /><p className="text-muted-foreground">Aucune parcelle groupée</p></CardContent></Card>
      ) : (
        <Card>
          <Table>
            <TableHeader><TableRow><TableHead>Nom</TableHead><TableHead>Superficie</TableHead><TableHead>Culture</TableHead><TableHead>Saison</TableHead><TableHead>Localisation</TableHead><TableHead>Statut</TableHead><TableHead></TableHead></TableRow></TableHeader>
            <TableBody>
              {parcels.map(p => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell>{p.area_ha} ha</TableCell>
                  <TableCell>{p.crop_type || "—"}</TableCell>
                  <TableCell>{p.season || "—"}</TableCell>
                  <TableCell>{p.location || "—"}</TableCell>
                  <TableCell><Badge variant={p.status === "active" ? "default" : "secondary"}>{p.status}</Badge></TableCell>
                  <TableCell><Button variant="ghost" size="icon" onClick={() => deleteParcel(p.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
};

export default CooperativeParcelsPage;
