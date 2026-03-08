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
import { Building2, Save, Upload } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const regions = [
  "Centre", "Centre-Nord", "Centre-Sud", "Centre-Est", "Centre-Ouest",
  "Nord", "Sud-Ouest", "Est", "Ouest", "Sahel", "Plateau-Central",
  "Boucle du Mouhoun", "Cascades", "Hauts-Bassins",
];

const legalStatuses = [
  { value: "informelle", label: "Informelle" },
  { value: "enregistree", label: "Enregistrée" },
  { value: "agree", label: "Agréée" },
  { value: "scoop", label: "SCOOP" },
];

const CooperativeProfilePage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "", description: "", region: "", address: "", phone: "", email: "",
    creation_date: new Date().toISOString().split("T")[0],
    legal_status: "informelle", registration_number: "",
  });

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data } = await supabase
        .from("cooperative_profiles")
        .select("*")
        .eq("cooperative_user_id", user.id)
        .maybeSingle();
      if (data) {
        setForm({
          name: data.name || "",
          description: data.description || "",
          region: data.region || "",
          address: data.address || "",
          phone: data.phone || "",
          email: data.email || "",
          creation_date: data.creation_date || new Date().toISOString().split("T")[0],
          legal_status: data.legal_status || "informelle",
          registration_number: data.registration_number || "",
        });
      }
      setLoading(false);
    };
    load();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const payload = { ...form, cooperative_user_id: user.id };

    const { data: existing } = await supabase
      .from("cooperative_profiles")
      .select("id")
      .eq("cooperative_user_id", user.id)
      .maybeSingle();

    let error;
    if (existing) {
      ({ error } = await supabase.from("cooperative_profiles").update(payload).eq("id", existing.id));
    } else {
      ({ error } = await supabase.from("cooperative_profiles").insert(payload));
    }

    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Profil enregistré !");
  };

  if (loading) return <div className="space-y-4"><Skeleton className="h-8 w-64" /><Skeleton className="h-96" /></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold flex items-center gap-2">
            <Building2 className="h-6 w-6 text-primary" /> Profil Coopérative
          </h1>
          <p className="text-muted-foreground mt-1">Identité et statuts de votre coopérative</p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />{saving ? "Enregistrement..." : "Enregistrer"}
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Informations générales</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><Label>Nom de la coopérative *</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
            <div><Label>Description</Label><Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} /></div>
            <div><Label>Région</Label>
              <Select value={form.region} onValueChange={v => setForm(f => ({ ...f, region: v }))}>
                <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                <SelectContent>{regions.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Adresse</Label><Input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} /></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Contact & Statut juridique</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><Label>Téléphone</Label><Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></div>
            <div><Label>Email</Label><Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
            <div><Label>Date de création</Label><Input type="date" value={form.creation_date} onChange={e => setForm(f => ({ ...f, creation_date: e.target.value }))} /></div>
            <div><Label>Statut juridique</Label>
              <Select value={form.legal_status} onValueChange={v => setForm(f => ({ ...f, legal_status: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{legalStatuses.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>N° d'enregistrement</Label><Input value={form.registration_number} onChange={e => setForm(f => ({ ...f, registration_number: e.target.value }))} /></div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CooperativeProfilePage;
