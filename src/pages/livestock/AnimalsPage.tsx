import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Trash2, Filter, WifiOff } from "lucide-react";
import { useOfflineData } from "@/hooks/useOfflineData";

const speciesOptions = [
  { value: "bovin", label: "Bovin 🐄" },
  { value: "caprin", label: "Caprin 🐐" },
  { value: "porcin", label: "Porcin 🐷" },
  { value: "volaille", label: "Volaille 🐔" },
  { value: "pisciculture", label: "Pisciculture 🐟" },
];

const sexOptions = [
  { value: "male", label: "Mâle" },
  { value: "femelle", label: "Femelle" },
  { value: "inconnu", label: "Inconnu" },
];

const statusOptions = [
  { value: "actif", label: "Actif" },
  { value: "vendu", label: "Vendu" },
  { value: "mort", label: "Mort" },
  { value: "réformé", label: "Réformé" },
];

const breedsBySpecies: Record<string, string[]> = {
  bovin: ["Zébu Peulh", "Zébu Azawak", "Zébu Bororo", "N'Dama", "Baoulé", "Borgou", "Métis", "Holstein", "Charolais", "Brahman", "Autre"],
  caprin: ["Chèvre du Sahel", "Chèvre naine", "Chèvre rousse", "Alpine", "Saanen", "Boer", "Métis", "Autre"],
  porcin: ["Large White", "Landrace", "Duroc", "Porc local", "Piétrain", "Métis", "Autre"],
  volaille: ["Poulet local", "Poulet de chair", "Pondeuse", "Pintade", "Canard", "Dinde", "Caille", "Autre"],
  pisciculture: ["Tilapia", "Clarias (silure)", "Carpe", "Capitaine", "Autre"],
};

const AnimalsPage = () => {
  const { user } = useAuth();
  const { data: animals, loading, isOffline, insertRow, deleteRow } = useOfflineData({
    table: 'animals',
    select: '*, farms(name)',
  });
  const { data: farms } = useOfflineData({ table: 'farms', select: 'id, name' });

  const [open, setOpen] = useState(false);
  const [filterSpecies, setFilterSpecies] = useState<string>("all");
  const [form, setForm] = useState({
    farm_id: "", species: "bovin", name: "", identification_number: "",
    breed: "", sex: "inconnu", birth_date: "", acquisition_date: new Date().toISOString().split("T")[0],
    acquisition_cost: "", weight_kg: "", notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.farm_id) { toast.error("Veuillez sélectionner une exploitation"); return; }
    const result = await insertRow({
      farm_id: form.farm_id,
      species: form.species,
      name: form.name || null,
      identification_number: form.identification_number || null,
      breed: form.breed || null,
      sex: form.sex,
      birth_date: form.birth_date || null,
      acquisition_date: form.acquisition_date,
      acquisition_cost: form.acquisition_cost ? Number(form.acquisition_cost) : 0,
      weight_kg: form.weight_kg ? Number(form.weight_kg) : null,
      notes: form.notes || null,
    });
    if (result) {
      toast.success("Animal ajouté ✓");
      setOpen(false);
      setForm({ farm_id: "", species: "bovin", name: "", identification_number: "", breed: "", sex: "inconnu", birth_date: "", acquisition_date: new Date().toISOString().split("T")[0], acquisition_cost: "", weight_kg: "", notes: "" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer cet animal ?")) return;
    const ok = await deleteRow(id);
    if (ok) toast.success("Animal supprimé");
  };

  const filtered = filterSpecies === "all" ? animals : animals.filter((a: any) => a.species === filterSpecies);
  const currentBreeds = breedsBySpecies[form.species] || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold">Registre des animaux</h1>
          {isOffline && <Badge variant="outline" className="mt-1 text-xs"><WifiOff className="h-3 w-3 mr-1" />Mode hors-ligne</Badge>}
        </div>
        <div className="flex gap-2">
          <Select value={filterSpecies} onValueChange={setFilterSpecies}>
            <SelectTrigger className="w-44"><Filter className="h-4 w-4 mr-1" /><SelectValue /></SelectTrigger>
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
                <div className="space-y-1">
                  <Label>Exploitation *</Label>
                  <Select value={form.farm_id} onValueChange={(v) => setForm({ ...form, farm_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Choisir..." /></SelectTrigger>
                    <SelectContent>{farms.map((f: any) => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label>Espèce *</Label>
                    <Select value={form.species} onValueChange={(v) => setForm({ ...form, species: v, breed: "" })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{speciesOptions.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label>Race</Label>
                    <Select value={form.breed} onValueChange={(v) => setForm({ ...form, breed: v })}>
                      <SelectTrigger><SelectValue placeholder="Choisir..." /></SelectTrigger>
                      <SelectContent>{currentBreeds.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label>Nom / Identifiant</Label>
                    <Input placeholder="Ex: Bella, N°042" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                  </div>
                  <div className="space-y-1">
                    <Label>Sexe</Label>
                    <Select value={form.sex} onValueChange={(v) => setForm({ ...form, sex: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{sexOptions.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
                <Input placeholder="N° identification (boucle, tatouage...)" value={form.identification_number} onChange={(e) => setForm({ ...form, identification_number: e.target.value })} />
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1"><Label>Date naissance</Label><Input type="date" value={form.birth_date} onChange={(e) => setForm({ ...form, birth_date: e.target.value })} /></div>
                  <div className="space-y-1"><Label>Date acquisition</Label><Input type="date" value={form.acquisition_date} onChange={(e) => setForm({ ...form, acquisition_date: e.target.value })} /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1"><Label>Coût acquisition (FCFA)</Label><Input type="number" placeholder="0" value={form.acquisition_cost} onChange={(e) => setForm({ ...form, acquisition_cost: e.target.value })} /></div>
                  <div className="space-y-1"><Label>Poids (kg)</Label><Input type="number" placeholder="0" value={form.weight_kg} onChange={(e) => setForm({ ...form, weight_kg: e.target.value })} /></div>
                </div>
                <div className="space-y-1"><Label>Notes</Label><Input placeholder="Observations..." value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
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
          {filtered.map((a: any) => (
            <Card key={a.id} className={a._offline ? 'border-dashed border-amber-400' : ''}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold">
                      {a.name || a.identification_number || "Sans nom"}
                      {a._offline && <Badge variant="outline" className="ml-2 text-xs">En attente</Badge>}
                    </p>
                    <p className="text-sm text-muted-foreground">{a.farms?.name}</p>
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
                  <span>Statut: {statusOptions.find(s => s.value === a.status)?.label || a.status}</span>
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
