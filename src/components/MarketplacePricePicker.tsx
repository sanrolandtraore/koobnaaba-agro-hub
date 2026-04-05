import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ShoppingCart, Search, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface MarketplacePricePickerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  /** Optional search hint to pre-filter marketplace results */
  searchHint?: string;
  /** Field type for display */
  unit?: string;
}

interface MarketplaceService {
  id: string;
  title: string;
  price: number;
  price_unit: string;
  category: string;
  location_name: string | null;
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
  const [suggested, setSuggested] = useState<MarketplaceService | null>(null);

  // Auto-suggest: check marketplace when searchHint changes
  useEffect(() => {
    if (!searchHint) return;
    setSearch(searchHint);
    supabase
      .from("marketplace_services")
      .select("id, title, price, price_unit, category, location_name")
      .eq("is_active", true)
      .ilike("title", `%${searchHint}%`)
      .limit(1)
      .then(({ data }) => {
        if (data && data.length > 0) setSuggested(data[0]);
        else setSuggested(null);
      });
  }, [searchHint]);

  const loadServices = async (q: string) => {
    setLoading(true);
    const query = supabase
      .from("marketplace_services")
      .select("id, title, price, price_unit, category, location_name")
      .eq("is_active", true)
      .order("title");

    if (q.trim()) {
      query.ilike("title", `%${q.trim()}%`);
    }

    const { data } = await query.limit(20);
    setServices(data || []);
    setLoading(false);
  };

  const handleOpen = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) loadServices(search);
  };

  const selectPrice = (price: number) => {
    onChange(String(price));
    setOpen(false);
  };

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
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="shrink-0"
              title="Importer un prix du marketplace"
            >
              <ShoppingCart className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-72 p-2" align="end">
            <div className="flex items-center gap-1 mb-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher sur le marketplace..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  loadServices(e.target.value);
                }}
                className="h-8 text-sm"
              />
            </div>
            <ScrollArea className="max-h-48">
              {loading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              ) : services.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Aucun service trouvé
                </p>
              ) : (
                <div className="space-y-1">
                  {services.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => selectPrice(s.price)}
                      className="w-full text-left p-2 rounded-md hover:bg-muted transition-colors"
                    >
                      <p className="text-sm font-medium truncate">{s.title}</p>
                      <div className="flex items-center justify-between mt-0.5">
                        <Badge variant="secondary" className="text-xs">
                          {s.category}
                        </Badge>
                        <span className="text-sm font-bold text-primary">
                          {s.price.toLocaleString()} {unit}/{s.price_unit}
                        </span>
                      </div>
                    </button>
                  ))}
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
          className="text-xs text-primary hover:underline flex items-center gap-1"
        >
          <ShoppingCart className="h-3 w-3" />
          Prix marketplace : {suggested.price.toLocaleString()} {unit}/{suggested.price_unit} ({suggested.title})
        </button>
      )}
    </div>
  );
};

export default MarketplacePricePicker;
