import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Handshake, Save, Globe, Phone, Mail } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const CATEGORIES = [
  { value: "credit_agricole", label: "Crédit agricole" },
  { value: "assurance_agricole", label: "Assurance agricole" },
  { value: "fournisseur_intrants", label: "Fournisseur d'intrants" },
  { value: "ministere_agriculture", label: "Ministère / Institution" },
  { value: "autre", label: "Autre" },
] as const;

const PartnerProfilePage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [existingId, setExistingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    category: "autre" as string,
    description: "",
    contact_email: "",
    contact_phone: "",
    address: "",
    website: "",
  });

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data } = await supabase
        .from("partner_directory")
        .select("*")
        .eq("created_by", user.id)
        .maybeSingle();
      if (data) {
        setExistingId(data.id);
        setForm({
          name: data.name || "",
          category: data.category || "autre",
          description: data.description || "",
          contact_email: data.contact_email || "",
          contact_phone: data.contact_phone || "",
          address: data.address || "",
          website: data.website || "",
        });
      }
      setLoading(false);
    };
    load();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    if (!form.name.trim()) { toast.error("Le nom est requis"); return; }
    setSaving(true);

    const payload = {
      name: form.name,
      category: form.category as any,
      description: form.description || null,
      contact_email: form.contact_email || null,
      contact_phone: form.contact_phone || null,
      address: form.address || null,
      website: form.website || null,
      created_by: user.id,
    };

    let error;
    if (existingId) {
      ({ error } = await supabase.from("partner_directory").update(payload).eq("id", existingId));
    } else {
      const res = await supabase.from("partner_directory").insert(payload).select("id").single();
      error = res.error;
      if (res.data) setExistingId(res.data.id);
    }

    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Profil partenaire enregistré !");
  };

  if (loading) return <div className="space-y-4"><Skeleton className="h-8 w-64" /><Skeleton className="h-96" /></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold flex items-center gap-2">
            <Handshake className="h-6 w-6 text-primary" /> Mon Profil Partenaire
          </h1>
          <p className="text-muted-foreground mt-1">Présentez vos services aux agriculteurs africains</p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />{saving ? "Enregistrement..." : "Enregistrer"}
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Identité</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Nom de l'organisation *</Label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Ex: Banque Agricole du Sahel" />
            </div>
            <div>
              <Label>Catégorie</Label>
              <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Description des services</Label>
              <Textarea
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                rows={4}
                placeholder="Décrivez les services que vous proposez aux agriculteurs…"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Contact</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="flex items-center gap-1"><Mail className="h-3 w-3" /> Email</Label>
              <Input type="email" value={form.contact_email} onChange={e => setForm(f => ({ ...f, contact_email: e.target.value }))} placeholder="contact@organisation.com" />
            </div>
            <div>
              <Label className="flex items-center gap-1"><Phone className="h-3 w-3" /> Téléphone</Label>
              <Input value={form.contact_phone} onChange={e => setForm(f => ({ ...f, contact_phone: e.target.value }))} placeholder="+226 70 00 00 00" />
            </div>
            <div>
              <Label>Adresse</Label>
              <Input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder="Ville, Pays" />
            </div>
            <div>
              <Label className="flex items-center gap-1"><Globe className="h-3 w-3" /> Site web</Label>
              <Input value={form.website} onChange={e => setForm(f => ({ ...f, website: e.target.value }))} placeholder="https://…" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PartnerProfilePage;
