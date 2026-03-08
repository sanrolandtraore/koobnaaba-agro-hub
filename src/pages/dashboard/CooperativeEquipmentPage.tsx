import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Trash2, Wrench, CalendarDays } from "lucide-react";

const equipmentTypes = [
  "Tracteur", "Charrue", "Semoir", "Pulvérisateur", "Moissonneuse",
  "Motopompe", "Broyeur", "Remorque", "Autre",
];

type Member = { id: string; full_name: string };
type Parcel = { id: string; name: string };
type Schedule = {
  id: string; equipment_name: string; equipment_type: string;
  member_id: string | null; scheduled_date: string; duration_hours: number;
  parcel_id: string | null; status: string; notes: string | null;
  member_name?: string; parcel_name?: string;
};

const CooperativeEquipmentPage = () => {
  const { user } = useAuth();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    equipment_name: "", equipment_type: "Tracteur", member_id: "",
    scheduled_date: new Date().toISOString().split("T")[0],
    duration_hours: "4", parcel_id: "", notes: "",
  });

  const fetchAll = async () => {
    if (!user) return;
    const [sRes, mRes, pRes] = await Promise.all([
      supabase.from("cooperative_equipment_schedule").select("*, cooperative_members(full_name), cooperative_parcels(name)").order("scheduled_date", { ascending: false }),
      supabase.from("cooperative_members").select("id, full_name").eq("status", "actif").order("full_name"),
      supabase.from("cooperative_parcels").select("id, name").order("name"),
    ]);
    setSchedules(((sRes.data as any[]) || []).map((s: any) => ({
      ...s, member_name: s.cooperative_members?.full_name || "—",
      parcel_name: s.cooperative_parcels?.name || "—",
    })));
    setMembers((mRes.data as any[]) || []);
    setParcels((pRes.data as any[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.equipment_name || !form.scheduled_date) { toast.error("Nom et date requis"); return; }
    const { error } = await supabase.from("cooperative_equipment_schedule").insert({
      cooperative_user_id: user!.id,
      equipment_name: form.equipment_name,
      equipment_type: form.equipment_type,
      member_id: form.member_id || null,
      scheduled_date: form.scheduled_date,
      duration_hours: parseFloat(form.duration_hours) || 4,
      parcel_id: form.parcel_id || null,
      notes: form.notes || null,
    });
    if (error) { toast.error(error.message); return; }
    toast.success("Planification enregistrée");
    setOpen(false);
    setForm({ equipment_name: "", equipment_type: "Tracteur", member_id: "", scheduled_date: new Date().toISOString().split("T")[0], duration_hours: "4", parcel_id: "", notes: "" });
    fetchAll();
  };

  const deleteSchedule = async (id: string) => {
    await supabase.from("cooperative_equipment_schedule").delete().eq("id", id);
    toast.success("Planification supprimée"); fetchAll();
  };

  const statusColors: Record<string, "default" | "secondary" | "outline"> = {
    planifie: "outline", en_cours: "default", termine: "secondary",
  };

  if (loading) return <div className="space-y-4"><div className="h-8 w-64 bg-muted animate-pulse rounded" /></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold flex items-center gap-2">
            <Wrench className="h-6 w-6 text-primary" /> Mécanisation partagée
          </h1>
          <p className="text-muted-foreground mt-1">Planning d'utilisation des équipements mutualisés</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />Planifier</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Planifier l'utilisation</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div><Label>Équipement *</Label><Input value={form.equipment_name} onChange={e => setForm(f => ({ ...f, equipment_name: e.target.value }))} required /></div>
              <div><Label>Type</Label>
                <Select value={form.equipment_type} onValueChange={v => setForm(f => ({ ...f, equipment_type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{equipmentTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Membre assigné</Label>
                <Select value={form.member_id} onValueChange={v => setForm(f => ({ ...f, member_id: v }))}>
                  <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                  <SelectContent>{members.map(m => <SelectItem key={m.id} value={m.id}>{m.full_name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Date *</Label><Input type="date" value={form.scheduled_date} onChange={e => setForm(f => ({ ...f, scheduled_date: e.target.value }))} required /></div>
                <div><Label>Durée (heures)</Label><Input type="number" step="0.5" value={form.duration_hours} onChange={e => setForm(f => ({ ...f, duration_hours: e.target.value }))} /></div>
              </div>
              <div><Label>Parcelle</Label>
                <Select value={form.parcel_id} onValueChange={v => setForm(f => ({ ...f, parcel_id: v }))}>
                  <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                  <SelectContent>{parcels.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Notes</Label><Input value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} /></div>
              <Button type="submit" className="w-full">Enregistrer</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Planifications</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{schedules.length}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Heures planifiées</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{schedules.reduce((s, sc) => s + Number(sc.duration_hours), 0)}h</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Équipements</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{new Set(schedules.map(s => s.equipment_name)).size}</p></CardContent></Card>
      </div>

      {schedules.length === 0 ? (
        <Card className="border-dashed"><CardContent className="flex flex-col items-center py-12"><CalendarDays className="h-12 w-12 text-muted-foreground mb-4" /><p className="text-muted-foreground">Aucune planification</p></CardContent></Card>
      ) : (
        <Card>
          <Table>
            <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Équipement</TableHead><TableHead>Type</TableHead><TableHead>Membre</TableHead><TableHead>Parcelle</TableHead><TableHead>Durée</TableHead><TableHead>Statut</TableHead><TableHead></TableHead></TableRow></TableHeader>
            <TableBody>
              {schedules.map(s => (
                <TableRow key={s.id}>
                  <TableCell>{s.scheduled_date}</TableCell>
                  <TableCell className="font-medium">{s.equipment_name}</TableCell>
                  <TableCell>{s.equipment_type}</TableCell>
                  <TableCell>{s.member_name}</TableCell>
                  <TableCell>{s.parcel_name}</TableCell>
                  <TableCell>{s.duration_hours}h</TableCell>
                  <TableCell><Badge variant={statusColors[s.status] || "outline"}>{s.status}</Badge></TableCell>
                  <TableCell><Button variant="ghost" size="icon" onClick={() => deleteSchedule(s.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
};

export default CooperativeEquipmentPage;
