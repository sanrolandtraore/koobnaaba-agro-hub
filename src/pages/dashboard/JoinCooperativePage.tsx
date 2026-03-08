import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Users, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const JoinCooperativePage = () => {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    setLoading(true);

    const { data, error } = await supabase.rpc("join_cooperative_by_code", {
      _invite_code: code.trim().toUpperCase(),
    });

    setLoading(false);

    if (error) {
      toast.error("Erreur: " + error.message);
      return;
    }

    const result = data as any;
    if (result?.error) {
      toast.error(result.error);
      return;
    }

    toast.success(`Vous avez rejoint la coopérative "${result.cooperative_name}" !`);
    // Reload page to pick up new cooperative membership
    window.location.href = "/dashboard";
  };

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <Users className="h-7 w-7 text-primary" />
          </div>
          <CardTitle>Rejoindre une coopérative</CardTitle>
          <CardDescription>
            Entrez le code d'invitation fourni par le président de votre coopérative
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleJoin} className="space-y-4">
            <div>
              <Label>Code d'invitation</Label>
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="Ex: AB12CD34"
                maxLength={8}
                className="text-center text-lg tracking-widest font-mono"
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading || code.length < 4}>
              {loading ? "Connexion..." : "Rejoindre"}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default JoinCooperativePage;
