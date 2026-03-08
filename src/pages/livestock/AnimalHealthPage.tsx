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
import { Plus, Trash2, Heart, AlertTriangle, WifiOff } from "lucide-react";
import { useOfflineData } from "@/hooks/useOfflineData";

const eventTypes = [
  { value: "vaccination", label: "💉 Vaccination" },
  { value: "traitement", label: "💊 Traitement" },
  { value: "consultation", label: "🩺 Consultation" },
  { value: "chirurgie", label: "🔪 Chirurgie" },
  { value: "deworming", label: "🐛 Vermifuge" },
  { value: "vitamine", label: "💪 Vitamine/Complément" },
  { value: "autre", label: "📝 Autre" },
];

const vaccinations = [
  "Charbon symptomatique", "Charbon bactéridien", "Pasteurellose", "Péripneumonie (PPCB)",
  "Fièvre aphteuse", "Dermatose nodulaire", "Brucellose", "Rage",
  "Newcastle (volaille)", "Gumboro (volaille)", "Choléra aviaire",
  "Peste des petits ruminants (PPR)", "Clavelée", "Peste porcine",
  "Autre",
];

const medications = [
  "Oxytétracycline", "Pénicilline", "Ivermectine", "Albendazole",
  "Diminazene (Bérénil)", "Isométamidium", "Lévamisole", "Fenbendazole",
  "Tylosine", "Amoxicilline", "Sulfadimidine", "Vitamines AD3E",
  "Fer dextran", "Anti-inflammatoire", "Autre",
];

const dosageUnits = [
  "1 ml", "2 ml", "3 ml", "5 ml", "10 ml", "15 ml", "20 ml",
  "1 comprimé", "2 comprimés", "1 sachet", "Selon poids",
];

const AnimalHealthPage = () => {
  const { data: events, loading, isOffline, insertRow, deleteRow } = useOfflineData({
    table: 'animal_health_events',
    select: '*, animals(name, species)',
    orderBy: 'event_date',
  });
  const { data: animals } = useOfflineData({
    table: 'animals',
    select: 'id, name, identification_number, species',
    queryKey: 'actif-only',
  });

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    animal_id: "", event_type: "vaccination", event_date: new Date().toISOString().split("T")[0],
    description: "", medication: "", dosage: "", cost: "", vet_name: "", next_date: "", notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await insertRow({
      animal_id: form.animal_id,
      event_type: form.event_type,
      event_date: form.event_date,
      description: form.description || null,
      medication: form.medication || null,
      dosage: form.dosage || null,
      cost: form.cost ? Number(form.cost) : 0,
      vet_name: form.vet_name || null,
      next_date: form.next_date || null,
      notes: form.notes || null,
    });
    if (result) {
      toast.success("Événement santé ajouté ✓");
      setOpen(false);
      setForm({ animal_id: "", event_type: "vaccination", event_date: new Date().toISOString().split("T")[0], description: "", medication: "", dosage: "", cost: "", vet_name: "", next_date: "", notes: "" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer cet événement ?")) return;
    const ok = await deleteRow(id);
    if (ok) toast.success("Supprimé");
  };

  const upcoming = events.filter((e: any) => e.next_date && new Date(e.next_date) > new Date());
  const isVaccination = form.event_type === "vaccination";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold">Santé animale</h1>
          {isOffline && <Badge variant="outline" className="mt-1 text-xs"><WifiOff className="h-3 w-3 mr-1" />Mode hors-ligne</Badge>}
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-1" />Nouvel événement</Button></DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Événement santé</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <Label>Animal *</Label>
                <Select value={form.animal_id} onValueChange={(v) => setForm({ ...form, animal_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Choisir l'animal..." /></SelectTrigger>
                  <SelectContent>{animals.map((a: any) => <SelectItem key={a.id} value={a.id}>{a.name || a.identification_number || a.id.slice(0, 8)} ({a.species})</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Type *</Label>
                  <Select value={form.event_type} onValueChange={(v) => setForm({ ...form, event_type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{eventTypes.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>Date</Label>
                  <Input type="date" value={form.event_date} onChange={(e) => setForm({ ...form, event_date: e.target.value })} />
                </div>
              </div>
              {isVaccination ? (
                <div className="space-y-1">
                  <Label>Vaccin</Label>
                  <Select value={form.description} onValueChange={(v) => setForm({ ...form, description: v })}>
                    <SelectTrigger><SelectValue placeholder="Choisir le vaccin..." /></SelectTrigger>
                    <SelectContent>{vaccinations.map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              ) : (
                <div className="space-y-1">
                  <Label>Description</Label>
                  <Input placeholder="Détails..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Médicament</Label>
                  <Select value={form.medication} onValueChange={(v) => setForm({ ...form, medication: v })}>
                    <SelectTrigger><SelectValue placeholder="Choisir..." /></SelectTrigger>
                    <SelectContent>{medications.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>Dosage</Label>
                  <Select value={form.dosage} onValueChange={(v) => setForm({ ...form, dosage: v })}>
                    <SelectTrigger><SelectValue placeholder="Choisir..." /></SelectTrigger>
                    <SelectContent>{dosageUnits.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1"><Label>Coût (FCFA)</Label><Input type="number" placeholder="0" value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })} /></div>
                <div className="space-y-1"><Label>Vétérinaire</Label><Input placeholder="Dr..." value={form.vet_name} onChange={(e) => setForm({ ...form, vet_name: e.target.value })} /></div>
              </div>
              <div className="space-y-1"><Label>Prochain rendez-vous</Label><Input type="date" value={form.next_date} onChange={(e) => setForm({ ...form, next_date: e.target.value })} /></div>
              <div className="space-y-1"><Label>Notes</Label><Input placeholder="Observations..." value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
              <Button type="submit" className="w-full" disabled={!form.animal_id}>Enregistrer</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {upcoming.length > 0 && (
        <Card className="border-warning/50 bg-warning/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2"><AlertTriangle className="h-5 w-5 text-warning" /><span className="font-semibold">Rappels à venir</span></div>
            <div className="space-y-1">
              {upcoming.slice(0, 5).map((e: any) => (
                <p key={e.id} className="text-sm">{e.animals?.name} — {e.event_type} le {new Date(e.next_date).toLocaleDateString("fr-FR")}</p>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-20" />)}</div>
      ) : events.length === 0 ? (
        <Card><CardContent className="p-8 text-center text-muted-foreground">Aucun événement santé enregistré</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {events.map((e: any) => (
            <Card key={e.id} className={e._offline ? 'border-dashed border-amber-400' : ''}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-start gap-3">
                  <Heart className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium">
                      {e.animals?.name || "Animal"} — <Badge variant="outline">{eventTypes.find((t) => t.value === e.event_type)?.label || e.event_type}</Badge>
                      {e._offline && <Badge variant="outline" className="ml-1 text-xs">En attente</Badge>}
                    </p>
                    <p className="text-sm text-muted-foreground">{e.description || e.medication || "—"} • {new Date(e.event_date).toLocaleDateString("fr-FR")}</p>
                    {e.cost > 0 && <p className="text-sm font-medium">{Number(e.cost).toLocaleString()} FCFA</p>}
                  </div>
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

export default AnimalHealthPage;
