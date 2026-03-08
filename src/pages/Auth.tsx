import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Mail, Lock, User, Wheat, Bug, Users, Compass, Handshake, Phone } from "lucide-react";
import { cn } from "@/lib/utils";
import logo from "@/assets/logo.png";

const ROLES = [
  { value: "agriculteur", label: "Agriculteur", icon: Wheat, desc: "Gestion de cultures et parcelles" },
  { value: "eleveur", label: "Éleveur", icon: Bug, desc: "Gestion d'élevage et troupeaux" },
  { value: "cooperative", label: "Coopérative", icon: Users, desc: "Gestion de membres et collectes" },
  { value: "agent_technique", label: "Expert Agronome", icon: Compass, desc: "Services techniques terrain" },
  { value: "partenaire", label: "Partenaire", icon: Handshake, desc: "Financement et accompagnement" },
] as const;

/** Convert phone to a synthetic email for Supabase auth */
const phoneToEmail = (phone: string) => {
  const cleaned = phone.replace(/[^0-9+]/g, "");
  return `${cleaned}@koobnaaba.local`;
};

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("agriculteur");
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) {
      toast.error("Le numéro de téléphone est requis");
      return;
    }
    setLoading(true);

    const authEmail = phoneToEmail(phone);

    if (isLogin) {
      const { error } = await signIn(authEmail, password);
      if (error) {
        toast.error(error.message === "Invalid login credentials"
          ? "Numéro ou mot de passe incorrect"
          : error.message);
      } else {
        toast.success("Connexion réussie !");
        navigate("/dashboard");
      }
    } else {
      if (!fullName.trim()) {
        toast.error("Le nom complet est requis");
        setLoading(false);
        return;
      }
      const { error } = await signUp(authEmail, password, fullName, selectedRole, phone, email);
      if (error) {
        if (error.message?.includes("already registered")) {
          toast.error("Ce numéro de téléphone est déjà utilisé pour ce profil. Essayez de vous connecter.");
        } else {
          toast.error(error.message);
        }
      } else {
        toast.success("Inscription réussie ! Vous pouvez maintenant vous connecter.");
        setIsLogin(true);
      }
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center gradient-hero p-4">
      <Card className="w-full max-w-lg border-border/50 shadow-warm animate-fade-in">
        <CardHeader className="text-center space-y-3">
          <img src={logo} alt="KoobNaaba" className="mx-auto h-16 w-auto" />
          <CardTitle className="text-2xl font-heading">
            {isLogin ? "Bienvenue sur" : "Rejoignez"}{" "}
            <span className="text-gradient-warm">KoobNaaba</span>
          </CardTitle>
          <CardDescription>
            {isLogin ? "Connectez-vous avec votre numéro de téléphone" : "Choisissez votre profil et créez votre compte"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Votre profil</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {ROLES.map(({ value, label, icon: Icon, desc }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setSelectedRole(value)}
                        className={cn(
                          "flex flex-col items-center gap-1.5 rounded-xl border-2 p-3 text-center transition-all",
                          selectedRole === value
                            ? "border-primary bg-primary/5 shadow-primary"
                            : "border-border hover:border-primary/40 hover:bg-muted/50"
                        )}
                      >
                        <Icon className={cn("h-6 w-6", selectedRole === value ? "text-primary" : "text-muted-foreground")} />
                        <span className="text-xs font-semibold leading-tight">{label}</span>
                        <span className="text-[10px] text-muted-foreground leading-tight hidden sm:block">{desc}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name" className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" /> Nom complet
                  </Label>
                  <Input
                    id="name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Ouédraogo Abdoulaye"
                    required={!isLogin}
                  />
                </div>
              </>
            )}
            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" /> Numéro de téléphone
              </Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+226 70 00 00 00"
                required
              />
            </div>
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" /> Email <span className="text-xs text-muted-foreground">(optionnel)</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre@email.com"
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-muted-foreground" /> Mot de passe
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>
            <Button type="submit" className="w-full gradient-primary text-primary-foreground" disabled={loading}>
              {loading ? "Chargement..." : isLogin ? "Se connecter" : "S'inscrire"}
            </Button>
          </form>
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {isLogin ? "Pas encore de compte ? S'inscrire" : "Déjà un compte ? Se connecter"}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
