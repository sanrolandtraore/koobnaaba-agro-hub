import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Plus, Trash2, CalendarDays, CheckCircle2, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const CalendarPage = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [cycles, setCycles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ crop_cycle_id: "", title: "", event_type: "tache", planned_date: "", notes: "" });

  const fetchEvents = async () => {
    const { data, error } = await supabase.from("crop_calendar_events").select("*, crop_cycles(season, parcels(name), crop_references(name))").order("planned_date", { ascending: true });
    if (error) toast.error(error.message);
    else setEvents(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchEvents();
    supabase.from("crop_cycles").select("id, season, parcels(name), crop_references(name)").order("created_at", { ascending: false }).then(({ data }) => setCycles(data || []));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("crop_calendar_events").insert(form);
    if (error) { toast.error(error.message); return; }
    toast.success("Événement ajouté !");
    setForm({ crop_cycle_id: "", title: "", event_type: "tache", planned_date: "", notes: "" });
    setOpen(false);
    fetchEvents();
  };

  const toggleComplete = async (ev: any) => {
    const { error } = await supabase.from("crop_calendar_events").update({
      completed: !ev.completed,
      completed_date: !ev.completed ? new Date().toISOString().split("T")[0] : null,
    }).eq("id", ev.id);
    if (error) toast.error(error.message);
    else fetchEvents();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer ?")) return;
    const { error } = await supabase.from("crop_calendar_events").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Supprimé"); fetchEvents(); }
  };

  const today = new Date().toISOString().split("T")[0];
  const upcoming = events.filter(e => !e.completed && e.planned_date >= today);
  const overdue = events.filter(e => !e.completed && e.planned_date < today);
  const completed = events.filter(e => e.completed);

  const typeLabels: Record<string, string> = { tache: "Tâche", semis: "Semis", recolte: "Récolte", traitement: "Traitement", irrigation: "Irrigation", rappel: "Rappel" };
  const typeColors: Record<string, string> = { tache: "bg-info/10 text-info", semis: "bg-success/10 text-success", recolte: "bg-warning/10 text-warning", traitement: "bg-destructive/10 text-destructive", irrigation: "bg-primary/10 text-primary", rappel: "bg-muted text-muted-foreground" };

  const EventCard = ({ ev }: { ev: any }) => (
    <Card key={ev.id} className={`shadow-sm transition-shadow ${ev.completed ? "opacity-60" : "hover:shadow-warm"}`}>
      <CardContent className="flex items-center gap-3 py-3">
        <Checkbox checked={ev.completed} onCheckedChange={() => toggleComplete(ev)} />
        <div className="flex-1 min-w-0">
          <p className={`font-medium text-sm ${ev.completed ? "line-through" : ""}`}>{ev.title}</p>
          <p className="text-xs text-muted-foreground truncate">{ev.crop_cycles?.crop_references?.name} · {ev.crop_cycles?.parcels?.name} · {new Date(ev.planned_date).toLocaleDateString("fr-FR")}</p>
        </div>
        <Badge variant="outline" className={`text-xs ${typeColors[ev.event_type] || ""}`}>{typeLabels[ev.event_type] || ev.event_type}</Badge>
        <Button variant="ghost" size="icon" onClick={() => handleDelete(ev.id)}><Trash2 className="h-3 w-3 text-destructive" /></Button>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold">Calendrier cultural</h1>
          <p className="text-muted-foreground mt-1">Planification et suivi des tâches</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-primary text-primary-foreground" disabled={cycles.length === 0}><Plus className="h-4 w-4 mr-2" />Ajouter</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Nouvel événement</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Cycle cultural *</Label>
                <Select value={form.crop_cycle_id} onValueChange={(v) => setForm({ ...form, crop_cycle_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                  <SelectContent>{cycles.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.crop_references?.name || "—"} · {c.parcels?.name} · {c.season}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Titre *</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select value={form.event_type} onValueChange={(v) => setForm({ ...form, event_type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{Object.entries(typeLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label>Date prévue *</Label><Input type="date" value={form.planned_date} onChange={(e) => setForm({ ...form, planned_date: e.target.value })} required /></div>
              </div>
              <Button type="submit" className="w-full gradient-primary text-primary-foreground">Ajouter</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="space-y-3">{[1, 2, 3].map(i => <Card key={i} className="animate-pulse"><CardContent className="h-16" /></Card>)}</div>
      ) : events.length === 0 ? (
        <Card className="border-dashed"><CardContent className="flex flex-col items-center justify-center py-12"><CalendarDays className="h-12 w-12 text-muted-foreground mb-4" /><p className="text-muted-foreground">Aucun événement planifié</p></CardContent></Card>
      ) : (
        <div className="space-y-6">
          {overdue.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold flex items-center gap-2 mb-3"><AlertCircle className="h-5 w-5 text-destructive" />En retard ({overdue.length})</h2>
              <div className="space-y-2">{overdue.map(ev => <EventCard key={ev.id} ev={ev} />)}</div>
            </div>
          )}
          {upcoming.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold flex items-center gap-2 mb-3"><CalendarDays className="h-5 w-5 text-primary" />À venir ({upcoming.length})</h2>
              <div className="space-y-2">{upcoming.map(ev => <EventCard key={ev.id} ev={ev} />)}</div>
            </div>
          )}
          {completed.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold flex items-center gap-2 mb-3"><CheckCircle2 className="h-5 w-5 text-success" />Terminés ({completed.length})</h2>
              <div className="space-y-2">{completed.map(ev => <EventCard key={ev.id} ev={ev} />)}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CalendarPage;
