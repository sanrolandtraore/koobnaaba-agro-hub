import { useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, Camera, Sparkles, AlertCircle, CheckCircle2, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

const CROPS = ["mil","sorgho","mais","niebe","arachide","riz","coton","sesame","manioc","igname","oignon","tomate"];

interface Diagnosis {
  diagnosis_summary: string;
  cause_type: string;
  cause_name: string;
  confidence: number;
  severity: string;
  treatment_bio: string;
  treatment_chemical: string;
  preventive_actions: string[];
}

export function CropDiagnosisTool() {
  const { user } = useAuth();
  const [cropKey, setCropKey] = useState<string>("");
  const [symptoms, setSymptoms] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<Diagnosis | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const onFile = (f: File | null) => {
    if (!f) return;
    if (f.size > 8 * 1024 * 1024) {
      toast({ title: "Image trop lourde", description: "Maximum 8 Mo", variant: "destructive" });
      return;
    }
    setImageFile(f);
    setImagePreview(URL.createObjectURL(f));
  };

  const fileToBase64 = (file: File) => new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const r = reader.result as string;
      resolve(r.split(",")[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const diagnose = async () => {
    if (!imageFile && !symptoms.trim()) {
      toast({ title: "Données insuffisantes", description: "Photo ou description des symptômes requise", variant: "destructive" });
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      let imageBase64: string | undefined;
      let mimeType: string | undefined;
      if (imageFile) {
        imageBase64 = await fileToBase64(imageFile);
        mimeType = imageFile.type;
      }
      const { data, error } = await supabase.functions.invoke("diagnose-crop", {
        body: { imageBase64, mimeType, cropKey, symptoms },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setResult(data.diagnosis);
    } catch (e: any) {
      toast({ title: "Diagnostic impossible", description: e.message ?? "Erreur", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const save = async () => {
    if (!result || !user) return;
    setSaving(true);
    try {
      let imagePath: string | null = null;
      if (imageFile) {
        const path = `${user.id}/${Date.now()}-${imageFile.name.replace(/[^a-z0-9.]/gi, "_")}`;
        const { error: upErr } = await supabase.storage.from("crop-diagnoses").upload(path, imageFile);
        if (upErr) throw upErr;
        imagePath = path;
      }
      const { error } = await supabase.from("crop_diagnoses").insert({
        expert_id: user.id,
        image_path: imagePath,
        crop_key: cropKey || null,
        symptoms_input: symptoms || null,
        ai_response: result as any,
        diagnosis_summary: result.diagnosis_summary,
        confidence: result.confidence,
        treatment_bio: result.treatment_bio,
        treatment_chemical: result.treatment_chemical,
      });
      if (error) throw error;
      toast({ title: "Diagnostic enregistré" });
      setResult(null); setImageFile(null); setImagePreview(""); setSymptoms("");
    } catch (e: any) {
      toast({ title: "Erreur", description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card className="p-4 space-y-4">
        <div>
          <Label>Culture concernée</Label>
          <Select value={cropKey} onValueChange={setCropKey}>
            <SelectTrigger><SelectValue placeholder="Choisir une culture" /></SelectTrigger>
            <SelectContent>
              {CROPS.map(c => <SelectItem key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Photo de la plante / feuille</Label>
          <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden"
            onChange={(e) => onFile(e.target.files?.[0] ?? null)} />
          <Button type="button" variant="outline" className="w-full mt-1" onClick={() => fileRef.current?.click()}>
            <Camera className="h-4 w-4 mr-2" /> {imageFile ? "Changer la photo" : "Prendre / choisir une photo"}
          </Button>
          {imagePreview && <img src={imagePreview} alt="aperçu" className="mt-2 rounded-lg max-h-60 mx-auto" />}
        </div>

        <div>
          <Label>Symptômes observés (optionnel)</Label>
          <Textarea value={symptoms} onChange={(e) => setSymptoms(e.target.value)} rows={3}
            placeholder="Ex : taches jaunes sur feuilles, jaunissement des nervures…" />
        </div>

        <Button onClick={diagnose} disabled={loading} className="w-full">
          {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
          Diagnostiquer avec l'IA
        </Button>
      </Card>

      {result && (
        <Card className="p-4 space-y-3 border-primary/40">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold">{result.cause_name}</h3>
              <p className="text-sm text-muted-foreground">{result.diagnosis_summary}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">{result.cause_type}</Badge>
            <Badge variant={result.severity === "forte" ? "destructive" : "secondary"}>Gravité {result.severity}</Badge>
            <Badge variant="outline">Confiance {Math.round(result.confidence * 100)}%</Badge>
          </div>
          <div>
            <h4 className="font-medium text-sm flex items-center gap-1"><Sparkles className="h-3 w-3" /> Traitement biologique</h4>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{result.treatment_bio}</p>
          </div>
          <div>
            <h4 className="font-medium text-sm flex items-center gap-1"><AlertCircle className="h-3 w-3" /> Traitement chimique</h4>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{result.treatment_chemical}</p>
          </div>
          {result.preventive_actions?.length > 0 && (
            <div>
              <h4 className="font-medium text-sm">Prévention</h4>
              <ul className="list-disc list-inside text-sm text-muted-foreground">
                {result.preventive_actions.map((a, i) => <li key={i}>{a}</li>)}
              </ul>
            </div>
          )}
          <Button onClick={save} disabled={saving} className="w-full">
            {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Enregistrer ce diagnostic
          </Button>
        </Card>
      )}
    </div>
  );
}
