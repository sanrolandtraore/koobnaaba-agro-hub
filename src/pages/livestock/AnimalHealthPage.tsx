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
import { Plus, Trash2, Heart, AlertTriangle } from "lucide-react";

const eventTypes = [
  { value: "vaccination", label: "Vaccination" },
  { value: "traitement", label: "Traitement" },
  { value: "consultation", label: "Consultation" },
  { value: "chirurgie", label: "Chirurgie" },
  { value: "deworming", label: "Vermifuge" },
  { value: "autre", label: "Autre" },
];

const AnimalHealthPage = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<any[]>([]);
  const [animals, setAnimals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    animal_id: "", event_type: "vaccination", event_date: new Date().toISOString().split("T")[0],
    description: "", medication: "", dosage: "", cost: "", vet_name: "", next_date: "", notes: "",
  });

  const fetchAll = async () => {
    setLoading(true);
    const [animalsRes, eventsRes] = await Promise.all([
      supabase.from("animals").select("id, name, identification_number, species").eq("status", "actif"),
      supabase.from("animal_health_events").select("*, animals(name, species)").order("event_date", { ascending: false }),
    ]);
    setAnimals(animalsRes.data || []);
    setEvents(eventsRes.data || []);
    setLoading(false);
  };

  useEffect(() => { if (user) fetchAll(); }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("animal_health_events").insert({
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
    if (error) { toast.error(error.message); return; }
    toast.success("Événement santé ajouté");
    setOpen(false);
    setForm({ animal_id: "", event_type: "vaccination", event_date: new Date().toISOString().split("T")[0], description: "", medication: "", dosage: "", cost: "", vet_name: "", next_date: "", notes: "" });
    fetchAll();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("animal_health_events").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Événement supprimé");
    fetchAll();
  };

  const upcoming = events.filter((e) => e.next_date && new Date(e.next_date) > new Date());

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl font-heading font-bold">Santé animale</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-1" />Nouvel événement</Button></DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Événement santé</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Select value={form.animal_id} onValueChange={(v) => setForm({ ...form, animal_id: v })}>
                <SelectTrigger><SelectValue placeholder="Animal *" /></SelectTrigger>
                <SelectContent>{animals.map((a) => <SelectItem key={a.id} value={a.id}>{a.name || a.identification_number || a.id.slice(0, 8)} ({a.species})</SelectItem>)}</SelectContent>
              </Select>
              <Select value={form.event_type} onValueChange={(v) => setForm({ ...form, event_type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{eventTypes.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
              </Select>
              <Input type="date" value={form.event_date} onChange={(e) => setForm({ ...form, event_date: e.target.value })} />
              <Input placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              <div className="grid grid-cols-2 gap-3">
                <Input placeholder="Médicament" value={form.medication} onChange={(e) => setForm({ ...form, medication: e.target.value })} />
                <Input placeholder="Dosage" value={form.dosage} onChange={(e) => setForm({ ...form, dosage: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input type="number" placeholder="Coût (FCFA)" value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })} />
                <Input placeholder="Vétérinaire" value={form.vet_name} onChange={(e) => setForm({ ...form, vet_name: e.target.value })} />
              </div>
              <div><label className="text-xs text-muted-foreground">Prochain rendez-vous</label><Input type="date" value={form.next_date} onChange={(e) => setForm({ ...form, next_date: e.target.value })} /></div>
              <Input placeholder="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
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
              {upcoming.slice(0, 5).map((e) => (
                <p key={e.id} className="text-sm">{(e as any).animals?.name} — {e.event_type} le {new Date(e.next_date).toLocaleDateString("fr-FR")}</p>
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
          {events.map((e) => (
            <Card key={e.id}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-start gap-3">
                  <Heart className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium">{(e as any).animals?.name || "Animal"} — <Badge variant="outline">{eventTypes.find((t) => t.value === e.event_type)?.label}</Badge></p>
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
