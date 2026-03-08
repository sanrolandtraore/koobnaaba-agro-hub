import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Sprout, Mail, Lock, User, Wheat, Bug, Users, Compass, Handshake } from "lucide-react";
import { cn } from "@/lib/utils";

const ROLES = [
  { value: "agriculteur", label: "Agriculteur", icon: Wheat, desc: "Gestion de cultures et parcelles" },
  { value: "eleveur", label: "Éleveur", icon: Bug, desc: "Gestion d'élevage et troupeaux" },
  { value: "cooperative", label: "Coopérative", icon: Users, desc: "Gestion de membres et collectes" },
  { value: "agent_technique", label: "Expert Agronome", icon: Compass, desc: "Services techniques terrain" },
  { value: "partenaire", label: "Partenaire", icon: Handshake, desc: "Financement et accompagnement" },
] as const;

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("agriculteur");
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (isLogin) {
      const { error } = await signIn(email, password);
      if (error) {
        toast.error(error.message);
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
      const { error } = await signUp(email, password, fullName, selectedRole);
      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Inscription réussie ! Vérifiez votre email pour confirmer votre compte.");
      }
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center gradient-hero p-4">
      <Card className="w-full max-w-lg border-border/50 shadow-warm animate-fade-in">
        <CardHeader className="text-center space-y-3">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl gradient-warm shadow-warm">
            <Sprout className="h-7 w-7 text-accent-foreground" />
          </div>
          <CardTitle className="text-2xl font-heading">
            {isLogin ? "Bienvenue sur" : "Rejoignez"}{" "}
            <span className="text-gradient-warm">Koobnaaba</span>
          </CardTitle>
          <CardDescription>
            {isLogin ? "Connectez-vous à votre espace" : "Choisissez votre profil et créez votre compte"}
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
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" /> Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre@email.com"
                required
              />
            </div>
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
