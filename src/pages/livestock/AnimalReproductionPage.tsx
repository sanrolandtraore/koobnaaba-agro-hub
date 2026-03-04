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
import { Plus, Trash2, Baby } from "lucide-react";

const reproTypes = [
  { value: "saillie", label: "Saillie naturelle" },
  { value: "insemination", label: "Insémination artificielle" },
  { value: "gestation", label: "Gestation confirmée" },
  { value: "mise_bas", label: "Mise bas" },
  { value: "avortement", label: "Avortement" },
  { value: "sevrage", label: "Sevrage" },
];

const AnimalReproductionPage = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<any[]>([]);
  const [animals, setAnimals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    animal_id: "", event_type: "saillie", event_date: new Date().toISOString().split("T")[0],
    partner_id: "", expected_birth_date: "", actual_birth_date: "",
    offspring_count: "", offspring_alive: "", cost: "", notes: "",
  });

  const fetchAll = async () => {
    setLoading(true);
    const [animalsRes, eventsRes] = await Promise.all([
      supabase.from("animals").select("id, name, identification_number, species, sex").eq("status", "actif"),
      supabase.from("animal_reproductions").select("*, animals!animal_reproductions_animal_id_fkey(name, species)").order("event_date", { ascending: false }),
    ]);
    setAnimals(animalsRes.data || []);
    setEvents(eventsRes.data || []);
    setLoading(false);
  };

  useEffect(() => { if (user) fetchAll(); }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("animal_reproductions").insert({
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
    if (error) { toast.error(error.message); return; }
    toast.success("Événement reproduction ajouté");
    setOpen(false);
    setForm({ animal_id: "", event_type: "saillie", event_date: new Date().toISOString().split("T")[0], partner_id: "", expected_birth_date: "", actual_birth_date: "", offspring_count: "", offspring_alive: "", cost: "", notes: "" });
    fetchAll();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("animal_reproductions").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Événement supprimé");
    fetchAll();
  };

  const gestationsEnCours = events.filter((e) => e.expected_birth_date && !e.actual_birth_date && new Date(e.expected_birth_date) > new Date());

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl font-heading font-bold">Reproduction</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-1" />Nouvel événement</Button></DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Événement reproduction</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Select value={form.animal_id} onValueChange={(v) => setForm({ ...form, animal_id: v })}>
                <SelectTrigger><SelectValue placeholder="Animal (mère) *" /></SelectTrigger>
                <SelectContent>{animals.filter((a) => a.sex === "femelle").map((a) => <SelectItem key={a.id} value={a.id}>{a.name || a.identification_number || a.id.slice(0, 8)} ({a.species})</SelectItem>)}</SelectContent>
              </Select>
              <Select value={form.event_type} onValueChange={(v) => setForm({ ...form, event_type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{reproTypes.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
              </Select>
              <Input type="date" value={form.event_date} onChange={(e) => setForm({ ...form, event_date: e.target.value })} />
              <Select value={form.partner_id} onValueChange={(v) => setForm({ ...form, partner_id: v })}>
                <SelectTrigger><SelectValue placeholder="Père (optionnel)" /></SelectTrigger>
                <SelectContent>{animals.filter((a) => a.sex === "male").map((a) => <SelectItem key={a.id} value={a.id}>{a.name || a.identification_number || a.id.slice(0, 8)}</SelectItem>)}</SelectContent>
              </Select>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs text-muted-foreground">Date prévue mise bas</label><Input type="date" value={form.expected_birth_date} onChange={(e) => setForm({ ...form, expected_birth_date: e.target.value })} /></div>
                <div><label className="text-xs text-muted-foreground">Date réelle mise bas</label><Input type="date" value={form.actual_birth_date} onChange={(e) => setForm({ ...form, actual_birth_date: e.target.value })} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input type="number" placeholder="Nb petits nés" value={form.offspring_count} onChange={(e) => setForm({ ...form, offspring_count: e.target.value })} />
                <Input type="number" placeholder="Nb petits vivants" value={form.offspring_alive} onChange={(e) => setForm({ ...form, offspring_alive: e.target.value })} />
              </div>
              <Input type="number" placeholder="Coût (FCFA)" value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })} />
              <Input placeholder="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
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
              {gestationsEnCours.map((e) => (
                <p key={e.id} className="text-sm">{(e as any).animals?.name || "Animal"} — prévu le {new Date(e.expected_birth_date).toLocaleDateString("fr-FR")}</p>
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
          {events.map((e) => (
            <Card key={e.id}>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium">{(e as any).animals?.name || "Animal"} — <Badge variant="outline">{reproTypes.find((t) => t.value === e.event_type)?.label}</Badge></p>
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
