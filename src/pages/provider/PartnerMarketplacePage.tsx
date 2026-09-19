import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Store, Search, Phone, Mail, Globe, MapPin } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { OFFER_CATEGORIES } from "./partnerCategories";

interface Offer {
  id: string; owner_id: string; partner_name: string; category: string; title: string;
  description: string | null; price_indication: string | null; unit: string | null;
  location_name: string | null; contact_phone: string | null; contact_email: string | null;
  website: string | null; image_url: string | null;
}

const catLabel = (v: string) => OFFER_CATEGORIES.find((c) => c.value === v)?.label ?? v;

export default function PartnerMarketplacePage() {
  const { user } = useAuth();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [selected, setSelected] = useState<Offer | null>(null);
  const [quantity, setQuantity] = useState("");
  const [neededBy, setNeededBy] = useState("");
  const [message, setMessage] = useState("");
  const [phone, setPhone] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data } = await supabase.from("marketplace_offers").select("*")
        .eq("is_active", true).order("created_at", { ascending: false });
      setOffers((data ?? []) as Offer[]);
      setLoading(false);
    })();
  }, []);

  const filtered = useMemo(() => offers.filter((o) => {
    const okCat = category === "all" || o.category === category;
    const q = search.trim().toLowerCase();
    const okSearch = !q || [o.title, o.partner_name, o.description, o.location_name]
      .some((f) => f?.toLowerCase().includes(q));
    return okCat && okSearch;
  }), [offers, search, category]);

  const sendQuote = async () => {
    if (!user || !selected) return;
    setSending(true);
    const { error } = await supabase.from("quote_requests").insert({
      offer_id: selected.id, requester_id: user.id, owner_id: selected.owner_id,
      quantity: quantity || null, needed_by: neededBy || null,
      message: message || null, contact_phone: phone || null,
    });
    setSending(false);
    if (error) return toast({ title: "Envoi impossible", description: error.message, variant: "destructive" });
    toast({ title: "Demande de devis envoyée", description: "Le partenaire vous répondra depuis la plateforme." });
    setSelected(null); setQuantity(""); setNeededBy(""); setMessage(""); setPhone("");
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><Store className="h-5 w-5" /> Marketplace partenaires</h1>
        <p className="text-sm text-muted-foreground">Trouvez un fournisseur et demandez un devis</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Rechercher une offre" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Rechercher une offre" />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="sm:w-56"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les catégories</SelectItem>
            {OFFER_CATEGORIES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Chargement…</p>
      ) : filtered.length === 0 ? (
        <Card><CardContent className="py-6 text-sm text-muted-foreground">Aucune offre disponible pour cette recherche.</CardContent></Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((o) => (
            <Card key={o.id} className="flex flex-col">
              {o.image_url && (
                <img src={o.image_url} alt={o.title} loading="lazy" className="h-32 w-full object-cover rounded-t-lg" />
              )}
              <CardHeader className="pb-2">
                <Badge variant="secondary" className="w-fit mb-1">{catLabel(o.category)}</Badge>
                <CardTitle className="text-base">{o.title}</CardTitle>
                <p className="text-xs text-muted-foreground">{o.partner_name}</p>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col gap-2 text-sm">
                {o.description && <p className="text-muted-foreground line-clamp-3">{o.description}</p>}
                {o.price_indication && <p className="font-medium">{o.price_indication}{o.unit ? ` / ${o.unit}` : ""}</p>}
                {o.location_name && <p className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" />{o.location_name}</p>}
                <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                  {o.contact_phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{o.contact_phone}</span>}
                  {o.contact_email && <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{o.contact_email}</span>}
                  {o.website && <a href={o.website} target="_blank" rel="noreferrer" className="flex items-center gap-1 underline"><Globe className="h-3 w-3" />Site</a>}
                </div>
                <Button className="mt-auto" size="sm" onClick={() => setSelected(o)}>Demander un devis</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!selected} onOpenChange={(v) => !v && setSelected(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Demande de devis — {selected?.title}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="q-qty">Quantité souhaitée</Label>
              <Input id="q-qty" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="ex. 20 sacs" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="q-date">Besoin pour le</Label>
              <Input id="q-date" type="date" value={neededBy} onChange={(e) => setNeededBy(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="q-phone">Votre téléphone</Label>
              <Input id="q-phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="q-msg">Message</Label>
              <Textarea id="q-msg" value={message} onChange={(e) => setMessage(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelected(null)}>Annuler</Button>
            <Button onClick={sendQuote} disabled={sending}>{sending ? "Envoi…" : "Envoyer la demande"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
