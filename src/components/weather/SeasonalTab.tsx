import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSeasonalData } from "@/lib/weather";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Droplets, Thermometer, CloudRain, Calendar } from "lucide-react";

const STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana",
  "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu",
  "Lakshadweep", "Delhi", "Puducherry", "Ladakh", "Jammu and Kashmir"
];

const STATE_LATS: Record<string, number> = {
  "Andhra Pradesh": 15.9129, "Arunachal Pradesh": 28.2180, "Assam": 26.2006,
  "Bihar": 25.0961, "Chhattisgarh": 21.2787, "Goa": 15.2993, "Gujarat": 22.2587,
  "Haryana": 29.0588, "Himachal Pradesh": 31.1048, "Jharkhand": 23.6102,
  "Karnataka": 15.3173, "Kerala": 10.8505, "Madhya Pradesh": 22.9734,
  "Maharashtra": 19.7515, "Manipur": 24.6637, "Meghalaya": 25.4670, "Mizoram": 23.1645,
  "Nagaland": 26.1584, "Odisha": 20.9517, "Punjab": 31.1471, "Rajasthan": 27.0238,
  "Sikkim": 27.5330, "Tamil Nadu": 11.1271, "Telangana": 17.1231, "Tripura": 23.9408,
  "Uttar Pradesh": 26.8467, "Uttarakhand": 30.0668, "West Bengal": 22.9868,
  "Andaman and Nicobar Islands": 11.7401, "Chandigarh": 30.7333,
  "Dadra and Nagar Haveli and Daman and Diu": 20.1809, "Lakshadweep": 10.5667,
  "Delhi": 28.6139, "Puducherry": 11.9416, "Ladakh": 34.1526, "Jammu and Kashmir": 33.7782
};

const SEASON_COLORS: Record<string, { bg: string; accent: string; text: string }> = {
  "Summer": { bg: "from-orange-500/20 to-yellow-500/10", accent: "border-orange-500/20", text: "text-orange-400" },
  "Monsoon": { bg: "from-blue-500/20 to-indigo-500/10", accent: "border-blue-500/20", text: "text-blue-400" },
  "Autumn / Spring": { bg: "from-amber-500/20 to-green-500/10", accent: "border-amber-500/20", text: "text-amber-400" },
  "Winter": { bg: "from-cyan-500/20 to-blue-500/10", accent: "border-cyan-500/20", text: "text-cyan-400" },
};

export default function SeasonalTab({
  currentCity,
  currentLat
}: {
  currentCity: string;
  currentLat: number;
}) {
  const [selectedState, setSelectedState] = useState<string>("");

  const seasonalData = useMemo(() => {
    const latToUse = selectedState && STATE_LATS[selectedState] ? STATE_LATS[selectedState] : currentLat;
    const placeName = selectedState || currentCity;
    return getSeasonalData(placeName, latToUse);
  }, [currentCity, currentLat, selectedState]);

  const displayName = selectedState || currentCity;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold">Seasonal Climate Patterns</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Historical climate averages for <span className="font-semibold text-foreground">{displayName}</span>
          </p>
        </div>

        <div className="w-full sm:w-72">
          <Select value={selectedState} onValueChange={(v) => setSelectedState(v === "none" ? "" : v)}>
            <SelectTrigger data-testid="select-state">
              <SelectValue placeholder="Select a State to compare..." />
            </SelectTrigger>
<SelectContent 
  className="z-[9999] max-h-[300px]" // 1. Added max-height
  position="popper"                 // 2. Added position popper
  sideOffset={5}                    // 3. Optional: adds a small gap
>
  <SelectItem value="none">-- Use Current City ({currentCity}) --</SelectItem>
  
  {/* Wrap the mapping in a div to ensure the scroll area is contained */}
  <div className="overflow-y-auto"> 
    {STATES.map(state => (
      <SelectItem key={state} value={state}>{state}</SelectItem>
    ))}
  </div>
</SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {seasonalData.map((season, idx) => {
          const colors = SEASON_COLORS[season.season] || SEASON_COLORS["Summer"];
          return (
            <Card key={idx} className={`overflow-hidden border ${colors.accent}`}>
              <div className={`h-1.5 w-full bg-gradient-to-r ${colors.bg}`} />
              <CardHeader className="pb-3 pt-5">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2.5 text-xl">
                      <span className="text-2xl">{season.emoji}</span>
                      <span>{season.season}</span>
                    </CardTitle>
                    <p className="text-sm font-medium text-muted-foreground mt-1 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      {season.months}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-background/60 rounded-lg p-3 flex flex-col items-center text-center border border-border/60">
                    <Thermometer className="w-4 h-4 text-orange-400 mb-1.5" />
                    <span className="text-xs text-muted-foreground">Temp</span>
                    <span className="font-bold text-sm mt-0.5">{season.tempRange}</span>
                  </div>
                  <div className="bg-background/60 rounded-lg p-3 flex flex-col items-center text-center border border-border/60">
                    <CloudRain className="w-4 h-4 text-blue-400 mb-1.5" />
                    <span className="text-xs text-muted-foreground">Rain</span>
                    <span className="font-bold text-sm mt-0.5">{season.rainChance}%</span>
                  </div>
                  <div className="bg-background/60 rounded-lg p-3 flex flex-col items-center text-center border border-border/60">
                    <Droplets className="w-4 h-4 text-cyan-400 mb-1.5" />
                    <span className="text-xs text-muted-foreground">Humidity</span>
                    <span className="font-bold text-sm mt-0.5">{season.humidity}%</span>
                  </div>
                </div>

                <div className={`bg-gradient-to-r ${colors.bg} rounded-lg p-4 border ${colors.accent}`}>
                  <p className="text-sm leading-relaxed">{season.description}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
