import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Trash2, Edit, Filter } from "lucide-react";

const speciesOptions = [
  { value: "bovin", label: "Bovin" },
  { value: "caprin", label: "Caprin" },
  { value: "porcin", label: "Porcin" },
  { value: "volaille", label: "Volaille" },
  { value: "pisciculture", label: "Pisciculture" },
];

const sexOptions = [
  { value: "male", label: "Mâle" },
  { value: "femelle", label: "Femelle" },
  { value: "inconnu", label: "Inconnu" },
];

const statusOptions = ["actif", "vendu", "mort", "réformé"];

const AnimalsPage = () => {
  const { user } = useAuth();
  const [animals, setAnimals] = useState<any[]>([]);
  const [farms, setFarms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [filterSpecies, setFilterSpecies] = useState<string>("all");
  const [form, setForm] = useState({
    farm_id: "", species: "bovin", name: "", identification_number: "",
    breed: "", sex: "inconnu", birth_date: "", acquisition_date: new Date().toISOString().split("T")[0],
    acquisition_cost: "", weight_kg: "", notes: "",
  });

  const fetchAll = async () => {
    setLoading(true);
    const [farmsRes, animalsRes] = await Promise.all([
      supabase.from("farms").select("id, name"),
      supabase.from("animals").select("*, farms(name)").order("created_at", { ascending: false }),
    ]);
    setFarms(farmsRes.data || []);
    setAnimals(animalsRes.data || []);
    setLoading(false);
  };

  useEffect(() => { if (user) fetchAll(); }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("animals").insert({
      farm_id: form.farm_id,
      species: form.species as any,
      name: form.name || null,
      identification_number: form.identification_number || null,
      breed: form.breed || null,
      sex: form.sex as any,
      birth_date: form.birth_date || null,
      acquisition_date: form.acquisition_date,
      acquisition_cost: form.acquisition_cost ? Number(form.acquisition_cost) : 0,
      weight_kg: form.weight_kg ? Number(form.weight_kg) : null,
      notes: form.notes || null,
    });
    if (error) { toast.error(error.message); return; }
    toast.success("Animal ajouté");
    setOpen(false);
    setForm({ farm_id: "", species: "bovin", name: "", identification_number: "", breed: "", sex: "inconnu", birth_date: "", acquisition_date: new Date().toISOString().split("T")[0], acquisition_cost: "", weight_kg: "", notes: "" });
    fetchAll();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("animals").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Animal supprimé");
    fetchAll();
  };

  const filtered = filterSpecies === "all" ? animals : animals.filter((a) => a.species === filterSpecies);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl font-heading font-bold">Registre des animaux</h1>
        <div className="flex gap-2">
          <Select value={filterSpecies} onValueChange={setFilterSpecies}>
            <SelectTrigger className="w-40"><Filter className="h-4 w-4 mr-1" /><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes espèces</SelectItem>
              {speciesOptions.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-1" />Ajouter</Button></DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle>Nouvel animal</DialogTitle></DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Select value={form.farm_id} onValueChange={(v) => setForm({ ...form, farm_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Exploitation *" /></SelectTrigger>
                  <SelectContent>{farms.map((f) => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}</SelectContent>
                </Select>
                <Select value={form.species} onValueChange={(v) => setForm({ ...form, species: v })}>
                  <SelectTrigger><SelectValue placeholder="Espèce *" /></SelectTrigger>
                  <SelectContent>{speciesOptions.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
                </Select>
                <Input placeholder="Nom / identifiant" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                <Input placeholder="N° identification" value={form.identification_number} onChange={(e) => setForm({ ...form, identification_number: e.target.value })} />
                <Input placeholder="Race" value={form.breed} onChange={(e) => setForm({ ...form, breed: e.target.value })} />
                <Select value={form.sex} onValueChange={(v) => setForm({ ...form, sex: v })}>
                  <SelectTrigger><SelectValue placeholder="Sexe" /></SelectTrigger>
                  <SelectContent>{sexOptions.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
                </Select>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-xs text-muted-foreground">Date naissance</label><Input type="date" value={form.birth_date} onChange={(e) => setForm({ ...form, birth_date: e.target.value })} /></div>
                  <div><label className="text-xs text-muted-foreground">Date acquisition</label><Input type="date" value={form.acquisition_date} onChange={(e) => setForm({ ...form, acquisition_date: e.target.value })} /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Input type="number" placeholder="Coût acquisition" value={form.acquisition_cost} onChange={(e) => setForm({ ...form, acquisition_cost: e.target.value })} />
                  <Input type="number" placeholder="Poids (kg)" value={form.weight_kg} onChange={(e) => setForm({ ...form, weight_kg: e.target.value })} />
                </div>
                <Input placeholder="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
                <Button type="submit" className="w-full" disabled={!form.farm_id}>Enregistrer</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{[...Array(6)].map((_, i) => <Skeleton key={i} className="h-40" />)}</div>
      ) : filtered.length === 0 ? (
        <Card><CardContent className="p-8 text-center text-muted-foreground">Aucun animal enregistré</CardContent></Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((a) => (
            <Card key={a.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold">{a.name || a.identification_number || "Sans nom"}</p>
                    <p className="text-sm text-muted-foreground">{(a as any).farms?.name}</p>
                  </div>
                  <div className="flex gap-1">
                    <Badge variant="outline">{speciesOptions.find((s) => s.value === a.species)?.label}</Badge>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(a.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-1 text-xs text-muted-foreground">
                  {a.breed && <span>Race: {a.breed}</span>}
                  <span>Sexe: {sexOptions.find((s) => s.value === a.sex)?.label}</span>
                  {a.weight_kg && <span>Poids: {a.weight_kg} kg</span>}
                  {a.birth_date && <span>Né: {new Date(a.birth_date).toLocaleDateString("fr-FR")}</span>}
                  <span>Statut: {a.status}</span>
                  {a.acquisition_cost > 0 && <span>Coût: {Number(a.acquisition_cost).toLocaleString()} FCFA</span>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AnimalsPage;
