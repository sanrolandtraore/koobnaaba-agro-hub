import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Phone, Calendar, Clock, Send, CheckCheck, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { partnerStorage, QuoteRequest } from "@/lib/partnerStorage";

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  en_attente: { label: "En attente", variant: "secondary" },
  acceptee: { label: "Acceptée", variant: "default" },
  refusee: { label: "Refusée", variant: "destructive" },
  cloturee: { label: "Clôturée", variant: "outline" },
};

export default function QuoteRequestsPage() {
  const { user } = useAuth();
  const [quotes, setQuotes] = useState<QuoteRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await partnerStorage.getQuotes();
      setQuotes(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener("nafa-partner-data-updated", handleUpdate);
    return () => window.removeEventListener("nafa-partner-data-updated", handleUpdate);
  }, [user]);

  const respond = async (q: QuoteRequest, status: QuoteRequest["status"]) => {
    const replyText = drafts[q.id] || q.response || "";
    try {
      await partnerStorage.updateQuoteStatus(q.id, status, replyText);
      toast.success(status === "acceptee" ? "Devis accepté et réponse transmise !" : "Demande de devis déclinée.");
      loadData();
    } catch (e: any) {
      toast.error(e.message || "Erreur lors de la mise à jour");
    }
  };

  const Row = ({ q }: { q: QuoteRequest }) => {
    const badge = statusConfig[q.status] || { label: q.status, variant: "secondary" as const };

    return (
      <Card className="hover:border-primary/50 transition-all">
        <CardHeader className="pb-2 flex flex-row items-start justify-between gap-2">
          <div className="min-w-0">
            <CardTitle className="text-base font-bold truncate">
              {q.offer_title || "Prestation / Produit"}
            </CardTitle>
            <p className="text-xs text-muted-foreground truncate">
              Demandeur : <strong>{q.requester_name || "Exploitant Agricole"}</strong> · {new Date(q.created_at).toLocaleDateString("fr-FR")}
            </p>
          </div>
          <Badge variant={badge.variant} className="shrink-0 text-[11px]">
            {badge.label}
          </Badge>
        </CardHeader>

        <CardContent className="space-y-2 text-xs">
          {q.quantity && (
            <p>
              <span className="text-muted-foreground font-semibold">Volume / Surface souhaitée : </span>
              <span className="font-bold text-foreground">{q.quantity}</span>
            </p>
          )}
          {q.needed_by && (
            <p>
              <span className="text-muted-foreground">Date limite souhaitée : </span>
              <span>{new Date(q.needed_by).toLocaleDateString("fr-FR")}</span>
            </p>
          )}
          {q.contact_phone && (
            <p className="flex items-center gap-1.5 text-foreground font-mono">
              <Phone className="h-3 w-3 text-primary" /> {q.contact_phone}
            </p>
          )}
          {q.message && (
            <div className="p-2.5 rounded-lg bg-muted/60 text-foreground leading-relaxed">
              <span className="font-semibold block text-[11px] text-muted-foreground mb-0.5">Détails du besoin :</span>
              {q.message}
            </div>
          )}

          {q.response && (
            <div className="rounded-lg bg-primary/10 border border-primary/20 p-2.5">
              <span className="font-semibold text-primary block text-[11px]">Votre réponse :</span>
              <span className="text-foreground">{q.response}</span>
            </div>
          )}

          {q.status === "en_attente" && (
            <div className="space-y-2 pt-2 border-t">
              <Textarea
                placeholder="Indiquez votre tarif, disponibilité et conditions..."
                rows={2}
                value={drafts[q.id] ?? ""}
                onChange={(e) => setDrafts((d) => ({ ...d, [q.id]: e.target.value }))}
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={() => respond(q, "acceptee")} className="gradient-primary text-primary-foreground text-xs font-semibold">
                  <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Accepter & Répondre
                </Button>
                <Button size="sm" variant="outline" onClick={() => respond(q, "refusee")} className="text-xs">
                  <XCircle className="h-3.5 w-3.5 mr-1 text-destructive" /> Décliner
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const [activeFilter, setActiveFilter] = useState<"pending" | "processed">("pending");
  const pending = quotes.filter((q) => q.status === "en_attente");
  const processed = quotes.filter((q) => q.status !== "en_attente");

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-8 animate-fade-in pb-12">
      <div className="flex items-center gap-4">
        <div className="p-3.5 rounded-2xl bg-primary/10 text-primary">
          <FileText className="h-8 w-8" />
        </div>
        <div>
          <h1 className="text-3xl md:text-4xl font-heading font-extrabold text-foreground tracking-tight">
            Demandes de Devis Reçues
          </h1>
          <p className="text-base text-muted-foreground mt-1 font-medium">
            Consultez les devis reçus des exploitants agricoles pour vos engins, semences et prestations.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2].map((i) => (
            <Card key={i} className="h-36 animate-pulse bg-muted/40 rounded-2xl" />
          ))}
        </div>
      ) : quotes.length === 0 ? (
        <Card className="border-dashed rounded-2xl">
          <CardContent className="py-12 text-center text-muted-foreground text-base">
            Aucune demande de devis reçue pour le moment.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Sélecteur direct sans nav secondaire */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setActiveFilter("pending")}
              className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-base font-bold transition-all ${
                activeFilter === "pending"
                  ? "bg-primary text-primary-foreground shadow-premium"
                  : "bg-muted/70 text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <Clock className="h-5 w-5" />
              <span>À traiter</span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-background/50">
                {pending.length}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter("processed")}
              className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-base font-bold transition-all ${
                activeFilter === "processed"
                  ? "bg-primary text-primary-foreground shadow-premium"
                  : "bg-muted/70 text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <CheckCheck className="h-5 w-5" />
              <span>Traitées / Historique</span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-background/50">
                {processed.length}
              </span>
            </button>
          </div>

          {activeFilter === "pending" && (
            pending.length === 0 ? (
              <Card className="rounded-2xl"><CardContent className="py-10 text-center text-muted-foreground text-base">Toutes les demandes de devis sont traitées.</CardContent></Card>
            ) : (
              <div className="grid gap-5 md:grid-cols-2">
                {pending.map((q) => <Row key={q.id} q={q} />)}
              </div>
            )
          )}

          {activeFilter === "processed" && (
            processed.length === 0 ? (
              <Card className="rounded-2xl"><CardContent className="py-10 text-center text-muted-foreground text-base">Aucun devis archivé.</CardContent></Card>
            ) : (
              <div className="grid gap-5 md:grid-cols-2">
                {processed.map((q) => <Row key={q.id} q={q} />)}
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}
