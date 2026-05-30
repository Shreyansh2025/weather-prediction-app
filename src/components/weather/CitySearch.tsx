import { useState, useEffect, useRef } from "react";
import { Search, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { searchCities, CityResult } from "@/lib/weather";

export default function CitySearch({
  onSelectLocation
}: {
  onSelectLocation: (name: string, lat: number, lon: number) => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CityResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.length >= 3) {
        setLoading(true);
        try {
          const cities = await searchCities(query);
          setResults(cities);
          setShowDropdown(true);
        } catch (e) {
          console.error(e);
        } finally {
          setLoading(false);
        }
      } else {
        setResults([]);
        setShowDropdown(false);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [query]);

  const handleMyLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          onSelectLocation("My Location", position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.error("Error getting location", error);
          alert("Could not get your location. Please check permissions.");
        }
      );
    }
  };

  return (
    <div className="flex gap-4 mb-6 relative z-[9999]" ref={wrapperRef}>
      <div className="relative flex-1">
        <div className="relative w-full">
          {/* The icon now centers itself strictly within this inner wrapper */}
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
          
          <Input 
            placeholder="Search any city in India..." 
            className="pl-10 w-full h-12 text-lg bg-card border-border"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => { if (results.length > 0) setShowDropdown(true); }}
          />
        </div>
        
        {showDropdown && results.length > 0 && (
          <div className=" absolute top-full left-0 right-0 mt-2 bg-popover border border-border rounded-lg shadow-lg overflow-y-auto flex flex-col max-h-60 z-[9999]">
            {results.map((result, i) => (
              <button
                key={i}
                className="text-left px-4 py-3 hover:bg-muted transition-colors border-b border-border/50 last:border-0"
                onClick={() => {
                  onSelectLocation(result.name, result.lat, result.lon);
                  setShowDropdown(false);
                  setQuery("");
                }}
              >
                <div className="font-medium text-foreground">{result.name}</div>
                <div className="text-xs text-muted-foreground">{result.state ? `${result.state}, ` : ""}{result.country}</div>
              </button>
            ))}
          </div>
        )}
      </div>
      
      <Button 
        variant="secondary" 
        className="h-12 px-6 font-medium text-base gap-2"
        onClick={handleMyLocation}
      >
        <MapPin className="h-5 w-5 text-primary" />
        My Location
      </Button>
    </div>
  );
}
