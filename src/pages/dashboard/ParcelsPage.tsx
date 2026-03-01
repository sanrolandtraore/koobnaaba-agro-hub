import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Trash2, Edit, Map } from "lucide-react";

const ParcelsPage = () => {
  const [parcels, setParcels] = useState<any[]>([]);
  const [farms, setFarms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: "", farm_id: "", area_ha: "", soil_type: "", irrigation_type: "", latitude: "", longitude: "" });

  const fetchParcels = async () => {
    const { data, error } = await supabase.from("parcels").select("*, farms(name)").order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    else setParcels(data || []);
    setLoading(false);
  };

  const fetchFarms = async () => {
    const { data } = await supabase.from("farms").select("id, name");
    setFarms(data || []);
  };

  useEffect(() => { fetchParcels(); fetchFarms(); }, []);

  const resetForm = () => { setForm({ name: "", farm_id: "", area_ha: "", soil_type: "", irrigation_type: "", latitude: "", longitude: "" }); setEditing(null); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: form.name,
      farm_id: form.farm_id,
      area_ha: parseFloat(form.area_ha) || 0,
      soil_type: form.soil_type || null,
      irrigation_type: form.irrigation_type || null,
      latitude: form.latitude ? parseFloat(form.latitude) : null,
      longitude: form.longitude ? parseFloat(form.longitude) : null,
    };
    if (editing) {
      const { error } = await supabase.from("parcels").update(payload).eq("id", editing.id);
      if (error) { toast.error(error.message); return; }
      toast.success("Parcelle mise à jour !");
    } else {
      const { error } = await supabase.from("parcels").insert(payload);
      if (error) { toast.error(error.message); return; }
      toast.success("Parcelle créée !");
    }
    resetForm(); setOpen(false); fetchParcels();
  };

  const handleEdit = (p: any) => {
    setEditing(p);
    setForm({ name: p.name, farm_id: p.farm_id, area_ha: p.area_ha?.toString() || "", soil_type: p.soil_type || "", irrigation_type: p.irrigation_type || "", latitude: p.latitude?.toString() || "", longitude: p.longitude?.toString() || "" });
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer cette parcelle ?")) return;
    const { error } = await supabase.from("parcels").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Parcelle supprimée"); fetchParcels(); }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold">Parcelles</h1>
          <p className="text-muted-foreground mt-1">Gérez vos parcelles de culture</p>
        </div>
        <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="gradient-primary text-primary-foreground" disabled={farms.length === 0}>
              <Plus className="h-4 w-4 mr-2" />Nouvelle parcelle
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing ? "Modifier" : "Nouvelle"} parcelle</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Exploitation *</Label>
                <Select value={form.farm_id} onValueChange={(v) => setForm({ ...form, farm_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                  <SelectContent>{farms.map((f) => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Nom *</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="Parcelle A" />
              </div>
              <div className="space-y-2">
                <Label>Superficie (ha) *</Label>
                <Input type="number" step="any" value={form.area_ha} onChange={(e) => setForm({ ...form, area_ha: e.target.value })} required placeholder="2.5" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Type de sol</Label>
                  <Input value={form.soil_type} onChange={(e) => setForm({ ...form, soil_type: e.target.value })} placeholder="Argileux" />
                </div>
                <div className="space-y-2">
                  <Label>Irrigation</Label>
                  <Input value={form.irrigation_type} onChange={(e) => setForm({ ...form, irrigation_type: e.target.value })} placeholder="Pluviale" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2"><Label>Latitude</Label><Input type="number" step="any" value={form.latitude} onChange={(e) => setForm({ ...form, latitude: e.target.value })} /></div>
                <div className="space-y-2"><Label>Longitude</Label><Input type="number" step="any" value={form.longitude} onChange={(e) => setForm({ ...form, longitude: e.target.value })} /></div>
              </div>
              <Button type="submit" className="w-full gradient-primary text-primary-foreground">{editing ? "Mettre à jour" : "Créer"}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{[1,2,3].map(i => <Card key={i} className="animate-pulse"><CardContent className="h-32" /></Card>)}</div>
      ) : parcels.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Map className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">{farms.length === 0 ? "Créez d'abord une exploitation" : "Aucune parcelle. Ajoutez-en une !"}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {parcels.map((p) => (
            <Card key={p.id} className="shadow-sm hover:shadow-warm transition-shadow">
              <CardHeader className="flex flex-row items-start justify-between pb-2">
                <div>
                  <CardTitle className="text-lg">{p.name}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">{p.farms?.name}</p>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(p)}><Edit className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(p.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-1">
                <p className="text-sm"><span className="text-muted-foreground">Superficie:</span> {p.area_ha} ha</p>
                {p.soil_type && <p className="text-sm"><span className="text-muted-foreground">Sol:</span> {p.soil_type}</p>}
                {p.irrigation_type && <p className="text-sm"><span className="text-muted-foreground">Irrigation:</span> {p.irrigation_type}</p>}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ParcelsPage;
