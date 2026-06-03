import { useState, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Plus, Trash2, Filter, WifiOff, Users } from "lucide-react";
import { useOfflineData } from "@/hooks/useOfflineData";
import { useDefaultLivestockFarm } from "@/hooks/useDefaultLivestockFarm";

const speciesOptions = [
  { value: "bovin", label: "Bovin 🐄" },
  { value: "ovin", label: "Ovin 🐑" },
  { value: "caprin", label: "Caprin 🐐" },
  { value: "porcin", label: "Porcin 🐷" },
  { value: "volaille", label: "Volaille 🐔" },
  { value: "pisciculture", label: "Pisciculture 🐟" },
];

// Species tracked as groups/lots by default
const GROUP_SPECIES = new Set(["volaille", "pisciculture"]);

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
  ovin: ["Bali-Bali", "Djallonké", "Mouton du Sahel", "Oudah", "Touareg", "Peulh", "Métis", "Autre"],
  caprin: ["Chèvre du Sahel", "Chèvre naine", "Chèvre rousse", "Alpine", "Saanen", "Boer", "Métis", "Autre"],
  porcin: ["Large White", "Landrace", "Duroc", "Porc local", "Piétrain", "Métis", "Autre"],
  volaille: ["Poulet local", "Poulet de chair", "Pondeuse", "Pintade", "Canard", "Dinde", "Caille", "Autre"],
  pisciculture: ["Tilapia", "Clarias (silure)", "Carpe", "Capitaine", "Autre"],
};

const emptyForm = {
  species: "bovin", is_group: false, group_label: "", group_size: "", mortality_count: "",
  name: "", identification_number: "",
  breed: "", sex: "inconnu", birth_date: "", acquisition_date: new Date().toISOString().split("T")[0],
  acquisition_cost: "", weight_kg: "", notes: "",
};

const AnimalsPage = () => {
  const { user } = useAuth();
  const { farmId } = useDefaultLivestockFarm();
  const { data: animals, loading, isOffline, insertRow, deleteRow } = useOfflineData({
    table: 'animals',
    select: '*',
  });

  const [open, setOpen] = useState(false);
  const [filterSpecies, setFilterSpecies] = useState<string>("all");
  const [filterMode, setFilterMode] = useState<"all" | "individual" | "group">("all");
  const [form, setForm] = useState(emptyForm);

  const handleSpeciesChange = (v: string) => {
    setForm((f) => ({ ...f, species: v, breed: "", is_group: GROUP_SPECIES.has(v) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!farmId) { toast.error("Initialisation en cours, réessayez"); return; }
    if (form.is_group && (!form.group_size || Number(form.group_size) < 1)) {
      toast.error("Indiquez l'effectif du lot"); return;
    }
    const payload: any = {
      farm_id: farmId,
      species: form.species,
      is_group: form.is_group,
      group_label: form.is_group ? (form.group_label || null) : null,
      group_size: form.is_group ? Number(form.group_size) : null,
      mortality_count: form.is_group ? (form.mortality_count ? Number(form.mortality_count) : 0) : 0,
      name: form.is_group ? (form.group_label || null) : (form.name || null),
      identification_number: form.identification_number || null,
      breed: form.breed || null,
      sex: form.is_group ? "inconnu" : form.sex,
      birth_date: form.birth_date || null,
      acquisition_date: form.acquisition_date,
      acquisition_cost: form.acquisition_cost ? Number(form.acquisition_cost) : 0,
      weight_kg: form.weight_kg ? Number(form.weight_kg) : null,
      notes: form.notes || null,
    };
    const result = await insertRow(payload);
    if (result) {
      toast.success(form.is_group ? "Lot enregistré ✓" : "Animal ajouté ✓");
      setOpen(false);
      setForm({ ...emptyForm, acquisition_date: new Date().toISOString().split("T")[0] });
    }
  };

  const handleDelete = async (id: string, isGroup: boolean) => {
    if (!confirm(isGroup ? "Supprimer ce lot ?" : "Supprimer cet animal ?")) return;
    const ok = await deleteRow(id);
    if (ok) toast.success("Supprimé");
  };

  const filtered = useMemo(() => {
    let list = animals as any[];
    if (filterSpecies !== "all") list = list.filter((a) => a.species === filterSpecies);
    if (filterMode === "individual") list = list.filter((a) => !a.is_group);
    if (filterMode === "group") list = list.filter((a) => a.is_group);
    return list;
  }, [animals, filterSpecies, filterMode]);

  const currentBreeds = breedsBySpecies[form.species] || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold">Registre des animaux</h1>
          {isOffline && <Badge variant="outline" className="mt-1 text-xs"><WifiOff className="h-3 w-3 mr-1" />Mode hors-ligne</Badge>}
        </div>
        <div className="flex gap-2 flex-wrap">
          <Select value={filterMode} onValueChange={(v: any) => setFilterMode(v)}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous</SelectItem>
              <SelectItem value="individual">Individuels</SelectItem>
              <SelectItem value="group">Lots / groupes</SelectItem>
            </SelectContent>
          </Select>
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
              <DialogHeader><DialogTitle>{form.is_group ? "Nouveau lot / groupe" : "Nouvel animal"}</DialogTitle></DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">



                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label>Espèce *</Label>
                    <Select value={form.species} onValueChange={handleSpeciesChange}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{speciesOptions.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label>Race / souche</Label>
                    <Select value={form.breed} onValueChange={(v) => setForm({ ...form, breed: v })}>
                      <SelectTrigger><SelectValue placeholder="Choisir..." /></SelectTrigger>
                      <SelectContent>{currentBreeds.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-lg border p-3 bg-muted/30">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-sm font-medium">Suivi par lot / groupe</p>
                      <p className="text-xs text-muted-foreground">Recommandé pour poissons & volaille</p>
                    </div>
                  </div>
                  <Switch checked={form.is_group} onCheckedChange={(v) => setForm({ ...form, is_group: v })} />
                </div>

                {form.is_group ? (
                  <>
                    <div className="space-y-1">
                      <Label>Nom du lot</Label>
                      <Input placeholder="Ex: Lot poulets chair n°3, Bassin Tilapia A" value={form.group_label} onChange={(e) => setForm({ ...form, group_label: e.target.value })} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label>Effectif du lot *</Label>
                        <Input type="number" min="1" placeholder="Ex: 200" value={form.group_size} onChange={(e) => setForm({ ...form, group_size: e.target.value })} />
                      </div>
                      <div className="space-y-1">
                        <Label>Mortalités cumulées</Label>
                        <Input type="number" min="0" placeholder="0" value={form.mortality_count} onChange={(e) => setForm({ ...form, mortality_count: e.target.value })} />
                      </div>
                    </div>
                  </>
                ) : (
                  <>
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
                  </>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1"><Label>{form.is_group ? "Date mise en place" : "Date naissance"}</Label><Input type="date" value={form.birth_date} onChange={(e) => setForm({ ...form, birth_date: e.target.value })} /></div>
                  <div className="space-y-1"><Label>Date acquisition</Label><Input type="date" value={form.acquisition_date} onChange={(e) => setForm({ ...form, acquisition_date: e.target.value })} /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1"><Label>Coût {form.is_group ? "du lot" : ""} (FCFA)</Label><Input type="number" placeholder="0" value={form.acquisition_cost} onChange={(e) => setForm({ ...form, acquisition_cost: e.target.value })} /></div>
                  <div className="space-y-1"><Label>Poids {form.is_group ? "moyen " : ""}(kg)</Label><Input type="number" placeholder="0" value={form.weight_kg} onChange={(e) => setForm({ ...form, weight_kg: e.target.value })} /></div>
                </div>
                <div className="space-y-1"><Label>Notes</Label><Input placeholder="Observations..." value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
                <Button type="submit" className="w-full" disabled={!farmId}>Enregistrer</Button>
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
          {filtered.map((a: any) => {
            const alive = a.is_group ? Math.max(0, (a.group_size || 0) - (a.mortality_count || 0)) : null;
            return (
              <Card key={a.id} className={a._offline ? 'border-dashed border-amber-400' : ''}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold flex items-center gap-1">
                        {a.is_group && <Users className="h-4 w-4 text-primary" />}
                        {a.group_label || a.name || a.identification_number || "Sans nom"}
                        {a._offline && <Badge variant="outline" className="ml-2 text-xs">En attente</Badge>}
                      </p>
                      {a.breed && <p className="text-sm text-muted-foreground">{a.breed}</p>}
                    </div>
                    <div className="flex gap-1">
                      <Badge variant="outline">{speciesOptions.find((s) => s.value === a.species)?.label}</Badge>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(a.id, a.is_group)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-1 text-xs text-muted-foreground">
                    {a.is_group ? (
                      <>
                        <span className="font-medium text-foreground">Effectif: {alive} / {a.group_size}</span>
                        {a.mortality_count > 0 && <span>Mortalités: {a.mortality_count}</span>}
                        {a.breed && <span>Souche: {a.breed}</span>}
                        {a.weight_kg && <span>Poids moy: {a.weight_kg} kg</span>}
                      </>
                    ) : (
                      <>
                        {a.breed && <span>Race: {a.breed}</span>}
                        <span>Sexe: {sexOptions.find((s) => s.value === a.sex)?.label}</span>
                        {a.weight_kg && <span>Poids: {a.weight_kg} kg</span>}
                        {a.birth_date && <span>Né: {new Date(a.birth_date).toLocaleDateString("fr-FR")}</span>}
                      </>
                    )}
                    <span>Statut: {statusOptions.find(s => s.value === a.status)?.label || a.status}</span>
                    {a.acquisition_cost > 0 && <span>Coût: {Number(a.acquisition_cost).toLocaleString()} FCFA</span>}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AnimalsPage;
