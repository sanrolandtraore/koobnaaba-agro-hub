import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ShoppingCart, Search, Loader2, MapPin, User, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface MarketplacePricePickerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  searchHint?: string;
  unit?: string;
}

interface MarketplaceService {
  id: string;
  title: string;
  price: number;
  price_unit: string;
  category: string;
  location_name: string | null;
  phone: string | null;
  provider_id: string;
  is_active: boolean;
  provider_name?: string | null;
}

const MarketplacePricePicker = ({
  value,
  onChange,
  placeholder = "0",
  searchHint = "",
  unit = "FCFA",
}: MarketplacePricePickerProps) => {
  const [open, setOpen] = useState(false);
  const [services, setServices] = useState<MarketplaceService[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState(searchHint);
  const [locationFilter, setLocationFilter] = useState("");
  const [userLocation, setUserLocation] = useState<string>("");
  const [suggested, setSuggested] = useState<MarketplaceService | null>(null);

  // Load user's location (country) for prioritization
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const uid = data.user?.id;
      if (!uid) return;
      supabase.from("profiles").select("country").eq("user_id", uid).maybeSingle()
        .then(({ data: p }) => { if (p?.country) setUserLocation(p.country); });
    });
  }, []);

  const enrichWithProviders = async (rows: MarketplaceService[]) => {
    const ids = Array.from(new Set(rows.map(r => r.provider_id).filter(Boolean)));
    if (ids.length === 0) return rows;
    const { data: profs } = await supabase
      .from("profiles")
      .select("user_id, full_name")
      .in("user_id", ids);
    const map = new Map((profs || []).map((p: any) => [p.user_id, p.full_name]));
    return rows.map(r => ({ ...r, provider_name: map.get(r.provider_id) || null }));
  };

  useEffect(() => {
    if (!searchHint) return;
    setSearch(searchHint);
    supabase
      .from("marketplace_services")
      .select("id, title, price, price_unit, category, location_name, phone, provider_id, is_active")
      .eq("is_active", true)
      .ilike("title", `%${searchHint}%`)
      .order("price", { ascending: true })
      .limit(5)
      .then(async ({ data }) => {
        if (!data || data.length === 0) { setSuggested(null); return; }
        const enriched = await enrichWithProviders(data as any);
        // Prefer local match
        const local = userLocation
          ? enriched.find(s => s.location_name?.toLowerCase().includes(userLocation.toLowerCase()))
          : null;
        setSuggested(local || enriched[0]);
      });
  }, [searchHint, userLocation]);

  const loadServices = async (q: string, loc: string) => {
    setLoading(true);
    let query = supabase
      .from("marketplace_services")
      .select("id, title, price, price_unit, category, location_name, phone, provider_id, is_active")
      .eq("is_active", true);

    if (q.trim()) query = query.ilike("title", `%${q.trim()}%`);
    if (loc.trim()) query = query.ilike("location_name", `%${loc.trim()}%`);

    const { data } = await query.order("price", { ascending: true }).limit(30);
    const enriched = await enrichWithProviders((data || []) as any);

    // Sort: local first, then price
    enriched.sort((a, b) => {
      if (userLocation) {
        const aLocal = a.location_name?.toLowerCase().includes(userLocation.toLowerCase()) ? 0 : 1;
        const bLocal = b.location_name?.toLowerCase().includes(userLocation.toLowerCase()) ? 0 : 1;
        if (aLocal !== bLocal) return aLocal - bLocal;
      }
      return a.price - b.price;
    });
    setServices(enriched);
    setLoading(false);
  };

  const handleOpen = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) loadServices(search, locationFilter);
  };

  const selectPrice = (price: number) => { onChange(String(price)); setOpen(false); };

  return (
    <div className="space-y-1">
      <div className="flex gap-1">
        <Input
          type="number"
          step="any"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1"
        />
        <Popover open={open} onOpenChange={handleOpen}>
          <PopoverTrigger asChild>
            <Button type="button" variant="outline" size="icon" className="shrink-0" title="Importer un prix réel du marketplace">
              <ShoppingCart className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-2" align="end">
            <div className="space-y-2 mb-2">
              <div className="flex items-center gap-1">
                <Search className="h-4 w-4 text-muted-foreground shrink-0" />
                <Input
                  placeholder="Produit/service..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); loadServices(e.target.value, locationFilter); }}
                  className="h-8 text-sm"
                />
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                <Input
                  placeholder={userLocation ? `Localité (défaut: ${userLocation})` : "Localité..."}
                  value={locationFilter}
                  onChange={(e) => { setLocationFilter(e.target.value); loadServices(search, e.target.value); }}
                  className="h-8 text-sm"
                />
              </div>
            </div>
            <ScrollArea className="max-h-64">
              {loading ? (
                <div className="flex items-center justify-center py-4"><Loader2 className="h-4 w-4 animate-spin" /></div>
              ) : services.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">Aucune offre trouvée</p>
              ) : (
                <div className="space-y-1">
                  {services.map((s) => {
                    const isLocal = userLocation && s.location_name?.toLowerCase().includes(userLocation.toLowerCase());
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => selectPrice(s.price)}
                        className="w-full text-left p-2 rounded-md hover:bg-muted transition-colors border border-transparent hover:border-border"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-medium truncate flex-1">{s.title}</p>
                          <span className="text-sm font-bold text-primary shrink-0">
                            {s.price.toLocaleString()} {unit}/{s.price_unit}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-1 mt-1 text-xs text-muted-foreground">
                          <Badge variant="secondary" className="text-[10px] px-1 py-0">{s.category}</Badge>
                          {s.location_name && (
                            <span className="flex items-center gap-0.5">
                              <MapPin className="h-3 w-3" />{s.location_name}
                              {isLocal && <CheckCircle2 className="h-3 w-3 text-success" />}
                            </span>
                          )}
                          {s.provider_name && (
                            <span className="flex items-center gap-0.5 truncate max-w-[120px]">
                              <User className="h-3 w-3" />{s.provider_name}
                            </span>
                          )}
                          <span className="flex items-center gap-0.5 text-success">
                            <CheckCircle2 className="h-3 w-3" />Dispo
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </PopoverContent>
        </Popover>
      </div>
      {suggested && !value && (
        <button
          type="button"
          onClick={() => selectPrice(suggested.price)}
          className="text-xs text-primary hover:underline flex items-center gap-1 text-left"
        >
          <ShoppingCart className="h-3 w-3 shrink-0" />
          <span className="truncate">
            Prix réel : {suggested.price.toLocaleString()} {unit}/{suggested.price_unit}
            {suggested.location_name && ` · ${suggested.location_name}`}
            {suggested.provider_name && ` · ${suggested.provider_name}`}
          </span>
        </button>
      )}
    </div>
  );
};

export default MarketplacePricePicker;
