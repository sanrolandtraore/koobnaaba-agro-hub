import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Users, Plus, Phone, Search, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Client {
  id: string;
  client_user_id: string;
  client_full_name: string;
  client_phone: string | null;
  status: string;
  notes: string | null;
  since: string;
}

export default function ProviderClientsPage() {
  const { user } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [missionCounts, setMissionCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    const [c, m] = await Promise.all([
      supabase.from("expert_clients").select("*").eq("expert_id", user.id).order("client_full_name"),
      supabase.from("provider_missions").select("client_id").eq("provider_id", user.id),
    ]);
    setClients((c.data ?? []) as Client[]);
    const counts: Record<string, number> = {};
    (m.data ?? []).forEach((r: any) => { if (r.client_id) counts[r.client_id] = (counts[r.client_id] || 0) + 1; });
    setMissionCounts(counts);
    setLoading(false);
  };

  useEffect(() => { load();   }, [user]);

  const save = async () => {
    if (!user || !name.trim()) return;
    setSaving(true);
    const { error } = await supabase.from("expert_clients").insert({
      expert_id: user.id,
      client_user_id: crypto.randomUUID(),
      client_full_name: name.trim(),
      client_phone: phone.trim() || null,
      notes: notes.trim() || null,
    });
    setSaving(false);
    if (error) { toast({ title: "Erreur", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Client ajouté" });
    setName(""); setPhone(""); setNotes(""); setOpen(false); load();
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("expert_clients").delete().eq("id", id);
    if (error) { toast({ title: "Erreur", description: error.message, variant: "destructive" }); return; }
    load();
  };

  const list = clients.filter((c) =>
    !q.trim() ||
    c.client_full_name.toLowerCase().includes(q.toLowerCase()) ||
    (c.client_phone || "").includes(q)
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10 text-primary"><Users className="h-5 w-5" /></div>
          <div>
            <h1 className="text-xl font-bold">Mes clients</h1>
            <p className="text-sm text-muted-foreground">Producteurs et éleveurs que vous suivez</p>
          </div>
        </div>
        <Button onClick={() => setOpen(true)}><Plus className="h-4 w-4 mr-1" /> Ajouter</Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input className="pl-9" placeholder="Rechercher un client…" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Chargement…</p>
      ) : list.length === 0 ? (
        <Card><CardContent className="py-10 text-center text-muted-foreground">Aucun client enregistré.</CardContent></Card>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {list.map((c) => (
            <Card key={c.id}>
              <CardHeader className="pb-2 flex flex-row items-start justify-between gap-2">
                <div>
                  <CardTitle className="text-base">{c.client_full_name}</CardTitle>
                  <p className="text-xs text-muted-foreground">Client depuis le {new Date(c.since).toLocaleDateString("fr-FR")}</p>
                </div>
                <Badge variant="secondary">{missionCounts[c.id] || 0} mission(s)</Badge>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {c.client_phone && (
                  <p className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                    <a href={`tel:${c.client_phone}`} className="hover:text-primary">{c.client_phone}</a>
                  </p>
                )}
                {c.notes && <p className="text-muted-foreground">{c.notes}</p>}
                <Button variant="ghost" size="sm" className="text-destructive" onClick={() => remove(c.id)}>
                  <Trash2 className="h-4 w-4 mr-1" /> Supprimer
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Nouveau client</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Nom complet</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
            <div><Label>Téléphone</Label><Input value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
            <div><Label>Notes</Label><Textarea value={notes} onChange={(e) => setNotes(e.target.value)} /></div>
          </div>
          <DialogFooter>
            <Button onClick={save} disabled={saving || !name.trim()}>Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
