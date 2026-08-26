import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Lock, User, Wheat, Bug, Users, Handshake, Phone, Mail, ArrowLeft, KeyRound, WifiOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { hasOfflineCredentials } from "@/lib/offlineAuth";
import { hasPin } from "@/lib/pinAuth";
import logo from "@/assets/logo.png";

const ROLES = [
  { value: "agriculteur", label: "Expert Agronome", icon: Wheat, desc: "Cultures, parcelles & conseil agronomique" },
  { value: "eleveur", label: "Éleveur", icon: Bug, desc: "Élevage & troupeaux" },
  { value: "formation", label: "Éducation & Formation", icon: GraduationCap, desc: "Cours élevage & cultures" },
  { value: "partenaire", label: "Partenaire", icon: Handshake, desc: "Fournisseurs, banques…" },
] as const;

// `agent_technique` reste accepté pour les comptes historiques (module fusionné avec Agriculture).
const ALLOWED_ROLES = [...ROLES.map(r => r.value), "agent_technique"] as string[];

// Build a role-scoped internal identifier so each module can have its own account
// even when sharing the same phone number or email inbox.
const cleanPhone = (phone: string) => phone.replace(/[^0-9+]/g, "");
const isValidEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim());

const phoneToInternalId = (phone: string, role: string) => {
  const cleaned = cleanPhone(phone);
  const safeRole = ALLOWED_ROLES.includes(role) ? role : "agriculteur";
  return `${safeRole}.${cleaned}@koobnaaba.local`;
};

// Namespace real emails using plus-addressing so the same inbox can register
// several module-scoped accounts (delivery still lands in the base inbox).
const emailToInternalId = (email: string, role: string) => {
  const raw = email.trim().toLowerCase();
  const safeRole = ALLOWED_ROLES.includes(role) ? role : "agriculteur";
  const [local, domain] = raw.split("@");
  if (!local || !domain) return raw;
  const base = local.split("+")[0];
  return `${base}+koobnaaba_${safeRole}@${domain}`;
};

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
  const [resetName, setResetName] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("agriculteur");
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

  const buildAuthId = (): string | null => {
    if (idMethod === "phone") {
      if (!phone.trim()) {
        toast.error("Le numéro de téléphone est requis");
        return null;
      }
      return phoneToInternalId(phone, selectedRole);
    }
    if (!isValidEmail(email)) {
      toast.error("Adresse email invalide");
      return null;
    }
    return emailToInternalId(email, selectedRole);
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

      const { error } = await signIn(authId, password);
      if (error) {
        toast.error(error.message === "Invalid login credentials"
          ? "Identifiants incorrects pour ce module. Vérifiez votre profil sélectionné."
          : error.message);
      } else {
        toast.success("Connexion réussie !");
        const pinExists = await hasPin();
        navigate(pinExists ? "/dashboard" : "/auth/pin-setup");
      }
    } else {
      // Register
      if (!fullName.trim()) {
        toast.error("Le nom complet est requis");
        setLoading(false);
        return;
      }
      let phoneForProfile = "";
      let emailForProfile = "";
      if (idMethod === "phone") {
        phoneForProfile = cleanPhone(phone);
        if (phoneForProfile.length < 8) {
          toast.error("Numéro de téléphone invalide");
          setLoading(false);
          return;
        }
      } else {
        emailForProfile = email.trim().toLowerCase();
      }

      const { error } = await signUp(authId, password, fullName, selectedRole, phoneForProfile, emailForProfile);
      if (error) {
        if (error.message?.includes("already registered")) {
          toast.error(`Un compte ${selectedRole} existe déjà avec ces identifiants. Connectez-vous ou choisissez un autre module.`);
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
        emailToInternalId(resetEmail, selectedRole),
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

    if (!resetPhone.trim() || !resetName.trim()) {
      toast.error("Veuillez remplir tous les champs");
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
          identifier: cleanPhone(resetPhone),
          new_password: newPassword,
          full_name: resetName.trim(),
          role: selectedRole,
        },
      });
      if (error) toast.error("Erreur de connexion au serveur");
      else if (data?.error) toast.error(data.error);
      else {
        toast.success("Mot de passe réinitialisé ! Connectez-vous.");
        setMode("login");
        setResetPhone("");
        setResetName("");
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
          idMethod === "phone" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground")}>
        <Phone className="h-4 w-4" /> Téléphone
      </button>
      <button type="button" onClick={() => setIdMethod("email")}
        className={cn("flex items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-medium transition-all",
          idMethod === "email" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground")}>
        <Mail className="h-4 w-4" /> Email
      </button>
    </div>
  );

  const RolePicker = ({ compact = false }: { compact?: boolean }) => (
    <div className="space-y-2">
      <Label className="text-sm font-semibold">
        {mode === "login" ? "Choisissez le module à ouvrir" : "Votre profil"}
      </Label>
      <div className={cn("grid gap-2", compact ? "grid-cols-3 sm:grid-cols-5" : "grid-cols-2 sm:grid-cols-3")}>
        {ROLES.map(({ value, label, icon: Icon, desc }) => (
          <button key={value} type="button" onClick={() => setSelectedRole(value)}
            className={cn("flex flex-col items-center gap-1.5 rounded-xl border-2 p-2 sm:p-3 text-center transition-all",
              selectedRole === value ? "border-primary bg-primary/5 shadow-primary" : "border-border hover:border-primary/40 hover:bg-muted/50")}>
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
      <Card className="w-full max-w-lg border-border/50 shadow-warm animate-fade-in">
        <CardHeader className="text-center space-y-3">
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
              ? "Chaque module a son propre compte. Sélectionnez-le puis connectez-vous."
              : mode === "register"
              ? "Créez un compte dédié à votre module."
              : "Sélectionnez le module concerné pour réinitialiser son mot de passe"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <MethodToggle />

          {/* Module picker visible in every mode */}
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
                    <Input id="resetPhone" type="tel" value={resetPhone} onChange={e => setResetPhone(e.target.value)} placeholder="+226 70 00 00 00" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="resetName" className="flex items-center gap-2"><User className="h-4 w-4 text-muted-foreground" /> Nom complet (vérification)</Label>
                    <Input id="resetName" value={resetName} onChange={e => setResetName(e.target.value)} placeholder="Ouédraogo Abdoulaye" required />
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
              <Button type="submit" className="w-full gradient-primary text-primary-foreground" disabled={loading}>
                {loading ? "Chargement..." : idMethod === "email" ? "Envoyer le lien" : "Réinitialiser le mot de passe"}
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
                    <Label htmlFor="name" className="flex items-center gap-2"><User className="h-4 w-4 text-muted-foreground" /> Nom complet</Label>
                    <Input id="name" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Ouédraogo Abdoulaye" required />
                  </div>
                )}

                {idMethod === "phone" ? (
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="flex items-center gap-2"><Phone className="h-4 w-4 text-muted-foreground" /> Numéro de téléphone</Label>
                    <Input id="phone" type="tel" inputMode="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+226 70 00 00 00" required autoComplete="tel" />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-2"><Mail className="h-4 w-4 text-muted-foreground" /> Adresse email</Label>
                    <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="vous@example.com" required autoComplete="email" />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="password" className="flex items-center gap-2"><Lock className="h-4 w-4 text-muted-foreground" /> Mot de passe</Label>
                  <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required minLength={8} autoComplete={mode === "login" ? "current-password" : "new-password"} />
                </div>

                <Button type="submit" className="w-full gradient-primary text-primary-foreground" disabled={loading || (!isOnline && mode === "register")}>
                  {loading ? "Chargement..." : !isOnline && mode === "login" ? "Se connecter hors-ligne" : mode === "login" ? "Se connecter" : "S'inscrire"}
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
