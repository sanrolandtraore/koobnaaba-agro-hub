import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Trash2, Wrench, Edit2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const EquipmentPage = () => {
  const [equipment, setEquipment] = useState<any[]>([]);
  const [farms, setFarms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ farm_id: "", name: "", type: "outil", status: "disponible", purchase_date: "", purchase_cost: "", notes: "" });

  const fetchEquipment = async () => {
    const { data, error } = await supabase.from("equipment").select("*, farms(name)").order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    else setEquipment(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchEquipment();
    supabase.from("farms").select("id, name").then(({ data }) => setFarms(data || []));
  }, []);

  const resetForm = () => { setForm({ farm_id: "", name: "", type: "outil", status: "disponible", purchase_date: "", purchase_cost: "", notes: "" }); setEditing(null); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...form, purchase_cost: parseFloat(form.purchase_cost) || 0, purchase_date: form.purchase_date || null };
    if (editing) {
      const { error } = await supabase.from("equipment").update(payload).eq("id", editing.id);
      if (error) { toast.error(error.message); return; }
      toast.success("Équipement modifié !");
    } else {
      const { error } = await supabase.from("equipment").insert(payload);
      if (error) { toast.error(error.message); return; }
      toast.success("Équipement ajouté !");
    }
    resetForm(); setOpen(false); fetchEquipment();
  };

  const handleEdit = (eq: any) => {
    setForm({ farm_id: eq.farm_id, name: eq.name, type: eq.type, status: eq.status, purchase_date: eq.purchase_date || "", purchase_cost: String(eq.purchase_cost || 0), notes: eq.notes || "" });
    setEditing(eq); setOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer cet équipement ?")) return;
    const { error } = await supabase.from("equipment").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Équipement supprimé"); fetchEquipment(); }
  };

  const statusColors: Record<string, string> = { disponible: "bg-success/10 text-success", en_maintenance: "bg-warning/10 text-warning", hors_service: "bg-destructive/10 text-destructive" };
  const statusLabels: Record<string, string> = { disponible: "Disponible", en_maintenance: "En maintenance", hors_service: "Hors service" };
  const typeLabels: Record<string, string> = { outil: "Outil", machine: "Machine", vehicule: "Véhicule", irrigation: "Irrigation", stockage: "Stockage" };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold">Équipements</h1>
          <p className="text-muted-foreground mt-1">Inventaire du matériel agricole</p>
        </div>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="gradient-primary text-primary-foreground" disabled={farms.length === 0}><Plus className="h-4 w-4 mr-2" />Ajouter</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing ? "Modifier" : "Nouvel équipement"}</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Exploitation *</Label>
                <Select value={form.farm_id} onValueChange={(v) => setForm({ ...form, farm_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                  <SelectContent>{farms.map((f) => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Nom *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(typeLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Statut</Label>
                  <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(statusLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2"><Label>Date d'achat</Label><Input type="date" value={form.purchase_date} onChange={(e) => setForm({ ...form, purchase_date: e.target.value })} /></div>
                <div className="space-y-2"><Label>Coût (FCFA)</Label><Input type="number" value={form.purchase_cost} onChange={(e) => setForm({ ...form, purchase_cost: e.target.value })} /></div>
              </div>
              <Button type="submit" className="w-full gradient-primary text-primary-foreground">{editing ? "Modifier" : "Ajouter"}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{[1, 2, 3].map(i => <Card key={i} className="animate-pulse"><CardContent className="h-32" /></Card>)}</div>
      ) : equipment.length === 0 ? (
        <Card className="border-dashed"><CardContent className="flex flex-col items-center justify-center py-12"><Wrench className="h-12 w-12 text-muted-foreground mb-4" /><p className="text-muted-foreground">Aucun équipement</p></CardContent></Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {equipment.map((eq) => (
            <Card key={eq.id} className="shadow-sm hover:shadow-warm transition-shadow">
              <CardHeader className="flex flex-row items-start justify-between pb-2">
                <div>
                  <CardTitle className="text-lg">{eq.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{eq.farms?.name} · {typeLabels[eq.type] || eq.type}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Badge variant="outline" className={statusColors[eq.status] || ""}>{statusLabels[eq.status] || eq.status}</Badge>
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(eq)}><Edit2 className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(eq.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {eq.purchase_date && <div><span className="text-muted-foreground">Achat:</span> {new Date(eq.purchase_date).toLocaleDateString("fr-FR")}</div>}
                  <div><span className="text-muted-foreground">Coût:</span> {(eq.purchase_cost || 0).toLocaleString()} FCFA</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default EquipmentPage;
