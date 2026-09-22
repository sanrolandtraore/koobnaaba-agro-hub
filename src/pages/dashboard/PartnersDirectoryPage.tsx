import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Truck, ShieldCheck, FolderKanban, Landmark, Handshake, Phone, Mail, MapPin, Globe, Search } from "lucide-react";
import { partnerStorage, PartnerCategory, PartnerEntry } from "@/lib/partnerStorage";

const TABS: { value: PartnerCategory; label: string; icon: any }[] = [
  { value: "fournisseur", label: "Fournisseurs d'intrants", icon: Truck },
  { value: "assurance", label: "Assurances agricoles", icon: ShieldCheck },
  { value: "banque", label: "Services bancaires & Crédit", icon: Landmark },
  { value: "programme", label: "Programmes & Projets", icon: FolderKanban },
];

export default function PartnersDirectoryPage() {
  const [items, setItems] = useState<PartnerEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await partnerStorage.getEntries();
      setItems(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener("koobnaaba-partner-data-updated", handleUpdate);
    return () => window.removeEventListener("koobnaaba-partner-data-updated", handleUpdate);
  }, []);

  const filter = (cat: PartnerCategory) => {
    const t = q.trim().toLowerCase();
    return items.filter(
      (e) =>
        e.category === cat &&
        (!t ||
          e.name.toLowerCase().includes(t) ||
          (e.location || "").toLowerCase().includes(t) ||
          (e.description || "").toLowerCase().includes(t) ||
          (e.contact_name || "").toLowerCase().includes(t))
    );
  };

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-start gap-3">
        <div className="p-2.5 rounded-xl bg-primary/10 text-primary"><Handshake className="h-6 w-6" /></div>
        <div>
          <h1 className="text-2xl md:text-3xl font-heading font-bold">Annuaire National des Partenaires</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Fournisseurs certifiés, compagnies d'assurance, banques agricoles et bailleurs de fonds au Burkina Faso.
          </p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher par nom, lieu, description…"
          className="pl-9"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      <Tabs defaultValue="fournisseur">
        <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full h-auto p-1 bg-muted/60">
          {TABS.map(({ value, label, icon: Icon }) => (
            <TabsTrigger key={value} value={value} className="gap-2 py-2 text-xs sm:text-sm">
              <Icon className="h-4 w-4 shrink-0" />
              <span className="truncate">{label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {TABS.map(({ value, label }) => {
          const list = filter(value);
          return (
            <TabsContent key={value} value={value} className="mt-4">
              {loading ? (
                <div className="grid gap-3 md:grid-cols-2">
                  {[1, 2].map((i) => (
                    <Card key={i} className="h-40 animate-pulse bg-muted/40" />
                  ))}
                </div>
              ) : list.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="py-10 text-center text-muted-foreground text-sm">
                    Aucun partenaire dans la catégorie « {label} » pour cette recherche.
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {list.map((e) => (
                    <Card key={e.id} className="hover:border-primary/50 transition-all flex flex-col justify-between">
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between gap-2">
                          <CardTitle className="text-base font-bold leading-snug">{e.name}</CardTitle>
                          {e.badge ? (
                            <Badge variant="secondary" className="text-[10px] shrink-0 font-medium">
                              {e.badge}
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-[10px] shrink-0">
                              Partenaire
                            </Badge>
                          )}
                        </div>
                        {e.contact_name && (
                          <p className="text-xs text-muted-foreground">Contact : {e.contact_name}</p>
                        )}
                      </CardHeader>
                      <CardContent className="space-y-2 text-xs">
                        {e.description && (
                          <p className="text-muted-foreground line-clamp-3 leading-relaxed">
                            {e.description}
                          </p>
                        )}
                        <div className="space-y-1 pt-1 text-muted-foreground">
                          {e.location && (
                            <p className="flex items-center gap-2">
                              <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                              <span>{e.location}</span>
                            </p>
                          )}
                          {e.phone && (
                            <p className="flex items-center gap-2 font-mono">
                              <Phone className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                              <a href={`tel:${e.phone}`} className="hover:text-primary">{e.phone}</a>
                            </p>
                          )}
                          {e.email && (
                            <p className="flex items-center gap-2">
                              <Mail className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                              <a href={`mailto:${e.email}`} className="hover:text-primary truncate">{e.email}</a>
                            </p>
                          )}
                          {e.website && (
                            <p className="flex items-center gap-2">
                              <Globe className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
                              <a className="text-primary hover:underline truncate" href={e.website} target="_blank" rel="noreferrer">
                                {e.website.replace("https://", "")}
                              </a>
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}
