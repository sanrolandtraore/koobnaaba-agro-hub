import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Lock, User, Wheat, Bug, Users, Handshake, Phone, ArrowLeft, KeyRound, WifiOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { hasOfflineCredentials } from "@/lib/offlineAuth";
import { hasPin } from "@/lib/pinAuth";
import logo from "@/assets/logo.png";

const ROLES = [
  { value: "agriculteur", label: "Agriculteur", icon: Wheat, desc: "Gestion de cultures et parcelles" },
  { value: "eleveur", label: "Éleveur", icon: Bug, desc: "Gestion d'élevage et troupeaux" },
  { value: "cooperative", label: "Coopérative", icon: Users, desc: "Gestion de membres et collectes" },
  { value: "partenaire", label: "Partenaire", icon: Handshake, desc: "Financement et accompagnement" },
] as const;

// Generate a stable internal identifier from phone number.
// The "@koobnaaba.local" suffix is a technical requirement of Supabase Auth
// and is never displayed to the user.
const phoneToInternalId = (phone: string) => {
  const cleaned = phone.replace(/[^0-9+]/g, "");
  return `${cleaned}@koobnaaba.local`;
};

const cleanPhone = (phone: string) => phone.replace(/[^0-9+]/g, "");

type AuthMode = "login" | "register" | "forgot";

const Auth = () => {
  const [mode, setMode] = useState<AuthMode>("login");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [resetPhone, setResetPhone] = useState("");
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!phone.trim()) {
      toast.error("Le numéro de téléphone est requis");
      setLoading(false);
      return;
    }
    const internalId = phoneToInternalId(phone);

    if (mode === "login") {
      if (!isOnline) {
        const { error } = await signInOffline(internalId, password);
        if (error) toast.error(error.message);
        else {
          toast.success("Connexion hors-ligne réussie !");
          navigate("/dashboard");
        }
        setLoading(false);
        return;
      }

      const { error } = await signIn(internalId, password);
      if (error) {
        toast.error(error.message === "Invalid login credentials"
          ? "Numéro ou mot de passe incorrect"
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
      const realPhone = cleanPhone(phone);
      if (realPhone.length < 8) {
        toast.error("Numéro de téléphone invalide");
        setLoading(false);
        return;
      }

      const { error } = await signUp(internalId, password, fullName, selectedRole, realPhone, "");
      if (error) {
        if (error.message?.includes("already registered")) {
          toast.error("Ce numéro est déjà utilisé. Essayez de vous connecter.");
        } else {
          toast.error(error.message);
        }
      } else {
        toast.success("Inscription réussie ! Vous pouvez maintenant vous connecter.");
        setMode("login");
      }
    }
    setLoading(false);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
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
              ? "Connectez-vous avec votre numéro de téléphone"
              : mode === "register"
              ? "Créez votre compte avec votre numéro de téléphone"
              : "Entrez votre numéro et votre nom complet"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {mode === "forgot" ? (
            <form onSubmit={handleResetPassword} className="space-y-4">
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
              <Button type="submit" className="w-full gradient-primary text-primary-foreground" disabled={loading}>
                {loading ? "Chargement..." : "Réinitialiser le mot de passe"}
              </Button>
              <button type="button" onClick={() => setMode("login")} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mx-auto">
                <ArrowLeft className="h-3 w-3" /> Retour à la connexion
              </button>
            </form>
          ) : (
            <>
              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === "register" && (
                  <>
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">Votre profil</Label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {ROLES.map(({ value, label, icon: Icon, desc }) => (
                          <button key={value} type="button" onClick={() => setSelectedRole(value)}
                            className={cn("flex flex-col items-center gap-1.5 rounded-xl border-2 p-3 text-center transition-all",
                              selectedRole === value ? "border-primary bg-primary/5 shadow-primary" : "border-border hover:border-primary/40 hover:bg-muted/50")}>
                            <Icon className={cn("h-6 w-6", selectedRole === value ? "text-primary" : "text-muted-foreground")} />
                            <span className="text-xs font-semibold leading-tight">{label}</span>
                            <span className="text-[10px] text-muted-foreground leading-tight hidden sm:block">{desc}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="name" className="flex items-center gap-2"><User className="h-4 w-4 text-muted-foreground" /> Nom complet</Label>
                      <Input id="name" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Ouédraogo Abdoulaye" required />
                    </div>
                  </>
                )}

                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-2"><Phone className="h-4 w-4 text-muted-foreground" /> Numéro de téléphone</Label>
                  <Input id="phone" type="tel" inputMode="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+226 70 00 00 00" required autoComplete="tel" />
                </div>

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
