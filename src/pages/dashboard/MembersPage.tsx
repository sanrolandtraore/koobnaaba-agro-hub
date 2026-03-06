import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";

const MembersPage = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-heading font-bold">Gestion des membres</h1>
        <p className="text-muted-foreground mt-1">Gérez les membres de votre coopérative</p>
      </div>
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Users className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-center">La gestion des membres est en cours de développement.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default MembersPage;
