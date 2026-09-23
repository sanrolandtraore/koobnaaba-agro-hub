import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  PartnerKycDossier,
  KycPersonType,
  getStoredPartnerKyc,
  savePartnerKyc,
  submitKycDossier,
  approveKycDossier,
  rejectKycDossier,
  resetKycDossier,
  DEFAULT_PHYSIQUE_DATA,
  DEFAULT_MORALE_DATA,
} from "@/lib/partnerKyc";
import { getStoredProviderSubscription } from "@/lib/providerSubscription";
import { PartnerVerifiedBadge } from "@/components/partner/PartnerVerifiedBadge";
import BackNavigationButton from "@/components/BackNavigationButton";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  ShieldCheck,
  Building2,
  UserCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Upload,
  Sparkles,
  FileText,
  RotateCcw,
  Check,
  Eye,
  Store,
  ExternalLink,
  HelpCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";

const PartnerKycPage: React.FC = () => {
  const { user, profile } = useAuth();
  const sub = getStoredProviderSubscription();
  const partnerId = user?.id || "current";

  const [dossier, setDossier] = useState<PartnerKycDossier>(() => getStoredPartnerKyc(partnerId));
  const [personType, setPersonType] = useState<KycPersonType>(dossier.type || "personne_morale");
  const [moraleForm, setMoraleForm] = useState(dossier.moraleData || DEFAULT_MORALE_DATA);
  const [physiqueForm, setPhysiqueForm] = useState(dossier.physiqueData || DEFAULT_PHYSIQUE_DATA);
  const [submitting, setSubmitting] = useState(false);

  // Sync state if external change
  useEffect(() => {
    const handleUpdate = () => {
      const fresh = getStoredPartnerKyc(partnerId);
      setDossier(fresh);
      setPersonType(fresh.type);
      setMoraleForm(fresh.moraleData);
      setPhysiqueForm(fresh.physiqueData);
    };
    window.addEventListener("nafa-partner-kyc-updated", handleUpdate);
    return () => window.removeEventListener("nafa-partner-kyc-updated", handleUpdate);
  }, [partnerId]);

  // Quick fill with demo data
  const handlePrefillDemo = (type: KycPersonType) => {
    if (type === "personne_morale") {
      setMoraleForm({
        ...DEFAULT_MORALE_DATA,
        companyName: profile?.full_name || sub.companyName || DEFAULT_MORALE_DATA.companyName,
        phone: user?.phone || profile?.phone || DEFAULT_MORALE_DATA.phone,
        email: user?.email || profile?.email || DEFAULT_MORALE_DATA.email,
        city: profile?.city || DEFAULT_MORALE_DATA.city,
      });
      toast.info("Données d'exemple Personne Morale chargées");
    } else {
      setPhysiqueForm({
        ...DEFAULT_PHYSIQUE_DATA,
        firstName: profile?.full_name?.split(" ")[0] || DEFAULT_PHYSIQUE_DATA.firstName,
        lastName: profile?.full_name?.split(" ").slice(1).join(" ") || DEFAULT_PHYSIQUE_DATA.lastName,
        phone: user?.phone || profile?.phone || DEFAULT_PHYSIQUE_DATA.phone,
        email: user?.email || profile?.email || DEFAULT_PHYSIQUE_DATA.email,
        city: profile?.city || DEFAULT_PHYSIQUE_DATA.city,
      });
      toast.info("Données d'exemple Personne Physique chargées");
    }
  };

  const handleFileUploadSim = (field: string, formType: "morale" | "physique") => {
    // Simulate picking a legitimate business document preview
    const sampleDocUrl =
      "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80";
    if (formType === "morale") {
      setMoraleForm((prev) => ({ ...prev, [field]: sampleDocUrl }));
    } else {
      setPhysiqueForm((prev) => ({ ...prev, [field]: sampleDocUrl }));
    }
    toast.success("Document justificatif importé avec succès.");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (personType === "personne_morale") {
        if (!moraleForm.companyName.trim() || !moraleForm.rccmNumber.trim() || !moraleForm.ifuNumber.trim()) {
          toast.error("Veuillez renseigner la Raison sociale, le RCCM et l'IFU de l'entreprise.");
          setSubmitting(false);
          return;
        }
      } else {
        if (!physiqueForm.firstName.trim() || !physiqueForm.lastName.trim() || !physiqueForm.docNumber.trim()) {
          toast.error("Veuillez renseigner votre nom, prénom et numéro de pièce d'identité.");
          setSubmitting(false);
          return;
        }
      }

      const updated = submitKycDossier(partnerId, personType, {
        physiqueData: physiqueForm,
        moraleData: moraleForm,
      });
      setDossier(updated);
      toast.success("Dossier KYC transmis avec succès ! Il est désormais en cours d'examen.");
    } catch (err: any) {
      toast.error(err?.message || "Erreur lors de la soumission du KYC.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleInstantApprove = () => {
    const approved = approveKycDossier(partnerId);
    setDossier(approved);
    toast.success("Félicitations ! Compte Partenaire Certifié et Badge Vérifié débloqué avec succès.");
  };

  const handleInstantReject = () => {
    const rejected = rejectKycDossier(
      "Document RCCM illisible ou non conforme aux registres consulaires du Burkina Faso. Merci de téléverser un extrait scanné de haute définition.",
      partnerId
    );
    setDossier(rejected);
    toast.error("Dossier KYC refusé pour le test.");
  };

  const handleReset = () => {
    if (!confirm("Réinitialiser le dossier KYC et annuler la vérification en cours ?")) return;
    const reset = resetKycDossier(partnerId);
    setDossier(reset);
    toast.info("Dossier KYC réinitialisé.");
  };

  const isVerified = dossier.status === "verifie";
  const isPending = dossier.status === "en_attente";
  const isRejected = dossier.status === "rejete";

  return (
    <div className="space-y-6 animate-fade-in p-4 md:p-6 max-w-5xl mx-auto pb-20">
      {/* ── 1. EN-TÊTE DE LA PAGE ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/80 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-heading font-extrabold text-foreground flex items-center gap-2">
                Vérification KYC & Certification Partenaire
                {isVerified && <PartnerVerifiedBadge isVerified={true} kyc={dossier} size="sm" />}
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                Certification officielle d'identité et de conformité pour Personnes Physiques & Morales sur NAFA - AGRITECH.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <BackNavigationButton fallbackTo="/dashboard" />
          <Button asChild variant="outline" size="sm" className="rounded-xl text-xs gap-1.5">
            <Link to="/dashboard/partenaire-vitrine">
              <Store className="h-3.5 w-3.5 text-primary" /> Voir ma vitrine
            </Link>
          </Button>
          <Button asChild variant="secondary" size="sm" className="rounded-xl text-xs gap-1.5">
            <Link to="/dashboard">Tableau de bord</Link>
          </Button>
        </div>
      </div>

      {/* ── 2. CARTE D'ÉTAT PRINCIPALE ── */}
      {isVerified ? (
        <Card className="border-emerald-500/40 bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent shadow-md rounded-2xl overflow-hidden">
          <CardContent className="p-6 sm:p-7 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-emerald-500/20 pb-4">
              <div className="flex items-start gap-3.5">
                <div className="h-12 w-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
                  <CheckCircle2 className="h-7 w-7" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-lg font-bold text-foreground">
                      Compte Partenaire Certifié & Vérifié
                    </h2>
                    <Badge className="bg-emerald-600 text-white font-bold text-xs gap-1">
                      <ShieldCheck className="h-3.5 w-3.5" /> Agréé NAFA
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Votre dossier a été examiné et validé par le service de conformité NAFA - AGRITECH.
                  </p>
                </div>
              </div>

              <div className="text-right sm:border-l sm:border-emerald-500/20 sm:pl-4 space-y-1">
                <span className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider">Matricule Officiel</span>
                <p className="font-mono text-xs font-bold text-foreground bg-background px-2 py-1 rounded-md border border-emerald-500/30">
                  {dossier.certificationId || "NAFA-CERT-2026-BF-0089"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
              <div className="p-3 rounded-xl bg-background border border-emerald-500/20 space-y-1">
                <span className="text-muted-foreground text-[11px]">Type de personne</span>
                <p className="font-semibold text-foreground flex items-center gap-1.5">
                  {dossier.type === "personne_morale" ? <Building2 className="h-3.5 w-3.5 text-primary" /> : <UserCheck className="h-3.5 w-3.5 text-primary" />}
                  {dossier.type === "personne_morale" ? "Personne Morale (Entreprise)" : "Personne Physique (Indépendant)"}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-background border border-emerald-500/20 space-y-1">
                <span className="text-muted-foreground text-[11px]">Identifiant vérifié</span>
                <p className="font-semibold text-foreground font-mono truncate">
                  {dossier.type === "personne_morale"
                    ? `RCCM: ${dossier.moraleData.rccmNumber}`
                    : `CNIB: ${dossier.physiqueData.docNumber}`}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-background border border-emerald-500/20 space-y-1">
                <span className="text-muted-foreground text-[11px]">Date de certification</span>
                <p className="font-semibold text-foreground">
                  {dossier.verifiedAt ? new Date(dossier.verifiedAt).toLocaleDateString("fr-FR") : new Date().toLocaleDateString("fr-FR")}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <p className="text-xs text-emerald-800 dark:text-emerald-300 font-medium flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-emerald-600" />
                Badge actif sur votre vitrine, sur l'annuaire national et sur l'ensemble de vos offres.
              </p>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReset}
                  className="text-xs text-muted-foreground hover:text-destructive rounded-xl h-8 gap-1"
                >
                  <RotateCcw className="h-3 w-3" /> Réinitialiser
                </Button>
                <Button
                  asChild
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs h-8 gap-1.5"
                >
                  <Link to="/dashboard/partenaire-vitrine">
                    <ExternalLink className="h-3 w-3" /> Voir le badge sur ma vitrine
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : isPending ? (
        <Card className="border-amber-500/40 bg-amber-500/10 shadow-md rounded-2xl">
          <CardContent className="p-6 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-xl bg-amber-500 text-amber-950 flex items-center justify-center shrink-0">
                  <Clock className="h-5 w-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">Dossier KYC en cours d'examen</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Dossier transmis le {dossier.submittedAt ? new Date(dossier.submittedAt).toLocaleString("fr-FR") : "récemment"}. L'équipe de conformité examine vos pièces justificatives sous 24 à 48 heures ouvrées.
                  </p>
                </div>
              </div>

              {/* Instant simulation for fast feedback / demo */}
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  onClick={handleInstantApprove}
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs gap-1.5"
                >
                  <Check className="h-3.5 w-3.5" /> Simuler l'approbation immédiate (Démo)
                </Button>
                <Button
                  onClick={handleInstantReject}
                  variant="outline"
                  size="sm"
                  className="text-xs rounded-xl text-destructive hover:bg-destructive/10"
                >
                  Simuler un refus
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : isRejected ? (
        <Card className="border-destructive/40 bg-destructive/10 shadow-md rounded-2xl">
          <CardContent className="p-6 space-y-3">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-xl bg-destructive text-destructive-foreground flex items-center justify-center shrink-0">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-foreground">Dossier KYC non validé</h3>
                <p className="text-xs text-destructive font-medium">
                  Motif : {dossier.rejectionReason || "Pièces justificatives incomplètes ou illisibles."}
                </p>
                <p className="text-xs text-muted-foreground">
                  Veuillez corriger les informations requises ci-dessous et soumettre à nouveau votre dossier.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-primary/30 bg-primary/5 rounded-2xl">
          <CardContent className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-xl bg-primary/15 text-primary shrink-0">
                <Sparkles className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-foreground">Pourquoi certifier votre compte partenaire ?</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  L'obtention du <strong>Badge Vérifié NAFA - AGRITECH</strong> garantit la conformité de votre activité (RCCM, IFU ou CNIB), active la priorité d'affichage pour les acheteurs et sécurise vos transactions via notre protocole séquestre Mobile Money.
                </p>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handlePrefillDemo(personType)}
              className="text-xs shrink-0 rounded-xl border-primary/30 text-primary hover:bg-primary/10 gap-1.5"
            >
              <Sparkles className="h-3.5 w-3.5" /> Pré-remplir avec un modèle type
            </Button>
          </CardContent>
        </Card>
      )}

      {/* ── 3. FORMULAIRE DE SOUMISSION KYC ── */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="border-border/80 shadow-sm rounded-2xl overflow-hidden">
          <CardHeader className="bg-muted/30 border-b border-border/80 pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <CardTitle className="text-base font-bold">1. Statut Juridique du Partenaire</CardTitle>
                <CardDescription className="text-xs">
                  Choisissez selon que vous exercez à titre individuel ou en tant qu'entreprise constituée.
                </CardDescription>
              </div>

              {/* Radio-style selector */}
              <div className="inline-flex p-1 rounded-xl bg-muted border border-border shrink-0">
                <button
                  type="button"
                  onClick={() => setPersonType("personne_morale")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    personType === "personne_morale"
                      ? "bg-background text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Building2 className="h-3.5 w-3.5" /> Personne Morale
                </button>
                <button
                  type="button"
                  onClick={() => setPersonType("personne_physique")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    personType === "personne_physique"
                      ? "bg-background text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <UserCheck className="h-3.5 w-3.5" /> Personne Physique
                </button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            {/* ─── CAS A : PERSONNE MORALE ─── */}
            {personType === "personne_morale" && (
              <div className="space-y-5 animate-fade-in">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2 space-y-1.5">
                    <Label className="text-xs font-semibold">Raison Sociale / Nom de l'Entreprise *</Label>
                    <Input
                      value={moraleForm.companyName}
                      onChange={(e) => setMoraleForm({ ...moraleForm, companyName: e.target.value })}
                      placeholder="Ex: Faso Intrants SARL, Coopérative SCOOPS..."
                      className="rounded-xl"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Forme Juridique *</Label>
                    <Select
                      value={moraleForm.legalForm}
                      onValueChange={(val: any) => setMoraleForm({ ...moraleForm, legalForm: val })}
                    >
                      <SelectTrigger className="rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SARL">SARL (Société à Responsabilité Limitée)</SelectItem>
                        <SelectItem value="SAS">SAS (Société par Actions Simplifiée)</SelectItem>
                        <SelectItem value="SA">SA (Société Anonyme)</SelectItem>
                        <SelectItem value="SCOOPS">Coopérative simplifiée (SCOOPS)</SelectItem>
                        <SelectItem value="GIE">GIE (Groupement d'Intérêt Économique)</SelectItem>
                        <SelectItem value="ONG_ASSOCIATION">ONG / Association</SelectItem>
                        <SelectItem value="ETS">ETS (Entreprise Individuelle)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold flex items-center justify-between">
                      <span>Numéro RCCM *</span>
                      <span className="text-[10px] text-muted-foreground">Registre de Commerce</span>
                    </Label>
                    <Input
                      value={moraleForm.rccmNumber}
                      onChange={(e) => setMoraleForm({ ...moraleForm, rccmNumber: e.target.value })}
                      placeholder="Ex: BF-BOB-01-2023-B12-00458"
                      className="rounded-xl font-mono uppercase"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold flex items-center justify-between">
                      <span>Numéro IFU *</span>
                      <span className="text-[10px] text-muted-foreground">Identifiant Fiscal Unique</span>
                    </Label>
                    <Input
                      value={moraleForm.ifuNumber}
                      onChange={(e) => setMoraleForm({ ...moraleForm, ifuNumber: e.target.value })}
                      placeholder="Ex: 00148920B"
                      className="rounded-xl font-mono uppercase"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold flex items-center gap-1.5">
                    Agrément Ministériel ou Licence Professionnelle (optionnel)
                    <HelpCircle className="h-3 w-3 text-muted-foreground" />
                  </Label>
                  <Input
                    value={moraleForm.ministerialApproval || ""}
                    onChange={(e) => setMoraleForm({ ...moraleForm, ministerialApproval: e.target.value })}
                    placeholder="Ex: Agrément MAAH n° 2021/089/MAAH (vente intrants / santé animale)"
                    className="rounded-xl"
                  />
                </div>

                <div className="pt-3 border-t border-border/80">
                  <h4 className="text-xs font-bold text-foreground mb-3 flex items-center gap-2">
                    <UserCheck className="h-4 w-4 text-primary" /> Informations du Gérant / Représentant Légal
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Nom et Prénom du représentant *</Label>
                      <Input
                        value={moraleForm.managerFullName}
                        onChange={(e) => setMoraleForm({ ...moraleForm, managerFullName: e.target.value })}
                        placeholder="Ex: Mamadou Traoré"
                        className="rounded-xl"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs">Fonction *</Label>
                      <Input
                        value={moraleForm.managerRole}
                        onChange={(e) => setMoraleForm({ ...moraleForm, managerRole: e.target.value })}
                        placeholder="Ex: Gérant, Administrateur Général..."
                        className="rounded-xl"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs">Numéro de pièce (CNIB / Passeport) *</Label>
                      <Input
                        value={moraleForm.managerDocNumber}
                        onChange={(e) => setMoraleForm({ ...moraleForm, managerDocNumber: e.target.value })}
                        placeholder="Ex: B10459382"
                        className="rounded-xl font-mono uppercase"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-border/80">
                  <h4 className="text-xs font-bold text-foreground mb-3 flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-primary" /> Coordonnées & Siège Social
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Téléphone officiel *</Label>
                      <Input
                        value={moraleForm.phone}
                        onChange={(e) => setMoraleForm({ ...moraleForm, phone: e.target.value })}
                        placeholder="+226 75 77 48 52"
                        className="rounded-xl"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs">Email professionnel *</Label>
                      <Input
                        type="email"
                        value={moraleForm.email}
                        onChange={(e) => setMoraleForm({ ...moraleForm, email: e.target.value })}
                        placeholder="contact@entreprise.bf"
                        className="rounded-xl"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs">Ville / Localité *</Label>
                      <Input
                        value={moraleForm.city}
                        onChange={(e) => setMoraleForm({ ...moraleForm, city: e.target.value })}
                        placeholder="Bobo-Dioulasso"
                        className="rounded-xl"
                        required
                      />
                    </div>
                  </div>

                  <div className="mt-3 space-y-1.5">
                    <Label className="text-xs">Adresse géographique complète</Label>
                    <Input
                      value={moraleForm.address}
                      onChange={(e) => setMoraleForm({ ...moraleForm, address: e.target.value })}
                      placeholder="Ex: Secteur 15, Rue du Commerce, Face pharmacie..."
                      className="rounded-xl"
                    />
                  </div>
                </div>

                {/* Justificatifs Personne Morale */}
                <div className="pt-3 border-t border-border/80 space-y-3">
                  <h4 className="text-xs font-bold text-foreground flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" /> Pièces Justificatives (Documents Scannés)
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="p-3.5 rounded-xl border border-dashed bg-muted/20 space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-foreground">Extrait RCCM / Statuts</span>
                        {moraleForm.rccmDocUrl && (
                          <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                            Chargé
                          </Badge>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground">Document officiel du tribunal ou du guichet unique MEBF.</p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleFileUploadSim("rccmDocUrl", "morale")}
                        className="w-full text-xs rounded-lg gap-1.5"
                      >
                        <Upload className="h-3 w-3" /> Téléverser l'extrait RCCM
                      </Button>
                    </div>

                    <div className="p-3.5 rounded-xl border border-dashed bg-muted/20 space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-foreground">Attestation IFU</span>
                        {moraleForm.ifuDocUrl && (
                          <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                            Chargé
                          </Badge>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground">Attestation d'immatriculation fiscale délivrée par la DGI.</p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleFileUploadSim("ifuDocUrl", "morale")}
                        className="w-full text-xs rounded-lg gap-1.5"
                      >
                        <Upload className="h-3 w-3" /> Téléverser l'attestation IFU
                      </Button>
                    </div>

                    <div className="p-3.5 rounded-xl border border-dashed bg-muted/20 space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-foreground">Pièce d'Identité du Gérant</span>
                        {moraleForm.managerDocUrl && (
                          <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                            Chargé
                          </Badge>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground">CNIB ou Passeport en cours de validité du représentant.</p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleFileUploadSim("managerDocUrl", "morale")}
                        className="w-full text-xs rounded-lg gap-1.5"
                      >
                        <Upload className="h-3 w-3" /> Téléverser la CNIB du gérant
                      </Button>
                    </div>

                    <div className="p-3.5 rounded-xl border border-dashed bg-muted/20 space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-foreground">Relevé RIB ou Compte Marchand</span>
                        <span className="text-[10px] text-muted-foreground">Mobile Money</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground">Pour percevoir les paiements sécurisés par séquestre.</p>
                      <Input
                        value={moraleForm.bankRibOrMobileMoney}
                        onChange={(e) => setMoraleForm({ ...moraleForm, bankRibOrMobileMoney: e.target.value })}
                        placeholder="Ex: Orange Money Marchand n° 75774852"
                        className="text-xs rounded-lg h-9"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ─── CAS B : PERSONNE PHYSIQUE ─── */}
            {personType === "personne_physique" && (
              <div className="space-y-5 animate-fade-in">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Prénom(s) *</Label>
                    <Input
                      value={physiqueForm.firstName}
                      onChange={(e) => setPhysiqueForm({ ...physiqueForm, firstName: e.target.value })}
                      placeholder="Ex: Karim"
                      className="rounded-xl"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Nom de famille *</Label>
                    <Input
                      value={physiqueForm.lastName}
                      onChange={(e) => setPhysiqueForm({ ...physiqueForm, lastName: e.target.value })}
                      placeholder="Ex: Ouedraogo"
                      className="rounded-xl"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Type de Pièce d'Identité *</Label>
                    <Select
                      value={physiqueForm.docType}
                      onValueChange={(val: any) => setPhysiqueForm({ ...physiqueForm, docType: val })}
                    >
                      <SelectTrigger className="rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cnib">CNIB (Burkina Faso)</SelectItem>
                        <SelectItem value="passeport">Passeport</SelectItem>
                        <SelectItem value="permis">Permis de Conduire</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Numéro de la Pièce *</Label>
                    <Input
                      value={physiqueForm.docNumber}
                      onChange={(e) => setPhysiqueForm({ ...physiqueForm, docNumber: e.target.value })}
                      placeholder="Ex: B12894750"
                      className="rounded-xl font-mono uppercase"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Date d'expiration *</Label>
                    <Input
                      type="date"
                      value={physiqueForm.docExpiry}
                      onChange={(e) => setPhysiqueForm({ ...physiqueForm, docExpiry: e.target.value })}
                      className="rounded-xl"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Profession / Métier *</Label>
                    <Input
                      value={physiqueForm.profession}
                      onChange={(e) => setPhysiqueForm({ ...physiqueForm, profession: e.target.value })}
                      placeholder="Ex: Opérateur Tracteur, Conseiller Phytosanitaire..."
                      className="rounded-xl"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Spécialité Technique (optionnel)</Label>
                    <Input
                      value={physiqueForm.specialty || ""}
                      onChange={(e) => setPhysiqueForm({ ...physiqueForm, specialty: e.target.value })}
                      placeholder="Ex: Semis mécanisé, Santé des ruminants..."
                      className="rounded-xl"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-border/80">
                  <h4 className="text-xs font-bold text-foreground mb-3 flex items-center gap-2">
                    <UserCheck className="h-4 w-4 text-primary" /> Contact & Localisation
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Téléphone personnel / WhatsApp *</Label>
                      <Input
                        value={physiqueForm.phone}
                        onChange={(e) => setPhysiqueForm({ ...physiqueForm, phone: e.target.value })}
                        placeholder="+226 70 00 00 00"
                        className="rounded-xl"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs">Email *</Label>
                      <Input
                        type="email"
                        value={physiqueForm.email}
                        onChange={(e) => setPhysiqueForm({ ...physiqueForm, email: e.target.value })}
                        placeholder="mon.email@domaine.bf"
                        className="rounded-xl"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs">Ville / Village de résidence *</Label>
                      <Input
                        value={physiqueForm.city}
                        onChange={(e) => setPhysiqueForm({ ...physiqueForm, city: e.target.value })}
                        placeholder="Bobo-Dioulasso"
                        className="rounded-xl"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Justificatifs Personne Physique */}
                <div className="pt-3 border-t border-border/80 space-y-3">
                  <h4 className="text-xs font-bold text-foreground flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" /> Justificatifs d'Identité & Compétence
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                    <div className="p-3.5 rounded-xl border border-dashed bg-muted/20 space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-foreground">Recto Pièce d'Identité</span>
                        {physiqueForm.docFrontUrl && (
                          <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                            Chargé
                          </Badge>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground">Photo nette du recto de la CNIB ou passeport.</p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleFileUploadSim("docFrontUrl", "physique")}
                        className="w-full text-xs rounded-lg gap-1.5"
                      >
                        <Upload className="h-3 w-3" /> Importer Recto
                      </Button>
                    </div>

                    <div className="p-3.5 rounded-xl border border-dashed bg-muted/20 space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-foreground">Verso Pièce d'Identité</span>
                        {physiqueForm.docBackUrl && (
                          <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                            Chargé
                          </Badge>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground">Photo nette du verso de la CNIB.</p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleFileUploadSim("docBackUrl", "physique")}
                        className="w-full text-xs rounded-lg gap-1.5"
                      >
                        <Upload className="h-3 w-3" /> Importer Verso
                      </Button>
                    </div>

                    <div className="p-3.5 rounded-xl border border-dashed bg-muted/20 space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-foreground">Photo Portrait / Selfie</span>
                        {physiqueForm.selfieUrl && (
                          <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                            Chargé
                          </Badge>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground">Photo de face pour confirmation biométrique.</p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleFileUploadSim("selfieUrl", "physique")}
                        className="w-full text-xs rounded-lg gap-1.5"
                      >
                        <Upload className="h-3 w-3" /> Importer Portrait
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── 4. ACTIONS DE VALIDATION ── */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-card border border-border shadow-xs">
          <div className="text-xs text-muted-foreground">
            En soumettant ce formulaire, vous certifiez sur l'honneur l'exactitude des informations fournies conformément à la législation burkinabè.
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto shrink-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                savePartnerKyc({
                  ...dossier,
                  type: personType,
                  moraleData: moraleForm,
                  physiqueData: physiqueForm,
                });
                toast.success("Brouillon sauvegardé localement.");
              }}
              className="text-xs rounded-xl h-11"
            >
              Enregistrer brouillon
            </Button>

            <Button
              type="submit"
              disabled={submitting}
              className="gradient-primary text-primary-foreground font-bold text-xs rounded-xl h-11 px-5 gap-2 shadow-md w-full sm:w-auto"
            >
              <ShieldCheck className="h-4 w-4" />
              Soumettre pour Certification KYC
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default PartnerKycPage;
