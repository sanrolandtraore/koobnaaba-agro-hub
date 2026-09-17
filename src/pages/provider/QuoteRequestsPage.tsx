import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { FileText } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Quote {
  id: string; offer_id: string; requester_id: string; owner_id: string;
  quantity: string | null; needed_by: string | null; message: string | null;
  contact_phone: string | null; status: string; response: string | null; created_at: string;
  marketplace_offers?: { title: string; partner_name: string } | null;
}

const statusLabel: Record<string, string> = {
  en_attente: "En attente", acceptee: "Acceptée", refusee: "Refusée", cloturee: "Clôturée",
};

export default function QuoteRequestsPage() {
  const { user } = useAuth();
  const [sent, setSent] = useState<Quote[]>([]);
  const [received, setReceived] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  const load = async () => {
    if (!user) return;
    setLoading(true);
    const select = "*, marketplace_offers(title, partner_name)";
    const [s, r] = await Promise.all([
      supabase.from("quote_requests").select(select).eq("requester_id", user.id).order("created_at", { ascending: false }),
      supabase.from("quote_requests").select(select).eq("owner_id", user.id).order("created_at", { ascending: false }),
    ]);
    setSent((s.data ?? []) as Quote[]);
    setReceived((r.data ?? []) as Quote[]);
    setLoading(false);
  };

  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [user]);

  const respond = async (q: Quote, status: string) => {
    const { error } = await supabase.from("quote_requests")
      .update({ status, response: drafts[q.id] ?? q.response ?? null }).eq("id", q.id);
    if (error) return toast({ title: "Mise à jour impossible", variant: "destructive" });
    toast({ title: "Réponse enregistrée" });
    load();
  };

  const Row = ({ q, owner }: { q: Quote; owner: boolean }) => (
    <Card>
      <CardHeader className="pb-2 flex flex-row items-start justify-between gap-2">
        <div className="min-w-0">
          <CardTitle className="text-base truncate">{q.marketplace_offers?.title ?? "Offre"}</CardTitle>
          <p className="text-xs text-muted-foreground truncate">
            {q.marketplace_offers?.partner_name} · {new Date(q.created_at).toLocaleDateString("fr-FR")}
          </p>
        </div>
        <Badge variant="secondary" className="shrink-0">{statusLabel[q.status] ?? q.status}</Badge>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        {q.quantity && <p><span className="text-muted-foreground">Quantité : </span>{q.quantity}</p>}
        {q.needed_by && <p><span className="text-muted-foreground">Besoin pour le : </span>{new Date(q.needed_by).toLocaleDateString("fr-FR")}</p>}
        {q.message && <p><span className="text-muted-foreground">Message : </span>{q.message}</p>}
        {q.contact_phone && <p><span className="text-muted-foreground">Téléphone : </span>{q.contact_phone}</p>}
        {q.response && <p className="rounded-md bg-muted p-2"><span className="text-muted-foreground">Réponse : </span>{q.response}</p>}
        {owner && q.status === "en_attente" && (
          <div className="space-y-2 pt-1">
            <Textarea
              placeholder="Votre réponse / proposition de prix"
              value={drafts[q.id] ?? ""}
              onChange={(e) => setDrafts((d) => ({ ...d, [q.id]: e.target.value }))}
              aria-label="Réponse à la demande de devis"
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={() => respond(q, "acceptee")}>Accepter</Button>
              <Button size="sm" variant="outline" onClick={() => respond(q, "refusee")}>Refuser</Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><FileText className="h-5 w-5" /> Demandes de devis</h1>
        <p className="text-sm text-muted-foreground">Suivez vos demandes et répondez à celles reçues</p>
      </div>

      <Tabs defaultValue="sent">
        <TabsList>
          <TabsTrigger value="sent">Envoyées ({sent.length})</TabsTrigger>
          <TabsTrigger value="received">Reçues ({received.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="sent" className="space-y-3 mt-4">
          {loading ? <p className="text-sm text-muted-foreground">Chargement…</p>
            : sent.length === 0 ? <Card><CardContent className="py-6 text-sm text-muted-foreground">Aucune demande envoyée.</CardContent></Card>
            : sent.map((q) => <Row key={q.id} q={q} owner={false} />)}
        </TabsContent>
        <TabsContent value="received" className="space-y-3 mt-4">
          {loading ? <p className="text-sm text-muted-foreground">Chargement…</p>
            : received.length === 0 ? <Card><CardContent className="py-6 text-sm text-muted-foreground">Aucune demande reçue.</CardContent></Card>
            : received.map((q) => <Row key={q.id} q={q} owner />)}
        </TabsContent>
      </Tabs>
    </div>
  );
}
