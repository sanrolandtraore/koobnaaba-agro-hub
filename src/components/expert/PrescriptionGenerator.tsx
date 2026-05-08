import { useState } from "react";
import jsPDF from "jspdf";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FileDown, Plus, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface Line { product: string; dose: string; surface: string; mode: string; dar: string }

export function PrescriptionGenerator() {
  const { profile, user } = useAuth();
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [parcel, setParcel] = useState("");
  const [crop, setCrop] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [lines, setLines] = useState<Line[]>([{ product: "", dose: "", surface: "", mode: "", dar: "" }]);
  const [recommendations, setRecommendations] = useState("");
  const [saving, setSaving] = useState(false);

  const upd = (i: number, k: keyof Line, v: string) => {
    setLines(prev => prev.map((l, idx) => idx === i ? { ...l, [k]: v } : l));
  };
  const addLine = () => setLines(prev => [...prev, { product: "", dose: "", surface: "", mode: "", dar: "" }]);
  const rmLine = (i: number) => setLines(prev => prev.filter((_, idx) => idx !== i));

  const generatePdf = () => {
    const doc = new jsPDF();
    const today = new Date().toLocaleDateString("fr-FR");
    doc.setFontSize(16);
    doc.text("ORDONNANCE AGRONOMIQUE", 105, 20, { align: "center" });
    doc.setFontSize(10);
    doc.text(`Date : ${today}`, 14, 32);
    doc.text(`Expert : ${profile?.full_name ?? ""}`, 14, 38);
    doc.text(`Tél. : ${profile?.phone ?? ""}`, 14, 44);

    doc.setLineWidth(0.3);
    doc.line(14, 50, 196, 50);

    doc.setFontSize(11);
    doc.text("Client", 14, 58);
    doc.setFontSize(10);
    doc.text(`Nom : ${clientName}`, 14, 64);
    if (clientPhone) doc.text(`Téléphone : ${clientPhone}`, 14, 70);
    doc.text(`Parcelle : ${parcel}`, 14, 76);
    doc.text(`Culture : ${crop}`, 14, 82);

    doc.setFontSize(11);
    doc.text("Diagnostic", 14, 92);
    doc.setFontSize(9);
    const diagSplit = doc.splitTextToSize(diagnosis || "—", 180);
    doc.text(diagSplit, 14, 98);

    let y = 98 + diagSplit.length * 4 + 8;
    doc.setFontSize(11);
    doc.text("Prescriptions", 14, y); y += 4;
    doc.setFontSize(9);
    doc.line(14, y, 196, y); y += 5;
    doc.text("Produit", 14, y);
    doc.text("Dose", 70, y);
    doc.text("Surface", 100, y);
    doc.text("Mode", 130, y);
    doc.text("DAR", 175, y);
    y += 2; doc.line(14, y, 196, y); y += 5;
    lines.forEach(l => {
      doc.text(l.product || "—", 14, y);
      doc.text(l.dose || "—", 70, y);
      doc.text(l.surface || "—", 100, y);
      doc.text(l.mode || "—", 130, y);
      doc.text(l.dar || "—", 175, y);
      y += 6;
    });

    if (recommendations) {
      y += 6;
      doc.setFontSize(11); doc.text("Recommandations complémentaires", 14, y); y += 5;
      doc.setFontSize(9);
      const recSplit = doc.splitTextToSize(recommendations, 180);
      doc.text(recSplit, 14, y);
      y += recSplit.length * 4;
    }

    y += 14;
    doc.text("Signature de l'expert :", 130, y);
    doc.line(130, y + 14, 196, y + 14);

    doc.save(`ordonnance-${clientName || "client"}-${today.replace(/\//g, "-")}.pdf`);

    // Save to DB
    if (user) {
      setSaving(true);
      supabase.from("expert_prescriptions").insert({
        expert_id: user.id,
        client_user_id: user.id, // standalone client (no auth link)
        title: `Ordonnance ${clientName} - ${today}`,
        content: { clientName, clientPhone, parcel, crop, diagnosis, lines, recommendations } as any,
      }).then(({ error }) => {
        setSaving(false);
        if (!error) toast({ title: "Ordonnance archivée" });
      });
    }
  };

  return (
    <Card className="p-4 space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <div><Label>Nom client</Label><Input value={clientName} onChange={e => setClientName(e.target.value)} /></div>
        <div><Label>Téléphone</Label><Input value={clientPhone} onChange={e => setClientPhone(e.target.value)} /></div>
        <div><Label>Parcelle</Label><Input value={parcel} onChange={e => setParcel(e.target.value)} /></div>
        <div><Label>Culture</Label><Input value={crop} onChange={e => setCrop(e.target.value)} /></div>
      </div>
      <div><Label>Diagnostic</Label><Textarea rows={2} value={diagnosis} onChange={e => setDiagnosis(e.target.value)} /></div>

      <div className="space-y-2">
        <Label>Prescriptions</Label>
        {lines.map((l, i) => (
          <div key={i} className="grid grid-cols-12 gap-1 items-center">
            <Input className="col-span-3" placeholder="Produit" value={l.product} onChange={e => upd(i, "product", e.target.value)} />
            <Input className="col-span-2" placeholder="Dose" value={l.dose} onChange={e => upd(i, "dose", e.target.value)} />
            <Input className="col-span-2" placeholder="Surface" value={l.surface} onChange={e => upd(i, "surface", e.target.value)} />
            <Input className="col-span-2" placeholder="Mode" value={l.mode} onChange={e => upd(i, "mode", e.target.value)} />
            <Input className="col-span-2" placeholder="DAR" value={l.dar} onChange={e => upd(i, "dar", e.target.value)} />
            <Button size="icon" variant="ghost" className="col-span-1" onClick={() => rmLine(i)}><X className="h-4 w-4" /></Button>
          </div>
        ))}
        <Button size="sm" variant="outline" onClick={addLine}><Plus className="h-3 w-3 mr-1" /> Ajouter</Button>
      </div>

      <div><Label>Recommandations</Label><Textarea rows={2} value={recommendations} onChange={e => setRecommendations(e.target.value)} /></div>

      <Button className="w-full" onClick={generatePdf} disabled={saving || !clientName}>
        <FileDown className="h-4 w-4 mr-2" /> Générer l'ordonnance PDF
      </Button>
    </Card>
  );
}
