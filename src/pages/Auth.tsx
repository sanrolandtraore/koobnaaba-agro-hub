import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import {
  Lock, User, Wheat, Bug, Users, GraduationCap, Handshake, Phone, Mail, ArrowLeft,
  KeyRound, WifiOff, Microscope, FlaskConical, Tractor, Beef, Landmark, Store, ShieldCheck
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { hasOfflineCredentials } from "@/lib/offlineAuth";
import logo from "@/assets/logo.png";
import LanguageSelector from "@/components/LanguageSelector";
import {
  PartnerProfileType,
  PARTNER_PROFILE_LIST,
  PARTNER_PROFILES,
} from "@/lib/partnerProfiles";
import { partnerTypeIcons } from "@/components/RoleSidebar";

const ROLES = [
  { value: "agriculteur", label: "Agriculteur", icon: Wheat, desc: "Planning des cultures & Services d'experts" },
  { value: "partenaire", label: "Partenaire Spécialisé", icon: Handshake, desc: "Intrants, Machinisme, Agronomie, Élevage ou Finance" },
] as const;

const ALLOWED_ROLES = [...ROLES.map(r => r.value), "eleveur", "agent_technique", "expert", "formation", "farmer"] as string[];

const cleanPhone = (phone: string) => phone.replace(/[^0-9+]/g, "");
const normalizePhone = (phone: string) => {
  const cleaned = cleanPhone(phone);
  if (cleaned.startsWith("+")) return cleaned;
  if (cleaned.startsWith("00")) return "+" + cleaned.slice(2);
  if (cleaned.length === 8) return "+226" + cleaned;
  return cleaned;
};
const isValidEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim());

type AuthMode = "login" | "register" | "forgot";
type IdMethod = "phone" | "email";

const Auth = () => {
  const [mode, setMode] = useState<AuthMode>("login");
  const [idMethod, setIdMethod] = useState<IdMethod>("phone");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [resetPhone, setResetPhone] = useState("");
  const [resetEmail, setResetEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);

  // Rôle et Spécialisation Partenaire
  const [selectedRole, setSelectedRole] = useState<string>("agriculteur");
  const [partnerType, setPartnerType] = useState<PartnerProfileType>("fournisseur_intrants");
  const [companyName, setCompanyName] = useState("");
  const [servicesOffered, setServicesOffered] = useState("");
  const [serviceArea, setServiceArea] = useState("");

  const [loading, setLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [hasCachedCreds, setHasCachedCreds] = useState(false);
  const { signIn, signUp, signInOffline } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    hasOfflineCredentials().then(setHasCachedCreds);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  // Mettre à jour les suggestions de services lorsque le type de partenaire change
  useEffect(() => {
    if (selectedRole === "partenaire" && PARTNER_PROFILES[partnerType]) {
      const p = PARTNER_PROFILES[partnerType];
      if (!servicesOffered || servicesOffered.trim().length === 0) {
        setServicesOffered(p.defaultProducts.slice(0, 3).join(", ") + " — " + p.defaultServices.slice(0, 2).join(", "));
      }
    }
  }, [partnerType, selectedRole]);

  const buildAuthId = (): string | null => {
    if (idMethod === "phone") {
      if (!phone.trim()) {
        toast.error("Le numéro de téléphone est requis");
        return null;
      }
      return normalizePhone(phone);
    }
    if (!isValidEmail(email)) {
      toast.error("Adresse email invalide");
      return null;
    }
    return email.trim().toLowerCase();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const authId = buildAuthId();
    if (!authId) { setLoading(false); return; }

    if (mode === "login") {
      if (!isOnline) {
        const { error } = await signInOffline(authId, password);
        if (error) toast.error(error.message);
        else {
          toast.success("Connexion hors-ligne réussie !");
          navigate("/dashboard");
        }
        setLoading(false);
        return;
      }

      const { error } = await signIn(authId, password, idMethod);
      if (error) {
        toast.error(error.message === "Invalid login credentials"
          ? "Identifiants incorrects. Vérifiez votre numéro/email et votre mot de passe."
          : error.message);
      } else {
        toast.success("Connexion réussie !");
        navigate("/dashboard");
      }
    } else {
      // Register
      if (!fullName.trim()) {
        toast.error("Le nom complet est requis");
        setLoading(false);
        return;
      }

      if (selectedRole === "partenaire") {
        if (!companyName.trim()) {
          toast.error("Veuillez renseigner le nom de votre entreprise ou structure.");
          setLoading(false);
          return;
        }
        if (!servicesOffered.trim()) {
          toast.error("Veuillez spécifier les types de produits et services que vous proposez.");
          setLoading(false);
          return;
        }
      }

      let phoneForProfile = "";
      let emailForProfile = "";
      if (idMethod === "phone") {
        phoneForProfile = normalizePhone(phone);
        if (phoneForProfile.length < 8) {
          toast.error("Numéro de téléphone invalide");
          setLoading(false);
          return;
        }
      } else {
        emailForProfile = email.trim().toLowerCase();
      }

      const partnerMetadata = selectedRole === "partenaire" ? {
        partner_type: partnerType,
        company_name: companyName.trim() || fullName.trim(),
        services_offered: servicesOffered.trim(),
        service_area: serviceArea.trim() || "Burkina Faso",
      } : undefined;

      const { error } = await signUp(
        authId,
        password,
        fullName,
        selectedRole,
        phoneForProfile,
        emailForProfile,
        idMethod,
        partnerMetadata
      );

      if (error) {
        if (error.message?.includes("already registered")) {
          toast.error(`Un compte existe déjà avec ces identifiants. Connectez-vous.`);
        } else {
          toast.error(error.message);
        }
      } else {
        toast.success(idMethod === "email"
          ? "Inscription réussie ! Vérifiez votre email pour confirmer votre compte."
          : "Inscription réussie ! Vous pouvez maintenant vous connecter.");
        setMode("login");
      }
    }
    setLoading(false);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (idMethod === "email") {
      if (!isValidEmail(resetEmail)) {
        toast.error("Adresse email invalide");
        return;
      }
      setLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(
        resetEmail.trim().toLowerCase(),
        { redirectTo: `${window.location.origin}/auth` }
      );
      if (error) toast.error(error.message);
      else {
        toast.success("Email de réinitialisation envoyé. Vérifiez votre boîte de réception.");
        setMode("login");
        setResetEmail("");
      }
      setLoading(false);
      return;
    }

    if (!resetPhone.trim()) {
      toast.error("Veuillez saisir votre numéro de téléphone");
      return;
    }

    if (!codeSent) {
      setLoading(true);
      try {
        const { data, error } = await supabase.functions.invoke("reset-password", {
          body: { step: "request", identifier: normalizePhone(resetPhone), role: selectedRole },
        });
        if (error) toast.error("Erreur de connexion au serveur");
        else if (data?.error) toast.error(data.error);
        else {
          toast.success(data?.message || "Code envoyé par SMS.");
          setCodeSent(true);
        }
      } catch {
        toast.error("Erreur de connexion au serveur");
      }
      setLoading(false);
      return;
    }

    if (!/^\d{6}$/.test(resetCode.trim())) {
      toast.error("Saisissez le code à 6 chiffres reçu par SMS");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("Le mot de passe doit contenir au moins 8 caractères");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("reset-password", {
        body: {
          step: "verify",
          identifier: cleanPhone(resetPhone),
          code: resetCode.trim(),
          new_password: newPassword,
          role: selectedRole,
        },
      });
      if (error) toast.error("Erreur de connexion au serveur");
      else if (data?.error) toast.error(data.error);
      else {
        toast.success("Mot de passe réinitialisé ! Connectez-vous.");
        setMode("login");
        setResetPhone("");
        setResetCode("");
        setCodeSent(false);
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch {
      toast.error("Erreur de connexion au serveur");
    }
    setLoading(false);
  };

  const MethodToggle = () => (
    <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-muted/50 border border-border">
      <button type="button" onClick={() => setIdMethod("phone")}
        className={cn("flex items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-medium transition-all",
          idMethod === "phone" ? "bg-background shadow-xs text-foreground" : "text-muted-foreground hover:text-foreground")}>
        <Phone className="h-4 w-4" /> Téléphone
      </button>
      <button type="button" onClick={() => setIdMethod("email")}
        className={cn("flex items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-medium transition-all",
          idMethod === "email" ? "bg-background shadow-xs text-foreground" : "text-muted-foreground hover:text-foreground")}>
        <Mail className="h-4 w-4" /> Email
      </button>
    </div>
  );

  const RolePicker = ({ compact = false }: { compact?: boolean }) => (
    <div className="space-y-2">
      <Label className="text-sm font-semibold">
        {mode === "login" ? "Choisissez votre profil d'accès" : "Votre profil de compte"}
      </Label>
      <div className="grid grid-cols-2 gap-3">
        {ROLES.map(({ value, label, icon: Icon, desc }) => (
          <button key={value} type="button" onClick={() => setSelectedRole(value)}
            className={cn("flex flex-col items-center gap-1.5 rounded-xl border-2 p-2 sm:p-3 text-center transition-all",
              selectedRole === value ? "border-primary bg-primary/5 shadow-xs" : "border-border hover:border-primary/40 hover:bg-muted/50")}>
            <Icon className={cn("h-5 w-5", selectedRole === value ? "text-primary" : "text-muted-foreground")} />
            <span className="text-[11px] sm:text-xs font-semibold leading-tight">{label}</span>
            {!compact && <span className="text-[10px] text-muted-foreground leading-tight hidden sm:block">{desc}</span>}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen items-center justify-center gradient-hero p-4">
      <Card className="w-full max-w-lg border-border/50 shadow-warm animate-fade-in my-8">
        <div className="flex justify-end pt-3 pr-4">
          <LanguageSelector className="text-xs" />
        </div>
        <CardHeader className="text-center space-y-3 pt-0">
          <img src={logo} alt="KoobNaaba" className="mx-auto h-16 w-auto" />
          <CardTitle className="text-2xl font-heading">
            {mode === "forgot" ? "Réinitialiser le " : mode === "login" ? "Bienvenue sur " : "Rejoignez "}
            {mode === "forgot" ? <span className="text-gradient-warm">mot de passe</span> : <span className="text-gradient-warm">KoobNaaba</span>}
          </CardTitle>
          <CardDescription>
            {!isOnline ? (
              <span className="flex items-center justify-center gap-1.5 text-amber-600">
                <WifiOff className="h-4 w-4" />
                {hasCachedCreds ? "Mode hors-ligne — connectez-vous avec vos identifiants enregistrés" : "Pas de connexion internet"}
              </span>
            ) : mode === "login"
              ? "Connectez-vous avec votre numéro de téléphone ou votre adresse email."
              : mode === "register"
              ? "Créez votre compte producteur ou votre espace partenaire spécialisé."
              : "Saisissez votre contact pour réinitialiser votre mot de passe"}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <MethodToggle />
          <RolePicker compact={mode !== "register"} />

          {mode === "forgot" ? (
            <form onSubmit={handleResetPassword} className="space-y-4">
              {idMethod === "email" ? (
                <div className="space-y-2">
                  <Label htmlFor="resetEmail" className="flex items-center gap-2"><Mail className="h-4 w-4 text-muted-foreground" /> Adresse email</Label>
                  <Input id="resetEmail" type="email" value={resetEmail} onChange={e => setResetEmail(e.target.value)} placeholder="vous@example.com" required autoComplete="email" />
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="resetPhone" className="flex items-center gap-2"><Phone className="h-4 w-4 text-muted-foreground" /> Numéro de téléphone</Label>
                    <Input id="resetPhone" type="tel" value={resetPhone} onChange={e => setResetPhone(e.target.value)} placeholder="+226 70 00 00 00" required disabled={codeSent} />
                  </div>
                  {codeSent && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="resetCode" className="flex items-center gap-2"><KeyRound className="h-4 w-4 text-muted-foreground" /> Code reçu par SMS</Label>
                        <Input id="resetCode" inputMode="numeric" maxLength={6} value={resetCode} onChange={e => setResetCode(e.target.value.replace(/\D/g, ""))} placeholder="123456" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="newPwd" className="flex items-center gap-2"><KeyRound className="h-4 w-4 text-muted-foreground" /> Nouveau mot de passe</Label>
                        <Input id="newPwd" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="••••••••" required minLength={8} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmPwd" className="flex items-center gap-2"><Lock className="h-4 w-4 text-muted-foreground" /> Confirmer le mot de passe</Label>
                        <Input id="confirmPwd" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="••••••••" required minLength={8} />
                      </div>
                    </>
                  )}
                </>
              )}
              <Button type="submit" className="w-full gradient-primary text-primary-foreground font-semibold" disabled={loading}>
                {loading ? "Chargement..." : idMethod === "email" ? "Envoyer le lien" : codeSent ? "Réinitialiser le mot de passe" : "Recevoir un code par SMS"}
              </Button>

              <button type="button" onClick={() => setMode("login")} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mx-auto">
                <ArrowLeft className="h-3 w-3" /> Retour à la connexion
              </button>
            </form>
          ) : (
            <>
              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === "register" && (
                  <div className="space-y-2">
                    <Label htmlFor="name" className="flex items-center gap-2"><User className="h-4 w-4 text-muted-foreground" /> Nom complet du responsable *</Label>
                    <Input id="name" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Ex: Ouédraogo Abdoulaye" required />
                  </div>
                )}

                {/* SÉLECTION DU PROFIL DE PARTENAIRE & PRODUITS PROPOSÉS (COMPTES NON UNIFIÉS) */}
                {mode === "register" && selectedRole === "partenaire" && (
                  <div className="space-y-3.5 pt-3 pb-2 border-t border-border">
                    <div className="space-y-1.5">
                      <Label className="text-sm font-bold flex items-center gap-1.5 text-primary">
                        <Store className="h-4 w-4 text-primary" />
                        Choisissez votre profil de partenaire *
                      </Label>
                      <p className="text-[11px] text-muted-foreground">
                        Les comptes partenaires sont personnalisés selon votre métier. Choisissez votre spécialisation :
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        {PARTNER_PROFILE_LIST.filter(p => p.id !== "polyvalent").map((p) => {
                          const IconComp = partnerTypeIcons[p.id] || Handshake;
                          const isSelected = partnerType === p.id;
                          return (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => {
                                setPartnerType(p.id);
                                const profileMeta = PARTNER_PROFILES[p.id];
                                if (profileMeta) {
                                  setServicesOffered(profileMeta.defaultProducts.slice(0, 3).join(", ") + " — " + profileMeta.defaultServices.slice(0, 2).join(", "));
                                }
                              }}
                              className={cn(
                                "flex items-start gap-2.5 rounded-xl border-2 p-2.5 text-left transition-all",
                                isSelected
                                  ? "border-primary bg-primary/10 shadow-xs"
                                  : "border-border hover:border-primary/40 hover:bg-muted/50"
                              )}
                            >
                              <div className={cn("p-2 rounded-lg shrink-0", isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>
                                <IconComp className="h-4 w-4" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <span className="text-xs font-bold leading-tight block text-foreground truncate">{p.shortLabel}</span>
                                <span className="text-[10px] text-muted-foreground line-clamp-2 mt-0.5 leading-tight">{p.tagline}</span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="companyName" className="text-xs font-semibold">
                        Nom de l'entreprise ou cabinet agricole *
                      </Label>
                      <Input
                        id="companyName"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="Ex: SAPHYTO SA, Faso Agro-Machinisme, Cabinet Sahel Conseil…"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="servicesOffered" className="text-xs font-semibold">
                        Types de produits et services proposés *
                      </Label>
                      <Textarea
                        id="servicesOffered"
                        rows={2}
                        value={servicesOffered}
                        onChange={(e) => setServicesOffered(e.target.value)}
                        placeholder="Ex: Vente d'engrais NPK/Urée, semences certifiées, location tracteur 75CV…"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="serviceArea" className="text-xs font-semibold">
                        Zone géographique d'intervention
                      </Label>
                      <Input
                        id="serviceArea"
                        value={serviceArea}
                        onChange={(e) => setServiceArea(e.target.value)}
                        placeholder="Ex: Bobo-Dioulasso, Ouagadougou, Boucle du Mouhoun…"
                      />
                    </div>
                  </div>
                )}

                {idMethod === "phone" ? (
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="flex items-center gap-2"><Phone className="h-4 w-4 text-muted-foreground" /> Numéro de téléphone *</Label>
                    <Input id="phone" type="tel" inputMode="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+226 70 00 00 00" required autoComplete="tel" />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-2"><Mail className="h-4 w-4 text-muted-foreground" /> Adresse email *</Label>
                    <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="vous@example.com" required autoComplete="email" />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="password" className="flex items-center gap-2"><Lock className="h-4 w-4 text-muted-foreground" /> Mot de passe *</Label>
                  <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required minLength={8} autoComplete={mode === "login" ? "current-password" : "new-password"} />
                </div>

                <Button type="submit" className="w-full gradient-primary text-primary-foreground font-semibold" disabled={loading || (!isOnline && mode === "register")}>
                  {loading ? "Chargement..." : !isOnline && mode === "login" ? "Se connecter hors-ligne" : mode === "login" ? "Se connecter" : "Créer mon compte"}
                </Button>
              </form>

              <div className="mt-4 text-center space-y-2">
                {mode === "login" && isOnline && (
                  <button type="button" onClick={() => setMode("forgot")} className="block w-full text-sm text-primary hover:text-primary/80 transition-colors font-medium">
                    Mot de passe oublié ?
                  </button>
                )}
                {isOnline && (
                  <button type="button" onClick={() => setMode(mode === "login" ? "register" : "login")} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {mode === "login" ? "Pas encore de compte ? S'inscrire" : "Déjà un compte ? Se connecter"}
                  </button>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
