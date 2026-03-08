import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Mail, Lock, User, Wheat, Bug, Users, Compass, Handshake, Phone, ArrowLeft, KeyRound } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/logo.png";

const ROLES = [
  { value: "agriculteur", label: "Agriculteur", icon: Wheat, desc: "Gestion de cultures et parcelles" },
  { value: "eleveur", label: "Éleveur", icon: Bug, desc: "Gestion d'élevage et troupeaux" },
  { value: "cooperative", label: "Coopérative", icon: Users, desc: "Gestion de membres et collectes" },
  { value: "partenaire", label: "Partenaire", icon: Handshake, desc: "Financement et accompagnement" },
] as const;

const phoneToEmail = (phone: string) => {
  const cleaned = phone.replace(/[^0-9+]/g, "");
  return `${cleaned}@koobnaaba.local`;
};

type AuthMode = "login" | "register" | "forgot";
type LoginMethod = "phone" | "email";

const Auth = () => {
  const [mode, setMode] = useState<AuthMode>("login");
  const [loginMethod, setLoginMethod] = useState<LoginMethod>("phone");
  const [phone, setPhone] = useState("");
  const [loginEmail, setLoginEmail] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [resetIdentifier, setResetIdentifier] = useState("");
  const [resetName, setResetName] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("agriculteur");
  const [loading, setLoading] = useState(false);
  // For register: choose primary method
  const [registerMethod, setRegisterMethod] = useState<LoginMethod>("phone");
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (mode === "login") {
      let authEmail: string;
      if (loginMethod === "phone") {
        if (!phone.trim()) { toast.error("Le numéro de téléphone est requis"); setLoading(false); return; }
        authEmail = phoneToEmail(phone);
      } else {
        if (!loginEmail.trim()) { toast.error("L'email est requis"); setLoading(false); return; }
        authEmail = loginEmail.trim();
      }
      const { error } = await signIn(authEmail, password);
      if (error) {
        toast.error(error.message === "Invalid login credentials"
          ? "Identifiant ou mot de passe incorrect"
          : error.message);
      } else {
        toast.success("Connexion réussie !");
        navigate("/dashboard");
      }
    } else {
      // Register
      if (!fullName.trim()) { toast.error("Le nom complet est requis"); setLoading(false); return; }

      let authEmail: string;
      let realPhone = "";
      let realEmail = "";

      if (registerMethod === "phone") {
        if (!phone.trim()) { toast.error("Le numéro de téléphone est requis"); setLoading(false); return; }
        authEmail = phoneToEmail(phone);
        realPhone = phone.replace(/[^0-9+]/g, "");
        realEmail = email; // optional
      } else {
        if (!loginEmail.trim()) { toast.error("L'email est requis"); setLoading(false); return; }
        authEmail = loginEmail.trim();
        realEmail = loginEmail.trim();
        realPhone = phone; // optional
      }

      const { error } = await signUp(authEmail, password, fullName, selectedRole, realPhone, realEmail);
      if (error) {
        if (error.message?.includes("already registered")) {
          toast.error("Cet identifiant est déjà utilisé. Essayez de vous connecter.");
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
    if (!resetIdentifier.trim() || !resetName.trim()) { toast.error("Veuillez remplir tous les champs"); return; }
    if (newPassword.length < 6) { toast.error("Le mot de passe doit contenir au moins 6 caractères"); return; }
    if (newPassword !== confirmPassword) { toast.error("Les mots de passe ne correspondent pas"); return; }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("reset-password", {
        body: { identifier: resetIdentifier.trim(), new_password: newPassword, full_name: resetName.trim() },
      });
      if (error) toast.error("Erreur de connexion au serveur");
      else if (data?.error) toast.error(data.error);
      else { toast.success("Mot de passe réinitialisé ! Connectez-vous."); setMode("login"); setResetIdentifier(""); setResetName(""); setNewPassword(""); setConfirmPassword(""); }
    } catch { toast.error("Erreur de connexion au serveur"); }
    setLoading(false);
  };

  const MethodToggle = ({ value, onChange, label1 = "Téléphone", label2 = "Email" }: { value: LoginMethod; onChange: (v: LoginMethod) => void; label1?: string; label2?: string }) => (
    <div className="flex rounded-lg border border-border overflow-hidden">
      <button type="button" onClick={() => onChange("phone")}
        className={cn("flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors", value === "phone" ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground hover:bg-muted")}>
        <Phone className="h-3.5 w-3.5" />{label1}
      </button>
      <button type="button" onClick={() => onChange("email")}
        className={cn("flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors", value === "email" ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground hover:bg-muted")}>
        <Mail className="h-3.5 w-3.5" />{label2}
      </button>
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
            {mode === "login" ? "Connectez-vous avec votre téléphone ou email" : mode === "register" ? "Créez votre compte avec téléphone ou email" : "Entrez votre identifiant et votre nom complet"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {mode === "forgot" ? (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="resetId" className="flex items-center gap-2"><Phone className="h-4 w-4 text-muted-foreground" /> Téléphone ou Email</Label>
                <Input id="resetId" value={resetIdentifier} onChange={e => setResetIdentifier(e.target.value)} placeholder="+226 70 00 00 00 ou votre@email.com" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="resetName" className="flex items-center gap-2"><User className="h-4 w-4 text-muted-foreground" /> Nom complet (vérification)</Label>
                <Input id="resetName" value={resetName} onChange={e => setResetName(e.target.value)} placeholder="Ouédraogo Abdoulaye" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPwd" className="flex items-center gap-2"><KeyRound className="h-4 w-4 text-muted-foreground" /> Nouveau mot de passe</Label>
                <Input id="newPwd" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="••••••••" required minLength={6} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPwd" className="flex items-center gap-2"><Lock className="h-4 w-4 text-muted-foreground" /> Confirmer le mot de passe</Label>
                <Input id="confirmPwd" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="••••••••" required minLength={6} />
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

                {/* Method toggle */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Se {mode === "login" ? "connecter" : "inscrire"} avec</Label>
                  <MethodToggle value={mode === "login" ? loginMethod : registerMethod} onChange={v => mode === "login" ? setLoginMethod(v) : setRegisterMethod(v)} />
                </div>

                {/* Phone field */}
                {((mode === "login" && loginMethod === "phone") || (mode === "register" && registerMethod === "phone")) && (
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="flex items-center gap-2"><Phone className="h-4 w-4 text-muted-foreground" /> Numéro de téléphone</Label>
                    <Input id="phone" type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+226 70 00 00 00" required />
                  </div>
                )}

                {/* Email field (login or register primary) */}
                {((mode === "login" && loginMethod === "email") || (mode === "register" && registerMethod === "email")) && (
                  <div className="space-y-2">
                    <Label htmlFor="loginEmail" className="flex items-center gap-2"><Mail className="h-4 w-4 text-muted-foreground" /> Email</Label>
                    <Input id="loginEmail" type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} placeholder="votre@email.com" required />
                  </div>
                )}

                {/* Optional secondary field for register */}
                {mode === "register" && registerMethod === "phone" && (
                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-2"><Mail className="h-4 w-4 text-muted-foreground" /> Email <span className="text-xs text-muted-foreground">(optionnel)</span></Label>
                    <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="votre@email.com" />
                  </div>
                )}
                {mode === "register" && registerMethod === "email" && (
                  <div className="space-y-2">
                    <Label htmlFor="phoneOpt" className="flex items-center gap-2"><Phone className="h-4 w-4 text-muted-foreground" /> Téléphone <span className="text-xs text-muted-foreground">(optionnel)</span></Label>
                    <Input id="phoneOpt" type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+226 70 00 00 00" />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="password" className="flex items-center gap-2"><Lock className="h-4 w-4 text-muted-foreground" /> Mot de passe</Label>
                  <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required minLength={6} />
                </div>

                <Button type="submit" className="w-full gradient-primary text-primary-foreground" disabled={loading}>
                  {loading ? "Chargement..." : mode === "login" ? "Se connecter" : "S'inscrire"}
                </Button>
              </form>
              <div className="mt-4 text-center space-y-2">
                {mode === "login" && (
                  <button type="button" onClick={() => setMode("forgot")} className="block w-full text-sm text-primary hover:text-primary/80 transition-colors font-medium">
                    Mot de passe oublié ?
                  </button>
                )}
                <button type="button" onClick={() => setMode(mode === "login" ? "register" : "login")} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  {mode === "login" ? "Pas encore de compte ? S'inscrire" : "Déjà un compte ? Se connecter"}
                </button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
