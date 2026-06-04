import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Phone, Mail, MapPin, Globe } from "lucide-react";
import { toast } from "sonner";

export type PartnerCategory = "fournisseur" | "assurance" | "programme" | "banque";

interface Entry {
  id: string;
  category: PartnerCategory;
  name: string;
  contact_name: string | null;
  phone: string | null;
  email: string | null;
  location: string | null;
  website: string | null;
  description: string | null;
}

interface Props {
  category: PartnerCategory;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
}

const empty = { name: "", contact_name: "", phone: "", email: "", location: "", website: "", description: "" };

export default function PartnerEntriesPage({ category, title, subtitle, icon }: Props) {
  const { user } = useAuth();
  const [items, setItems] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Entry | null>(null);
  const [form, setForm] = useState(empty);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("partner_entries")
      .select("*")
      .eq("category", category)
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setItems((data as any) || []);
    setLoading(false);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [user, category]);

  const startCreate = () => { setEditing(null); setForm(empty); setOpen(true); };
  const startEdit = (e: Entry) => {
    setEditing(e);
    setForm({
      name: e.name, contact_name: e.contact_name || "", phone: e.phone || "",
      email: e.email || "", location: e.location || "", website: e.website || "",
      description: e.description || "",
    });
    setOpen(true);
  };

  const save = async () => {
    if (!user) return;
    if (!form.name.trim()) { toast.error("Nom requis"); return; }
    const payload = {
      user_id: user.id, category,
      name: form.name.trim(),
      contact_name: form.contact_name || null,
      phone: form.phone || null,
      email: form.email || null,
      location: form.location || null,
      website: form.website || null,
      description: form.description || null,
    };
    const { error } = editing
      ? await supabase.from("partner_entries").update(payload).eq("id", editing.id)
      : await supabase.from("partner_entries").insert(payload);
    if (error) { toast.error(error.message); return; }
    toast.success(editing ? "Modifié" : "Ajouté");
    setOpen(false); load();
  };

  const remove = async (id: string) => {
    if (!confirm("Supprimer cette entrée ?")) return;
    const { error } = await supabase.from("partner_entries").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Supprimé"); load();
  };

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">{icon}</div>
          <div>
            <h1 className="text-2xl font-bold">{title}</h1>
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          </div>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={startCreate}><Plus className="h-4 w-4 mr-2" />Ajouter</Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editing ? "Modifier" : "Ajouter"} — {title}</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Nom *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div><Label>Personne contact</Label><Input value={form.contact_name} onChange={(e) => setForm({ ...form, contact_name: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-2">
                <div><Label>Téléphone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
                <div><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
              </div>
              <div><Label>Localisation</Label><Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></div>
              <div><Label>Site web</Label><Input value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} /></div>
              <div><Label>Description</Label><Textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
              <Button onClick={save} className="w-full">Enregistrer</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <p className="text-muted-foreground text-sm">Chargement…</p>
      ) : items.length === 0 ? (
        <Card><CardContent className="py-10 text-center text-muted-foreground">
          Aucune entrée. Cliquez sur « Ajouter ».
        </CardContent></Card>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {items.map((e) => (
            <Card key={e.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base">{e.name}</CardTitle>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" onClick={() => startEdit(e)}><Pencil className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => remove(e.id)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
                {e.contact_name && <p className="text-xs text-muted-foreground">{e.contact_name}</p>}
              </CardHeader>
              <CardContent className="space-y-1 text-sm">
                {e.phone && <p className="flex items-center gap-2"><Phone className="h-3.5 w-3.5 text-muted-foreground" />{e.phone}</p>}
                {e.email && <p className="flex items-center gap-2"><Mail className="h-3.5 w-3.5 text-muted-foreground" />{e.email}</p>}
                {e.location && <p className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5 text-muted-foreground" />{e.location}</p>}
                {e.website && <p className="flex items-center gap-2"><Globe className="h-3.5 w-3.5 text-muted-foreground" /><a className="text-primary hover:underline" href={e.website} target="_blank" rel="noreferrer">{e.website}</a></p>}
                {e.description && <p className="text-muted-foreground pt-1">{e.description}</p>}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
