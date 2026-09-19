import { useState, useRef, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
  Loader2, Camera, ImageIcon, Sparkles, AlertCircle, CheckCircle2, Save, WifiOff,
  Clock, History, Trash2, MapPin, Navigation, BookOpen, CloudOff,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { BURKINA_CROPS, CROP_GROUPS, cropLabel } from "@/lib/burkinaCrops";
import {
  addPendingDiagnosis,
  getPendingDiagnoses,
  removePendingDiagnosis,
  getLocalHistory,
  saveLocalHistory,
  addLocalHistory,
  type PendingDiagnosis,
  type LocalDiagnosis,
} from "@/lib/offlineDiagnoses";
import { findLocalAgronomicAdvice } from "@/lib/offlineAgronomicKnowledge";

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

const fileToBase64 = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

export function CropDiagnosisTool() {
  const { user } = useAuth();
  const [cropKey, setCropKey] = useState<string>("");
  const [symptoms, setSymptoms] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [parcelName, setParcelName] = useState("");
  const [gpsLoading, setGpsLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<Diagnosis | null>(null);
  const [online, setOnline] = useState(navigator.onLine);
  const [pending, setPending] = useState<PendingDiagnosis[]>([]);
  const [history, setHistory] = useState<LocalDiagnosis[]>([]);
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);

  // ── Connexion ──
  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  const captureGPS = () => {
    if (!navigator.geolocation) {
      toast({ title: "GPS non supporté", description: "Ce navigateur ou appareil ne supporte pas la géolocalisation.", variant: "destructive" });
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGpsLoading(false);
        toast({ title: "Position GPS acquise", description: `${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}` });
      },
      (err) => {
        setGpsLoading(false);
        toast({ title: "Signal GPS introuvable", description: err.message, variant: "destructive" });
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
    );
  };

  // ── Historique (cache local d'abord, puis serveur si en ligne) ──
  const loadHistory = useCallback(async () => {
    if (!user) return;
    const local = await getLocalHistory(user.id);
    setHistory(local);
    if (!navigator.onLine) return;
    const { data } = await supabase
      .from("crop_diagnoses")
      .select("*")
      .eq("expert_id", user.id)
      .order("created_at", { ascending: false })
      .limit(100);
    if (data) {
      const rows = data.map((d: any) => ({ ...d, synced: true })) as LocalDiagnosis[];
      const unsynced = local.filter((l) => !l.synced);
      const merged = [...unsynced, ...rows];
      setHistory(merged);
      await saveLocalHistory(user.id, merged);
    }
  }, [user]);

  useEffect(() => {
    loadHistory();
    getPendingDiagnoses().then(setPending);
  }, [loadHistory]);

  const onFile = (f: File | null) => {
    if (!f) return;
    if (f.size > 8 * 1024 * 1024) {
      toast({ title: "Image trop lourde", description: "Maximum 8 Mo", variant: "destructive" });
      return;
    }
    setImageFile(f);
    setImagePreview(URL.createObjectURL(f));
  };

  const resetForm = () => {
    setResult(null);
    setImageFile(null);
    setImagePreview("");
    setSymptoms("");
    setCoords(null);
    setParcelName("");
  };

  const runDiagnosis = async (payload: { imageBase64?: string; mimeType?: string; cropKey: string; symptoms: string }) => {
    const { data, error } = await supabase.functions.invoke("diagnose-crop", { body: payload });
    if (error) throw error;
    if (data?.error) throw new Error(data.error);
    return data.diagnosis as Diagnosis;
  };

  const diagnose = async () => {
    if (!imageFile && !symptoms.trim()) {
      toast({ title: "Données insuffisantes", description: "Photo ou description des symptômes requise", variant: "destructive" });
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const imageBase64 = imageFile ? await fileToBase64(imageFile) : undefined;
      const mimeType = imageFile?.type;

      if (!navigator.onLine) {
        // Sauvegarde dans la file d'attente hors-ligne avec GPS
        await addPendingDiagnosis({
          cropKey,
          symptoms,
          imageBase64,
          mimeType,
          imagePreview,
          latitude: coords?.lat ?? null,
          longitude: coords?.lng ?? null,
          parcelName: parcelName || undefined,
        });
        setPending(await getPendingDiagnoses());

        // Analyse locale immédiate grâce à la base de connaissances agronomiques locale
        const localAdvice = findLocalAgronomicAdvice(cropKey, symptoms);
        if (localAdvice) {
          const offlineDiag: Diagnosis = {
            diagnosis_summary: localAdvice.diagnosis_summary,
            cause_type: localAdvice.cause_type,
            cause_name: `${localAdvice.cause_name} (Estimation hors-ligne)`,
            confidence: localAdvice.confidence,
            severity: localAdvice.severity,
            treatment_bio: localAdvice.treatment_bio,
            treatment_chemical: localAdvice.treatment_chemical,
            preventive_actions: localAdvice.preventive_actions,
          };
          setResult(offlineDiag);
          toast({
            title: "Recommandation locale immédiate disponible !",
            description: "Analyse pré-calibrée affichée. L'analyse Gemini approfondie sera envoyée au retour du réseau.",
          });
        } else {
          toast({
            title: "Analyse & géolocalisation mises en attente",
            description: "Votre rapport avec relevé GPS est sauvegardé dans la base locale et sera traité dès le retour de la connexion.",
          });
          resetForm();
        }
        return;
      }

      setResult(await runDiagnosis({ imageBase64, mimeType, cropKey, symptoms }));
    } catch (e: any) {
      toast({ title: "Diagnostic impossible", description: e.message ?? "Erreur", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const persist = async (
    diag: Diagnosis,
    crop: string,
    symp: string,
    file: File | null,
    gpsCoords?: { lat: number; lng: number } | null,
    parcel?: string | null
  ) => {
    if (!user) return;
    const localRow: LocalDiagnosis = {
      id: `local-${Date.now()}`,
      crop_key: crop || null,
      symptoms_input: symp || null,
      diagnosis_summary: diag.diagnosis_summary,
      confidence: diag.confidence,
      treatment_bio: diag.treatment_bio,
      treatment_chemical: diag.treatment_chemical,
      ai_response: diag,
      latitude: gpsCoords?.lat ?? coords?.lat ?? null,
      longitude: gpsCoords?.lng ?? coords?.lng ?? null,
      parcel_name: parcel ?? parcelName ?? null,
      created_at: new Date().toISOString(),
      synced: false,
    };

    if (!navigator.onLine) {
      await addLocalHistory(user.id, localRow);
      await loadHistory();
      return;
    }

    let imagePath: string | null = null;
    if (file) {
      const path = `${user.id}/${Date.now()}-${file.name.replace(/[^a-z0-9.]/gi, "_")}`;
      const { error: upErr } = await supabase.storage.from("crop-diagnoses").upload(path, file);
      if (!upErr) imagePath = path;
    }
    const { data, error } = await supabase
      .from("crop_diagnoses")
      .insert({
        expert_id: user.id,
        image_path: imagePath,
        crop_key: crop || null,
        symptoms_input: symp || null,
        ai_response: diag as any,
        diagnosis_summary: diag.diagnosis_summary,
        confidence: diag.confidence,
        treatment_bio: diag.treatment_bio,
        treatment_chemical: diag.treatment_chemical,
      })
      .select()
      .single();

    if (error) {
      // In case of error, still preserve in local history
      await addLocalHistory(user.id, localRow);
      await loadHistory();
      throw error;
    }

    await addLocalHistory(user.id, {
      ...(data as any),
      latitude: localRow.latitude,
      longitude: localRow.longitude,
      parcel_name: localRow.parcel_name,
      synced: true,
    });
    await loadHistory();
  };

  const save = async () => {
    if (!result || !user) return;
    setSaving(true);
    try {
      await persist(result, cropKey, symptoms, imageFile, coords, parcelName);
      toast({
        title: "Analyse enregistrée",
        description: navigator.onLine
          ? "Synchronisée sur le serveur et disponible dans l'Historique."
          : "Enregistrée dans la base locale (IndexedDB) pour consultation hors-ligne.",
      });
      resetForm();
    } catch (e: any) {
      toast({ title: "Information", description: e.message || "Enregistré en local.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  // ── Traitement automatique de la file d'attente au retour du réseau ──
  const processPending = useCallback(async () => {
    if (!navigator.onLine || !user) return;
    const list = await getPendingDiagnoses();
    if (!list.length) return;
    for (const item of list) {
      try {
        const diag = await runDiagnosis({
          imageBase64: item.imageBase64,
          mimeType: item.mimeType,
          cropKey: item.cropKey,
          symptoms: item.symptoms,
        });
        const gps = item.latitude != null && item.longitude != null ? { lat: item.latitude, lng: item.longitude } : null;
        await persist(diag, item.cropKey, item.symptoms, null, gps, item.parcelName);
        await removePendingDiagnosis(item.id);
      } catch {
        // on réessaiera plus tard
      }
    }
    setPending(await getPendingDiagnoses());
    toast({ title: "Analyses de terrain en attente traitées et synchronisées !" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    if (online) processPending();
  }, [online, processPending]);

  const discardPending = async (id: string) => {
    await removePendingDiagnosis(id);
    setPending(await getPendingDiagnoses());
  };

  return (
    <Tabs defaultValue="new" className="space-y-4">
      <TabsList className="grid grid-cols-2 w-full">
        <TabsTrigger value="new"><Sparkles className="h-4 w-4 mr-1.5" />Nouvelle analyse</TabsTrigger>
        <TabsTrigger value="history"><History className="h-4 w-4 mr-1.5" />Historique {history.length ? `(${history.length})` : ""}</TabsTrigger>
      </TabsList>

      <TabsContent value="new" className="space-y-4">
        {!online && (
          <div className="flex items-center gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm">
            <WifiOff className="h-4 w-4 shrink-0" />
            <span>Mode hors-ligne : votre analyse est enregistrée et sera traitée dès le retour de la connexion.</span>
          </div>
        )}

        {pending.length > 0 && (
          <Card className="p-3 space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium"><Clock className="h-4 w-4" />{pending.length} analyse(s) en attente</div>
            {pending.map((p) => (
              <div key={p.id} className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="flex-1 truncate">{cropLabel(p.cropKey)} — {p.symptoms || "photo seule"}</span>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => discardPending(p.id)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </Card>
        )}

        <Card className="p-4 space-y-4">
          <div>
            <Label>Culture concernée</Label>
            <Select value={cropKey} onValueChange={setCropKey}>
              <SelectTrigger><SelectValue placeholder="Choisir une culture" /></SelectTrigger>
              <SelectContent className="max-h-72">
                {CROP_GROUPS.map((g) => (
                  <SelectGroup key={g}>
                    <SelectLabel>{g}</SelectLabel>
                    {BURKINA_CROPS.filter((c) => c.group === g).map((c) => (
                      <SelectItem key={c.key} value={c.key}>{c.label}</SelectItem>
                    ))}
                  </SelectGroup>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Photo de la plante / feuille</Label>
            <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden"
              onChange={(e) => onFile(e.target.files?.[0] ?? null)} />
            <input ref={galleryRef} type="file" accept="image/*" className="hidden"
              onChange={(e) => onFile(e.target.files?.[0] ?? null)} />
            <div className="grid grid-cols-2 gap-2 mt-1">
              <Button type="button" variant="outline" onClick={() => cameraRef.current?.click()}>
                <Camera className="h-4 w-4 mr-2" /> Prendre une photo
              </Button>
              <Button type="button" variant="outline" onClick={() => galleryRef.current?.click()}>
                <ImageIcon className="h-4 w-4 mr-2" /> Galerie
              </Button>
            </div>
            {imagePreview && <img src={imagePreview} alt="Aperçu de la plante à analyser" className="mt-2 rounded-lg max-h-60 mx-auto" />}
          </div>

          <div>
            <Label>Symptômes observés (optionnel)</Label>
            <Textarea value={symptoms} onChange={(e) => setSymptoms(e.target.value)} rows={3}
              placeholder="Ex : taches jaunes sur feuilles, jaunissement des nervures, trous de chenilles…" />
          </div>

          {/* Géolocalisation & Identifiant Parcelle Terrain */}
          <div className="rounded-lg border p-3 bg-muted/20 space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-primary" /> Géolocalisation & Parcelle
              </Label>
              {coords && (
                <Badge variant="outline" className="text-xs bg-emerald-500/10 text-emerald-600 border-emerald-500/30 gap-1">
                  <CheckCircle2 className="h-3 w-3" /> Fix GPS Actif
                </Badge>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <Label className="text-xs text-muted-foreground">Nom ou réf. de la parcelle</Label>
                <Input
                  value={parcelName}
                  onChange={(e) => setParcelName(e.target.value)}
                  placeholder="Ex : Parcelle Nord A2, Ferme Zongo…"
                  className="h-8 text-xs"
                />
              </div>
              <div className="flex flex-col justify-end">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={captureGPS}
                  disabled={gpsLoading}
                  className="h-8 gap-1.5 text-xs w-full"
                >
                  {gpsLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Navigation className="h-3.5 w-3.5 text-primary" />}
                  {coords ? `${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}` : "Relever coordonnées GPS"}
                </Button>
              </div>
            </div>
            {coords && (
              <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-0.5">
                <span>Lat: {coords.lat.toFixed(5)} | Lng: {coords.lng.toFixed(5)}</span>
                <Button type="button" variant="ghost" size="sm" onClick={() => setCoords(null)} className="h-5 px-1 text-[11px] text-destructive hover:bg-destructive/10">
                  Effacer GPS
                </Button>
              </div>
            )}
          </div>

          <Button onClick={diagnose} disabled={loading} className="w-full">
            {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
            {online ? "Diagnostiquer avec l'IA" : "Analyser & Enregistrer (Mode Hors-ligne)"}
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
              Enregistrer cette analyse
            </Button>
          </Card>
        )}
      </TabsContent>

      <TabsContent value="history">
        {history.length === 0 ? (
          <Card className="p-6 text-center text-sm text-muted-foreground">
            Aucune analyse enregistrée pour le moment.
          </Card>
        ) : (
          <Accordion type="single" collapsible className="space-y-2">
            {history.map((h) => (
              <AccordionItem key={h.id} value={h.id} className="border rounded-lg px-3">
                <AccordionTrigger className="text-left">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium truncate">{cropLabel(h.crop_key)}</span>
                      {h.parcel_name && (
                        <Badge variant="secondary" className="text-[10px] font-normal">
                          {h.parcel_name}
                        </Badge>
                      )}
                      {h.synced === false && (
                        <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-600 border-amber-500/30 gap-1">
                          <CloudOff className="h-2.5 w-2.5" /> En attente sync
                        </Badge>
                      )}
                      {h.confidence != null && <Badge variant="outline" className="shrink-0">{Math.round(h.confidence * 100)}%</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {new Date(h.created_at).toLocaleDateString("fr-FR")} — {h.diagnosis_summary}
                    </p>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-2 text-sm">
                  {h.latitude && h.longitude && (
                    <div className="flex items-center gap-1.5 text-xs text-primary font-mono bg-primary/5 p-1.5 rounded">
                      <MapPin className="h-3.5 w-3.5 shrink-0" />
                      <span>Coordonnées GPS terrain : {h.latitude.toFixed(5)}, {h.longitude.toFixed(5)}</span>
                    </div>
                  )}
                  {h.symptoms_input && <p className="text-muted-foreground"><strong>Symptômes :</strong> {h.symptoms_input}</p>}
                  {h.treatment_bio && <p><strong>Traitement bio :</strong> <span className="text-muted-foreground whitespace-pre-wrap">{h.treatment_bio}</span></p>}
                  {h.treatment_chemical && <p><strong>Traitement chimique :</strong> <span className="text-muted-foreground whitespace-pre-wrap">{h.treatment_chemical}</span></p>}
                  {Array.isArray(h.ai_response?.preventive_actions) && (
                    <ul className="list-disc list-inside text-muted-foreground">
                      {h.ai_response.preventive_actions.map((a: string, i: number) => <li key={i}>{a}</li>)}
                    </ul>
                  )}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </TabsContent>
    </Tabs>
  );
}
