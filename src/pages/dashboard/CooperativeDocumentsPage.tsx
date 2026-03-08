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
import { Plus, Trash2, FileText, Upload, Download, FolderOpen } from "lucide-react";

const docTypes = [
  { value: "statuts", label: "Statuts" },
  { value: "reglement_interieur", label: "Règlement intérieur" },
  { value: "pv_assemblee", label: "PV d'assemblée" },
  { value: "contrat", label: "Contrat" },
  { value: "rapport", label: "Rapport" },
  { value: "facture", label: "Facture" },
  { value: "autre", label: "Autre" },
];

type Doc = {
  id: string; title: string; document_type: string;
  file_url: string | null; description: string | null; created_at: string;
};

const CooperativeDocumentsPage = () => {
  const { user } = useAuth();
  const [docs, setDocs] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({ title: "", document_type: "autre", description: "" });
  const [file, setFile] = useState<File | null>(null);

  const fetchDocs = async () => {
    if (!user) return;
    const { data } = await supabase.from("cooperative_documents").select("*").order("created_at", { ascending: false });
    setDocs((data as any[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchDocs(); }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title) { toast.error("Titre requis"); return; }
    setUploading(true);

    let file_url: string | null = null;
    if (file) {
      const ext = file.name.split(".").pop();
      const path = `${user!.id}/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from("cooperative-docs").upload(path, file);
      if (uploadError) { toast.error("Erreur upload: " + uploadError.message); setUploading(false); return; }
      const { data: urlData } = supabase.storage.from("cooperative-docs").getPublicUrl(path);
      file_url = urlData?.publicUrl || null;
    }

    const { error } = await supabase.from("cooperative_documents").insert({
      cooperative_user_id: user!.id,
      title: form.title,
      document_type: form.document_type,
      description: form.description || null,
      file_url,
    });
    setUploading(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Document archivé");
    setOpen(false);
    setForm({ title: "", document_type: "autre", description: "" });
    setFile(null);
    fetchDocs();
  };

  const deleteDoc = async (id: string) => {
    await supabase.from("cooperative_documents").delete().eq("id", id);
    toast.success("Document supprimé"); fetchDocs();
  };

  if (loading) return <div className="space-y-4"><div className="h-8 w-64 bg-muted animate-pulse rounded" /></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold flex items-center gap-2">
            <FolderOpen className="h-6 w-6 text-primary" /> Documents & Archives
          </h1>
          <p className="text-muted-foreground mt-1">Statuts, PV, contrats et documents officiels</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />Nouveau document</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Archiver un document</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div><Label>Titre *</Label><Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required /></div>
              <div><Label>Type</Label>
                <Select value={form.document_type} onValueChange={v => setForm(f => ({ ...f, document_type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{docTypes.map(d => <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Description</Label><Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
              <div>
                <Label>Fichier</Label>
                <Input type="file" onChange={e => setFile(e.target.files?.[0] || null)} accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.png" />
              </div>
              <Button type="submit" className="w-full" disabled={uploading}>
                {uploading ? "Upload en cours..." : "Enregistrer"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Documents</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{docs.length}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Statuts & PV</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{docs.filter(d => d.document_type === "statuts" || d.document_type === "pv_assemblee").length}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Contrats</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{docs.filter(d => d.document_type === "contrat").length}</p></CardContent></Card>
      </div>

      {docs.length === 0 ? (
        <Card className="border-dashed"><CardContent className="flex flex-col items-center py-12"><FileText className="h-12 w-12 text-muted-foreground mb-4" /><p className="text-muted-foreground">Aucun document archivé</p></CardContent></Card>
      ) : (
        <Card>
          <Table>
            <TableHeader><TableRow><TableHead>Titre</TableHead><TableHead>Type</TableHead><TableHead>Date</TableHead><TableHead>Fichier</TableHead><TableHead></TableHead></TableRow></TableHeader>
            <TableBody>
              {docs.map(d => (
                <TableRow key={d.id}>
                  <TableCell className="font-medium">{d.title}</TableCell>
                  <TableCell><Badge variant="outline">{docTypes.find(t => t.value === d.document_type)?.label || d.document_type}</Badge></TableCell>
                  <TableCell>{new Date(d.created_at).toLocaleDateString("fr")}</TableCell>
                  <TableCell>
                    {d.file_url ? (
                      <a href={d.file_url} target="_blank" rel="noreferrer" className="text-primary hover:underline flex items-center gap-1">
                        <Download className="h-4 w-4" /> Télécharger
                      </a>
                    ) : "—"}
                  </TableCell>
                  <TableCell><Button variant="ghost" size="icon" onClick={() => deleteDoc(d.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
};

export default CooperativeDocumentsPage;
