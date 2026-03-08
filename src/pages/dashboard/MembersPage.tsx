import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCooperativeRole } from "@/hooks/useCooperativeRole";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Plus, Trash2, Users, UserPlus, Search, Copy, Link2 } from "lucide-react";

const memberTypes = [
  { value: "producteur", label: "Producteur" },
  { value: "eleveur", label: "Éleveur" },
  { value: "mixte", label: "Mixte (Agriculture + Élevage)" },
  { value: "transformateur", label: "Transformateur" },
  { value: "commercant", label: "Commerçant" },
];

const cooperativeRoles = [
  { value: "president", label: "Président" },
  { value: "vice_president", label: "Vice-président" },
  { value: "tresorier", label: "Trésorier" },
  { value: "secretaire", label: "Secrétaire" },
  { value: "commissaire", label: "Commissaire aux comptes" },
  { value: "membre", label: "Membre" },
];

const cropTypes = [
  "Maïs", "Riz", "Sorgho", "Mil", "Arachide", "Coton", "Soja", "Niébé",
  "Sésame", "Igname", "Manioc", "Patate douce", "Oignon", "Tomate", "Mangue", "Karité",
];

const livestockTypes = [
  "Bovins", "Caprins", "Ovins", "Volaille", "Porcins", "Pisciculture",
];

const locations = [
  "Centre", "Centre-Nord", "Centre-Sud", "Centre-Est", "Centre-Ouest",
  "Nord", "Sud-Ouest", "Est", "Ouest", "Sahel", "Plateau-Central",
  "Boucle du Mouhoun", "Cascades", "Hauts-Bassins",
];

const statuses = [
  { value: "actif", label: "Actif", variant: "default" as const },
  { value: "inactif", label: "Inactif", variant: "secondary" as const },
  { value: "suspendu", label: "Suspendu", variant: "destructive" as const },
];

type Member = {
  id: string;
  full_name: string;
  phone: string | null;
  location: string | null;
  member_type: string;
  cooperative_role: string;
  crop_type: string | null;
  livestock_type: string | null;
  area_ha: number | null;
  status: string;
  joined_date: string;
  notes: string | null;
};

const MembersPage = () => {
  const { user } = useAuth();
  const { isCoopOwner, isCoopAdmin, isReadOnly, cooperativeUserId } = useCooperativeRole();
  const canEdit = isCoopOwner || isCoopAdmin;
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [form, setForm] = useState({
    full_name: "", phone: "", location: "", member_type: "producteur",
    cooperative_role: "membre",
    crop_type: "", livestock_type: "", area_ha: "", status: "actif",
    joined_date: new Date().toISOString().split("T")[0], notes: "",
  });

  const fetchMembers = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("cooperative_members")
      .select("*")
      .order("full_name");
    setMembers((data as Member[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchMembers(); }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const { error } = await supabase.from("cooperative_members").insert({
      cooperative_user_id: user.id,
      full_name: form.full_name,
      phone: form.phone || null,
      location: form.location || null,
      member_type: form.member_type,
      cooperative_role: form.cooperative_role,
      crop_type: form.crop_type || null,
      livestock_type: form.livestock_type || null,
      area_ha: form.area_ha ? parseFloat(form.area_ha) : 0,
      status: form.status,
      joined_date: form.joined_date,
      notes: form.notes || null,
    });
    if (error) { toast.error("Erreur: " + error.message); return; }
    toast.success("Membre ajouté !");
    setOpen(false);
    setForm({ full_name: "", phone: "", location: "", member_type: "producteur", cooperative_role: "membre", crop_type: "", livestock_type: "", area_ha: "", status: "actif", joined_date: new Date().toISOString().split("T")[0], notes: "" });
    fetchMembers();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("cooperative_members").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Membre supprimé");
    fetchMembers();
  };

  const filtered = members.filter(m => {
    const matchSearch = m.full_name.toLowerCase().includes(search.toLowerCase()) ||
      (m.phone || "").includes(search) || (m.location || "").toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === "all" || m.member_type === filterType;
    return matchSearch && matchType;
  });

  const stats = {
    total: members.length,
    actifs: members.filter(m => m.status === "actif").length,
    totalHa: members.reduce((s, m) => s + (m.area_ha || 0), 0),
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold">Gestion des membres</h1>
          <p className="text-muted-foreground mt-1">Gérez les membres de votre coopérative</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><UserPlus className="h-4 w-4 mr-2" />Nouveau membre</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Ajouter un membre</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><Label>Nom complet *</Label><Input required value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} /></div>
              <div><Label>Téléphone</Label><Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></div>
              <div><Label>Région</Label>
                <Select value={form.location} onValueChange={v => setForm(f => ({ ...f, location: v }))}>
                  <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                  <SelectContent>{locations.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Type de membre *</Label>
                <Select value={form.member_type} onValueChange={v => setForm(f => ({ ...f, member_type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{memberTypes.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              {(form.member_type === "producteur" || form.member_type === "mixte") && (
                <div><Label>Culture principale</Label>
                  <Select value={form.crop_type} onValueChange={v => setForm(f => ({ ...f, crop_type: v }))}>
                    <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                    <SelectContent>{cropTypes.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              )}
              {(form.member_type === "eleveur" || form.member_type === "mixte") && (
                <div><Label>Type d'élevage</Label>
                  <Select value={form.livestock_type} onValueChange={v => setForm(f => ({ ...f, livestock_type: v }))}>
                    <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                    <SelectContent>{livestockTypes.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
               )}
              <div><Label>Rôle dans la coopérative</Label>
                <Select value={form.cooperative_role} onValueChange={v => setForm(f => ({ ...f, cooperative_role: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{cooperativeRoles.map(r => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Superficie (ha)</Label><Input type="number" step="0.1" value={form.area_ha} onChange={e => setForm(f => ({ ...f, area_ha: e.target.value }))} /></div>
              <div><Label>Date d'adhésion</Label><Input type="date" value={form.joined_date} onChange={e => setForm(f => ({ ...f, joined_date: e.target.value }))} /></div>
              <div><Label>Notes</Label><Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} /></div>
              <Button type="submit" className="w-full">Enregistrer</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total membres</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{stats.total}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Membres actifs</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold text-primary">{stats.actifs}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Superficie totale</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{stats.totalHa.toFixed(1)} ha</p></CardContent></Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Rechercher un membre..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les types</SelectItem>
            {memberTypes.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">Chargement...</CardContent></Card>
      ) : filtered.length === 0 ? (
        <Card className="border-dashed"><CardContent className="flex flex-col items-center py-12"><Users className="h-12 w-12 text-muted-foreground mb-4" /><p className="text-muted-foreground">Aucun membre trouvé</p></CardContent></Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Rôle coop.</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Région</TableHead>
                <TableHead>Téléphone</TableHead>
                <TableHead>Superficie</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(m => (
                <TableRow key={m.id}>
                   <TableCell className="font-medium">{m.full_name}</TableCell>
                   <TableCell><Badge variant={m.cooperative_role !== "membre" ? "default" : "outline"}>{cooperativeRoles.find(r => r.value === m.cooperative_role)?.label || m.cooperative_role}</Badge></TableCell>
                   <TableCell>{memberTypes.find(t => t.value === m.member_type)?.label || m.member_type}</TableCell>
                  <TableCell>{m.location || "—"}</TableCell>
                  <TableCell>{m.phone || "—"}</TableCell>
                  <TableCell>{m.area_ha ? `${m.area_ha} ha` : "—"}</TableCell>
                  <TableCell>
                    <Badge variant={statuses.find(s => s.value === m.status)?.variant || "default"}>
                      {statuses.find(s => s.value === m.status)?.label || m.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(m.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
};

export default MembersPage;
