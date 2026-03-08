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
import { Plus, Trash2, Baby, WifiOff } from "lucide-react";
import { useOfflineData } from "@/hooks/useOfflineData";

const reproTypes = [
  { value: "saillie", label: "🐂 Saillie naturelle" },
  { value: "insemination", label: "💉 Insémination artificielle" },
  { value: "gestation", label: "🤰 Gestation confirmée" },
  { value: "mise_bas", label: "👶 Mise bas" },
  { value: "avortement", label: "⚠️ Avortement" },
  { value: "sevrage", label: "🍼 Sevrage" },
];

const offspringOptions = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "12", "15", "20"];

const AnimalReproductionPage = () => {
  const { data: events, loading, isOffline, insertRow, deleteRow } = useOfflineData({
    table: 'animal_reproductions',
    select: '*, animals!animal_reproductions_animal_id_fkey(name, species)',
    orderBy: 'event_date',
  });
  const { data: animals } = useOfflineData({
    table: 'animals',
    select: 'id, name, identification_number, species, sex',
  });

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    animal_id: "", event_type: "saillie", event_date: new Date().toISOString().split("T")[0],
    partner_id: "", expected_birth_date: "", actual_birth_date: "",
    offspring_count: "", offspring_alive: "", cost: "", notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await insertRow({
      animal_id: form.animal_id,
      event_type: form.event_type,
      event_date: form.event_date,
      partner_id: form.partner_id || null,
      expected_birth_date: form.expected_birth_date || null,
      actual_birth_date: form.actual_birth_date || null,
      offspring_count: form.offspring_count ? Number(form.offspring_count) : 0,
      offspring_alive: form.offspring_alive ? Number(form.offspring_alive) : 0,
      cost: form.cost ? Number(form.cost) : 0,
      notes: form.notes || null,
    });
    if (result) {
      toast.success("Événement reproduction ajouté ✓");
      setOpen(false);
      setForm({ animal_id: "", event_type: "saillie", event_date: new Date().toISOString().split("T")[0], partner_id: "", expected_birth_date: "", actual_birth_date: "", offspring_count: "", offspring_alive: "", cost: "", notes: "" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer ?")) return;
    const ok = await deleteRow(id);
    if (ok) toast.success("Supprimé");
  };

  const gestationsEnCours = events.filter((e: any) => e.expected_birth_date && !e.actual_birth_date && new Date(e.expected_birth_date) > new Date());
  const females = animals.filter((a: any) => a.sex === "femelle");
  const males = animals.filter((a: any) => a.sex === "male");
  const showOffspring = ["mise_bas", "avortement"].includes(form.event_type);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold">Reproduction</h1>
          {isOffline && <Badge variant="outline" className="mt-1 text-xs"><WifiOff className="h-3 w-3 mr-1" />Mode hors-ligne</Badge>}
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-1" />Nouvel événement</Button></DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Événement reproduction</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <Label>Animal (mère) *</Label>
                <Select value={form.animal_id} onValueChange={(v) => setForm({ ...form, animal_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Choisir la femelle..." /></SelectTrigger>
                  <SelectContent>{females.map((a: any) => <SelectItem key={a.id} value={a.id}>{a.name || a.identification_number || a.id.slice(0, 8)} ({a.species})</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Type *</Label>
                  <Select value={form.event_type} onValueChange={(v) => setForm({ ...form, event_type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{reproTypes.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1"><Label>Date</Label><Input type="date" value={form.event_date} onChange={(e) => setForm({ ...form, event_date: e.target.value })} /></div>
              </div>
              <div className="space-y-1">
                <Label>Père (optionnel)</Label>
                <Select value={form.partner_id} onValueChange={(v) => setForm({ ...form, partner_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Choisir le mâle..." /></SelectTrigger>
                  <SelectContent>{males.map((a: any) => <SelectItem key={a.id} value={a.id}>{a.name || a.identification_number || a.id.slice(0, 8)}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1"><Label>Date prévue mise bas</Label><Input type="date" value={form.expected_birth_date} onChange={(e) => setForm({ ...form, expected_birth_date: e.target.value })} /></div>
                <div className="space-y-1"><Label>Date réelle mise bas</Label><Input type="date" value={form.actual_birth_date} onChange={(e) => setForm({ ...form, actual_birth_date: e.target.value })} /></div>
              </div>
              {showOffspring && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label>Nb petits nés</Label>
                    <Select value={form.offspring_count} onValueChange={(v) => setForm({ ...form, offspring_count: v })}>
                      <SelectTrigger><SelectValue placeholder="0" /></SelectTrigger>
                      <SelectContent>{offspringOptions.map((n) => <SelectItem key={n} value={n}>{n}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label>Nb petits vivants</Label>
                    <Select value={form.offspring_alive} onValueChange={(v) => setForm({ ...form, offspring_alive: v })}>
                      <SelectTrigger><SelectValue placeholder="0" /></SelectTrigger>
                      <SelectContent>{offspringOptions.map((n) => <SelectItem key={n} value={n}>{n}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
              )}
              <div className="space-y-1"><Label>Coût (FCFA)</Label><Input type="number" placeholder="0" value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })} /></div>
              <div className="space-y-1"><Label>Notes</Label><Input placeholder="Observations..." value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
              <Button type="submit" className="w-full" disabled={!form.animal_id}>Enregistrer</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {gestationsEnCours.length > 0 && (
        <Card className="border-blue-500/50 bg-blue-50/50 dark:bg-blue-950/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2"><Baby className="h-5 w-5 text-blue-500" /><span className="font-semibold">Gestations en cours ({gestationsEnCours.length})</span></div>
            <div className="space-y-1">
              {gestationsEnCours.map((e: any) => (
                <p key={e.id} className="text-sm">{e.animals?.name || "Animal"} — prévu le {new Date(e.expected_birth_date).toLocaleDateString("fr-FR")}</p>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-20" />)}</div>
      ) : events.length === 0 ? (
        <Card><CardContent className="p-8 text-center text-muted-foreground">Aucun événement de reproduction</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {events.map((e: any) => (
            <Card key={e.id} className={e._offline ? 'border-dashed border-amber-400' : ''}>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium">
                    {e.animals?.name || "Animal"} — <Badge variant="outline">{reproTypes.find((t) => t.value === e.event_type)?.label || e.event_type}</Badge>
                    {e._offline && <Badge variant="outline" className="ml-1 text-xs">En attente</Badge>}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(e.event_date).toLocaleDateString("fr-FR")}
                    {e.offspring_count > 0 && ` • ${e.offspring_alive}/${e.offspring_count} petits vivants`}
                    {e.cost > 0 && ` • ${Number(e.cost).toLocaleString()} FCFA`}
                  </p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(e.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AnimalReproductionPage;
