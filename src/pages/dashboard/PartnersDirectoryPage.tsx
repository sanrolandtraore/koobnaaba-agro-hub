import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Truck, ShieldCheck, FolderKanban, Landmark, Handshake, Phone, Mail, MapPin, Globe, Search } from "lucide-react";

type Category = "fournisseur" | "assurance" | "programme" | "banque";

interface Entry {
  id: string;
  category: Category;
  name: string;
  contact_name: string | null;
  phone: string | null;
  email: string | null;
  location: string | null;
  website: string | null;
  description: string | null;
}

const TABS: { value: Category; label: string; icon: any }[] = [
  { value: "fournisseur", label: "Fournisseurs", icon: Truck },
  { value: "assurance", label: "Assurance", icon: ShieldCheck },
  { value: "programme", label: "Programmes / Projets", icon: FolderKanban },
  { value: "banque", label: "Services bancaires", icon: Landmark },
];

export default function PartnersDirectoryPage() {
  const [items, setItems] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from("partner_entries")
        .select("*")
        .order("created_at", { ascending: false });
      setItems((data as any) || []);
      setLoading(false);
    })();
  }, []);

  const filter = (cat: Category) => {
    const t = q.trim().toLowerCase();
    return items.filter(
      (e) =>
        e.category === cat &&
        (!t ||
          e.name.toLowerCase().includes(t) ||
          (e.location || "").toLowerCase().includes(t) ||
          (e.description || "").toLowerCase().includes(t))
    );
  };

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-4">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-primary/10 text-primary"><Handshake className="h-6 w-6" /></div>
        <div>
          <h1 className="text-2xl font-bold">Annuaire des Partenaires</h1>
          <p className="text-sm text-muted-foreground">Services proposés par nos partenaires</p>
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
        <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full h-auto">
          {TABS.map(({ value, label, icon: Icon }) => (
            <TabsTrigger key={value} value={value} className="gap-2 py-2">
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {TABS.map(({ value, label }) => {
          const list = filter(value);
          return (
            <TabsContent key={value} value={value} className="mt-4">
              {loading ? (
                <p className="text-muted-foreground text-sm">Chargement…</p>
              ) : list.length === 0 ? (
                <Card>
                  <CardContent className="py-10 text-center text-muted-foreground">
                    Aucun partenaire dans la catégorie « {label} » pour l'instant.
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-3 md:grid-cols-2">
                  {list.map((e) => (
                    <Card key={e.id}>
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between gap-2">
                          <CardTitle className="text-base">{e.name}</CardTitle>
                          <Badge variant="secondary">{label}</Badge>
                        </div>
                        {e.contact_name && (
                          <p className="text-xs text-muted-foreground">{e.contact_name}</p>
                        )}
                      </CardHeader>
                      <CardContent className="space-y-1 text-sm">
                        {e.phone && (
                          <p className="flex items-center gap-2">
                            <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                            <a href={`tel:${e.phone}`} className="hover:text-primary">{e.phone}</a>
                          </p>
                        )}
                        {e.email && (
                          <p className="flex items-center gap-2">
                            <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                            <a href={`mailto:${e.email}`} className="hover:text-primary">{e.email}</a>
                          </p>
                        )}
                        {e.location && (
                          <p className="flex items-center gap-2">
                            <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                            {e.location}
                          </p>
                        )}
                        {e.website && (
                          <p className="flex items-center gap-2">
                            <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                            <a className="text-primary hover:underline truncate" href={e.website} target="_blank" rel="noreferrer">
                              {e.website}
                            </a>
                          </p>
                        )}
                        {e.description && (
                          <p className="text-muted-foreground pt-1">{e.description}</p>
                        )}
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
