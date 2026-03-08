import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tractor, Package, MapPin, Phone, Mail, Globe, Star, Search, X, Calendar,
} from "lucide-react";

type EquipmentListing = {
  id: string;
  title: string;
  equipment_type: string;
  brand: string | null;
  model: string | null;
  daily_rate: number;
  deposit_amount: number;
  location_name: string | null;
  description: string | null;
  status: string;
  avg_rating: number | null;
  review_count: number | null;
  availability_start: string | null;
  availability_end: string | null;
  images: string[] | null;
};

type InputSupplier = {
  id: string;
  name: string;
  category: string;
  description: string | null;
  address: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  website: string | null;
  is_verified: boolean;
  latitude: number | null;
  longitude: number | null;
};

const equipTypeLabels: Record<string, string> = {
  tracteur: "Tracteur", motoculteur: "Motoculteur", semoir: "Semoir",
  pulverisateur: "Pulvérisateur", remorque: "Remorque", irrigation: "Irrigation",
  batteuse: "Batteuse", autre: "Autre",
};

const MarketplacePage = () => {
  const [equipment, setEquipment] = useState<EquipmentListing[]>([]);
  const [suppliers, setSuppliers] = useState<InputSupplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchEquip, setSearchEquip] = useState("");
  const [searchSupplier, setSearchSupplier] = useState("");

  useEffect(() => {
    const load = async () => {
      const [eqRes, supRes] = await Promise.all([
        supabase
          .from("equipment_listings")
          .select("id, title, equipment_type, brand, model, daily_rate, deposit_amount, location_name, description, status, avg_rating, review_count, availability_start, availability_end, images")
          .eq("status", "disponible")
          .order("created_at", { ascending: false }),
        supabase
          .from("partner_directory")
          .select("id, name, category, description, address, contact_phone, contact_email, website, is_verified, latitude, longitude")
          .eq("category", "fournisseur_intrants")
          .order("name"),
      ]);
      setEquipment((eqRes.data as EquipmentListing[]) || []);
      setSuppliers((supRes.data as InputSupplier[]) || []);
      setLoading(false);
    };
    load();
  }, []);

  const filteredEquip = equipment.filter(e =>
    `${e.title} ${e.equipment_type} ${e.brand || ""} ${e.location_name || ""}`.toLowerCase().includes(searchEquip.toLowerCase())
  );

  const filteredSuppliers = suppliers.filter(s =>
    `${s.name} ${s.address || ""} ${s.description || ""}`.toLowerCase().includes(searchSupplier.toLowerCase())
  );

  if (loading) return <div className="space-y-4"><Skeleton className="h-8 w-64" /><Skeleton className="h-96" /></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-heading font-bold">Marketplace</h1>
        <p className="text-muted-foreground mt-1">Matériels en location et fournisseurs d'intrants à proximité</p>
      </div>

      <Tabs defaultValue="equipment" className="space-y-4">
        <TabsList>
          <TabsTrigger value="equipment" className="flex items-center gap-1.5">
            <Tractor className="h-4 w-4" /> Matériels ({equipment.length})
          </TabsTrigger>
          <TabsTrigger value="intrants" className="flex items-center gap-1.5">
            <Package className="h-4 w-4" /> Intrants ({suppliers.length})
          </TabsTrigger>
        </TabsList>

        {/* EQUIPMENT TAB */}
        <TabsContent value="equipment" className="space-y-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-9 pr-8"
              placeholder="Rechercher un matériel, lieu..."
              value={searchEquip}
              onChange={e => setSearchEquip(e.target.value)}
            />
            {searchEquip && (
              <button onClick={() => setSearchEquip("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {filteredEquip.length === 0 ? (
            <Card><CardContent className="py-8 text-center text-muted-foreground">Aucun matériel disponible pour le moment.</CardContent></Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredEquip.map(eq => (
                <Card key={eq.id} className="shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                  {eq.images && eq.images.length > 0 && (
                    <div className="h-40 bg-muted overflow-hidden">
                      <img src={eq.images[0]} alt={eq.title} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <CardContent className={`space-y-3 ${eq.images?.length ? "pt-3" : "pt-4"}`}>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-sm leading-tight">{eq.title}</h3>
                        <Badge variant="secondary" className="text-[10px] mt-1">
                          {equipTypeLabels[eq.equipment_type] || eq.equipment_type}
                        </Badge>
                      </div>
                      {(eq.avg_rating ?? 0) > 0 && (
                        <div className="flex items-center gap-0.5 text-xs shrink-0">
                          <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
                          <span className="font-medium">{Number(eq.avg_rating).toFixed(1)}</span>
                          <span className="text-muted-foreground">({eq.review_count})</span>
                        </div>
                      )}
                    </div>

                    {eq.brand && (
                      <p className="text-xs text-muted-foreground">{eq.brand} {eq.model || ""}</p>
                    )}

                    {eq.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2">{eq.description}</p>
                    )}

                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-lg font-bold text-primary">{Number(eq.daily_rate).toLocaleString()}</span>
                        <span className="text-xs text-muted-foreground"> FCFA/jour</span>
                      </div>
                      {eq.deposit_amount > 0 && (
                        <span className="text-[10px] text-muted-foreground">Caution : {Number(eq.deposit_amount).toLocaleString()} FCFA</span>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                      {eq.location_name && (
                        <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{eq.location_name}</span>
                      )}
                      {eq.availability_start && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(eq.availability_start).toLocaleDateString("fr-FR")}
                          {eq.availability_end && ` — ${new Date(eq.availability_end).toLocaleDateString("fr-FR")}`}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* SUPPLIERS TAB */}
        <TabsContent value="intrants" className="space-y-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-9 pr-8"
              placeholder="Rechercher un fournisseur..."
              value={searchSupplier}
              onChange={e => setSearchSupplier(e.target.value)}
            />
            {searchSupplier && (
              <button onClick={() => setSearchSupplier("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {filteredSuppliers.length === 0 ? (
            <Card><CardContent className="py-8 text-center text-muted-foreground">Aucun fournisseur d'intrants référencé pour le moment.</CardContent></Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredSuppliers.map(sup => (
                <Card key={sup.id} className="shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="pt-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-sm">{sup.name}</h3>
                      {sup.is_verified && (
                        <Badge variant="default" className="text-[10px] shrink-0">Vérifié ✓</Badge>
                      )}
                    </div>

                    {sup.description && (
                      <p className="text-xs text-muted-foreground line-clamp-3">{sup.description}</p>
                    )}

                    <div className="space-y-1.5 text-xs">
                      {sup.address && (
                        <div className="flex items-start gap-1.5 text-muted-foreground">
                          <MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                          <span>{sup.address}</span>
                        </div>
                      )}
                      {sup.contact_phone && (
                        <div className="flex items-center gap-1.5">
                          <Phone className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                          <a href={`tel:${sup.contact_phone}`} className="text-primary hover:underline font-medium">{sup.contact_phone}</a>
                        </div>
                      )}
                      {sup.contact_email && (
                        <div className="flex items-center gap-1.5">
                          <Mail className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                          <a href={`mailto:${sup.contact_email}`} className="text-primary hover:underline">{sup.contact_email}</a>
                        </div>
                      )}
                      {sup.website && (
                        <div className="flex items-center gap-1.5">
                          <Globe className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                          <a href={sup.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate">{sup.website}</a>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MarketplacePage;
