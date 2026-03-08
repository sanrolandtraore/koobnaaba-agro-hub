import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, WifiOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { user, loading, isOfflineSession } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;

  return (
    <>
      {isOfflineSession && (
        <div className="bg-amber-500/90 text-white text-center py-1.5 text-xs font-medium flex items-center justify-center gap-2">
          <WifiOff className="h-3.5 w-3.5" />
          <span>Session hors-ligne — les données affichées proviennent du cache local</span>
          <Badge variant="secondary" className="text-[10px] py-0">Lecture seule</Badge>
        </div>
      )}
      {children}
    </>
  );
};
