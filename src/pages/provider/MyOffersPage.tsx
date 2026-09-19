import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Package, Plus, Trash2, Pencil } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { OFFER_CATEGORIES } from "./partnerCategories";

interface Offer {
  id: string; partner_name: string; category: string; title: string; description: string | null;
  price_indication: string | null; unit: string | null; location_name: string | null;
  contact_phone: string | null; contact_email: string | null; website: string | null;
  image_url: string | null; is_active: boolean;
}

const empty = {
  partner_name: "", category: "intrants", title: "", description: "", price_indication: "",
  unit: "", location_name: "", contact_phone: "", contact_email: "", website: "", image_url: "",
};

export default function MyOffersPage() {
  const { user, profile } = useAuth();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Offer | null>(null);
  const [form, setForm] = useState({ ...empty });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase.from("marketplace_offers").select("*")
      .eq("owner_id", user.id).order("created_at", { ascending: false });
    setOffers((data ?? []) as Offer[]);
    setLoading(false);
  };

  useEffect(() => { load();   }, [user]);

  const set = (k: keyof typeof empty, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const openNew = () => {
    setEditing(null);
    setForm({ ...empty, partner_name: profile?.full_name ?? "" });
    setOpen(true);
  };

  const openEdit = (o: Offer) => {
    setEditing(o);
    setForm({
      partner_name: o.partner_name, category: o.category, title: o.title,
      description: o.description ?? "", price_indication: o.price_indication ?? "", unit: o.unit ?? "",
      location_name: o.location_name ?? "", contact_phone: o.contact_phone ?? "",
      contact_email: o.contact_email ?? "", website: o.website ?? "", image_url: o.image_url ?? "",
    });
    setOpen(true);
  };

  const save = async () => {
    if (!user) return;
    if (!form.title.trim() || !form.partner_name.trim()) {
      return toast({ title: "Nom du partenaire et titre obligatoires", variant: "destructive" });
    }
    setSaving(true);
    const payload = {
      owner_id: user.id,
      partner_name: form.partner_name.trim(),
      category: form.category,
      title: form.title.trim(),
      description: form.description || null,
      price_indication: form.price_indication || null,
      unit: form.unit || null,
      location_name: form.location_name || null,
      contact_phone: form.contact_phone || null,
      contact_email: form.contact_email || null,
      website: form.website || null,
      image_url: form.image_url || null,
    };
    const { error } = editing
      ? await supabase.from("marketplace_offers").update(payload).eq("id", editing.id)
      : await supabase.from("marketplace_offers").insert(payload);
    setSaving(false);
    if (error) return toast({ title: "Enregistrement impossible", description: error.message, variant: "destructive" });
    toast({ title: editing ? "Offre mise à jour" : "Offre publiée" });
    setOpen(false); load();
  };

  const toggle = async (o: Offer) => {
    const { error } = await supabase.from("marketplace_offers").update({ is_active: !o.is_active }).eq("id", o.id);
    if (error) return toast({ title: "Mise à jour impossible", variant: "destructive" });
    load();
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("marketplace_offers").delete().eq("id", id);
    if (error) return toast({ title: "Suppression impossible", variant: "destructive" });
    load();
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Package className="h-5 w-5" /> Mes offres</h1>
          <p className="text-sm text-muted-foreground">Publiez vos produits et services sur la marketplace</p>
        </div>
        <Button onClick={openNew}><Plus className="h-4 w-4 mr-1" /> Publier</Button>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Chargement…</p>
      ) : offers.length === 0 ? (
        <Card><CardContent className="py-6 text-sm text-muted-foreground">Aucune offre publiée.</CardContent></Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {offers.map((o) => (
            <Card key={o.id}>
              <CardHeader className="pb-2 flex flex-row items-start justify-between gap-2">
                <div className="min-w-0">
                  <CardTitle className="text-base truncate">{o.title}</CardTitle>
                  <p className="text-xs text-muted-foreground truncate">{o.partner_name}</p>
                </div>
                <Badge variant={o.is_active ? "secondary" : "outline"}>{o.is_active ? "En ligne" : "Masquée"}</Badge>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {o.price_indication && <p className="font-medium">{o.price_indication}{o.unit ? ` / ${o.unit}` : ""}</p>}
                {o.description && <p className="text-muted-foreground line-clamp-2">{o.description}</p>}
                <div className="flex items-center gap-2 pt-1">
                  <Switch checked={o.is_active} onCheckedChange={() => toggle(o)} aria-label="Afficher l'offre" />
                  <Button size="sm" variant="ghost" onClick={() => openEdit(o)}><Pencil className="h-4 w-4 mr-1" /> Modifier</Button>
                  <Button size="sm" variant="ghost" onClick={() => remove(o.id)} aria-label="Supprimer l'offre"><Trash2 className="h-4 w-4" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Modifier l'offre" : "Nouvelle offre"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="o-partner">Nom du partenaire</Label>
              <Input id="o-partner" value={form.partner_name} onChange={(e) => set("partner_name", e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="o-title">Titre de l'offre</Label>
              <Input id="o-title" value={form.title} onChange={(e) => set("title", e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Catégorie</Label>
              <Select value={form.category} onValueChange={(v) => set("category", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{OFFER_CATEGORIES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="o-desc">Description</Label>
              <Textarea id="o-desc" value={form.description} onChange={(e) => set("description", e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="o-price">Prix indicatif</Label>
                <Input id="o-price" value={form.price_indication} onChange={(e) => set("price_indication", e.target.value)} placeholder="ex. 18 000 FCFA" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="o-unit">Unité</Label>
                <Input id="o-unit" value={form.unit} onChange={(e) => set("unit", e.target.value)} placeholder="sac, litre…" />
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="o-loc">Localisation</Label>
              <Input id="o-loc" value={form.location_name} onChange={(e) => set("location_name", e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="o-phone">Téléphone</Label>
                <Input id="o-phone" value={form.contact_phone} onChange={(e) => set("contact_phone", e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="o-email">Email</Label>
                <Input id="o-email" type="email" value={form.contact_email} onChange={(e) => set("contact_email", e.target.value)} />
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="o-web">Site web</Label>
              <Input id="o-web" value={form.website} onChange={(e) => set("website", e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="o-img">Lien image</Label>
              <Input id="o-img" value={form.image_url} onChange={(e) => set("image_url", e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
            <Button onClick={save} disabled={saving}>{saving ? "Enregistrement…" : "Enregistrer"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
