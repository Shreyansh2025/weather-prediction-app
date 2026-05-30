import { useEffect, useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Globe, MapPin, Loader2 } from "lucide-react";
import { CITIES } from "./CityPills";
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from "react-leaflet";
import L from 'leaflet';
import { reverseGeocode } from "@/lib/weather";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
});

function tempColor(temp: number): string {
  if (temp < 20) return "#22c55e";
  if (temp < 30) return "#eab308";
  if (temp <= 38) return "#f97316";
  return "#ef4444";
}

function createTempMarker(temp: number) {
  const color = tempColor(temp);
  const textColor = temp >= 20 && temp < 30 ? "#000" : "#fff";
  return L.divIcon({
    className: '',
    html: `<div style="background:${color};width:34px;height:34px;display:flex;align-items:center;justify-content:center;border-radius:50%;border:2px solid rgba(255,255,255,0.8);color:${textColor};font-size:10px;font-weight:700;box-shadow:0 2px 8px rgba(0,0,0,0.5);">${temp}°</div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 17]
  });
}

function createPulseMarker() {
  return L.divIcon({
    className: '',
    html: `<div style="position:relative;width:20px;height:20px;">
      <div style="position:absolute;inset:0;background:#3b82f6;border-radius:50%;border:3px solid white;box-shadow:0 0 12px #3b82f6;"></div>
      <div style="position:absolute;inset:-6px;background:#3b82f680;border-radius:50%;animation:ping 1.5s cubic-bezier(0,0,0.2,1) infinite;"></div>
    </div>
    <style>@keyframes ping{75%,100%{transform:scale(2);opacity:0}}</style>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  });
}

function MapUpdater({ mode }: { mode: 'india' | 'world' }) {
  const map = useMap();
  useEffect(() => {
    if (mode === 'india') {
      map.flyTo([22, 82], 5, { duration: 0.8 });
    } else {
      map.flyTo([20, 15], 2, { duration: 0.8 });
    }
  }, [mode, map]);
  return null;
}

function MapClickHandler({
  onMapClick,
  enabled
}: {
  onMapClick: (lat: number, lng: number) => void;
  enabled: boolean;
}) {
  useMapEvents({
    click(e) {
      if (enabled) {
        onMapClick(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
}

export default function WeatherMap({
  currentCity,
  onSelectLocation
}: {
  currentCity: { name: string; lat: number; lon: number };
  onSelectLocation: (name: string, lat: number, lon: number) => void;
}) {
  const [mapMode, setMapMode] = useState<'india' | 'world'>('india');
  const [isClient, setIsClient] = useState(false);
  const [clickLoading, setClickLoading] = useState(false);
  const [clickedPoint, setClickedPoint] = useState<{ lat: number; lon: number } | null>(null);

  // Fetch real temps for city markers
  const [cityTemps, setCityTemps] = useState<Record<string, number>>({});
  const [tempsLoaded, setTempsLoaded] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    async function loadTemps() {
      const results: Record<string, number> = {};
      // Fetch all 20 cities in batches of 5 to avoid rate limiting
      const batchSize = 5;
      for (let i = 0; i < CITIES.length; i += batchSize) {
        const batch = CITIES.slice(i, i + batchSize);
        await Promise.all(
          batch.map(async (city) => {
            try {
              const url = `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current_weather=true&timezone=auto`;
              const res = await fetch(url);
              if (res.ok) {
                const data = await res.json();
                results[city.name] = Math.round(data.current_weather?.temperature ?? 25);
              }
            } catch {
              results[city.name] = Math.round(25 - (city.lat - 20) * 0.4);
            }
          })
        );
        if (i + batchSize < CITIES.length) {
          await new Promise(r => setTimeout(r, 200));
        }
      }
      setCityTemps(results);
      setTempsLoaded(true);
    }
    loadTemps();
  }, []);

  const handleMapClick = useCallback(async (lat: number, lng: number) => {
    setClickLoading(true);
    setClickedPoint({ lat, lon: lng });
    try {
      const name = await reverseGeocode(lat, lng);
      onSelectLocation(name, lat, lng);
    } finally {
      setClickLoading(false);
    }
  }, [onSelectLocation]);

  if (!isClient) {
    return (
      <div className="h-[520px] bg-muted/20 rounded-xl flex items-center justify-center border border-border">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <Card className="border-border overflow-hidden flex flex-col" style={{ height: 560 }}>
      <div className="p-4 bg-card border-b border-border flex flex-wrap justify-between items-center gap-3 z-10">
        <div className="flex items-center gap-3">
          <Globe className="w-5 h-5 text-primary" />
          <div>
            <h3 className="font-bold text-base leading-tight">Meteorological Map</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {mapMode === 'india'
                ? 'Click any city marker to view its weather'
                : 'Click anywhere on the map to load weather for that location'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {clickLoading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading weather...
            </div>
          )}
          <div className="flex bg-muted p-1 rounded-lg gap-1">
            <Button
              variant={mapMode === 'india' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setMapMode('india')}
              data-testid="btn-india-map"
            >
              <MapPin className="w-3.5 h-3.5 mr-1.5" />
              India
            </Button>
            <Button
              variant={mapMode === 'world' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setMapMode('world')}
              data-testid="btn-world-map"
            >
              <Globe className="w-3.5 h-3.5 mr-1.5" />
              World
            </Button>
          </div>
        </div>
      </div>

      <CardContent className="p-0 flex-1 relative">
        <MapContainer
          center={[22, 82]}
          zoom={5}
          className="w-full h-full"
          style={{ background: '#0f172a' }}
          zoomControl={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://carto.com">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
          <MapUpdater mode={mapMode} />
          <MapClickHandler
            onMapClick={handleMapClick}
            enabled={mapMode === 'world'}
          />

          {/* City markers — always show on India mode, optionally on world */}
          {mapMode === 'india' && CITIES.map(city => {
            const temp = cityTemps[city.name] ?? null;
            return (
              <Marker
                key={city.name}
                position={[city.lat, city.lon]}
                icon={temp !== null ? createTempMarker(temp) : L.divIcon({
                  className: '',
                  html: `<div style="background:#475569;width:28px;height:28px;display:flex;align-items:center;justify-content:center;border-radius:50%;border:2px solid rgba(255,255,255,0.5);color:#fff;font-size:9px;font-weight:600;">...</div>`,
                  iconSize: [28, 28], iconAnchor: [14, 14]
                })}
                eventHandlers={{ click: () => onSelectLocation(city.name, city.lat, city.lon) }}
              >
                <Popup className="dark-popup" closeButton={false}>
                  <div className="text-center p-1">
                    <div className="font-bold text-sm">{city.name}</div>
                    {temp !== null && (
                      <div className="text-lg font-bold mt-0.5" style={{ color: tempColor(temp) }}>
                        {temp}°C
                      </div>
                    )}
                    {!tempsLoaded && <div className="text-xs text-gray-400">Loading...</div>}
                  </div>
                </Popup>
              </Marker>
            );
          })}

          {/* Current selected city marker (pulse) */}
          {currentCity.lat !== 0 && currentCity.lon !== 0 && !CITIES.find(c => c.name === currentCity.name) && (
            <Marker
              position={[currentCity.lat, currentCity.lon]}
              icon={createPulseMarker()}
            >
              <Popup closeButton={false}>
                <div className="text-center text-sm font-bold p-1">{currentCity.name}</div>
              </Popup>
            </Marker>
          )}

          {/* Show clicked point on world map */}
          {mapMode === 'world' && clickedPoint && !CITIES.find(c => c.name === currentCity.name) && (
            <Marker
              position={[clickedPoint.lat, clickedPoint.lon]}
              icon={createPulseMarker()}
            >
              <Popup closeButton={false}>
                <div className="text-sm font-bold text-center p-1">{currentCity.name}</div>
              </Popup>
            </Marker>
          )}
        </MapContainer>

        {/* Temperature legend */}
        <div className="absolute bottom-5 left-4 z-[1000] bg-card/90 backdrop-blur-md p-3 rounded-lg border border-border shadow-lg">
          <p className="text-[10px] font-bold uppercase tracking-wider mb-2 text-muted-foreground">Temperature</p>
          {[
            { color: "#22c55e", label: "< 20°C" },
            { color: "#eab308", label: "20–30°C" },
            { color: "#f97316", label: "30–38°C" },
            { color: "#ef4444", label: "> 38°C" },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-2 mb-1 last:mb-0">
              <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: item.color }} />
              <span className="text-xs">{item.label}</span>
            </div>
          ))}
        </div>

        {/* Loading overlay while fetching city temps */}
        {!tempsLoaded && mapMode === 'india' && (
          <div className="absolute top-3 right-3 z-[1000] bg-card/90 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-border text-xs flex items-center gap-2 text-muted-foreground">
            <Loader2 className="w-3 h-3 animate-spin" />
            Fetching live temperatures...
          </div>
        )}
      </CardContent>
    </Card>
  );
}
