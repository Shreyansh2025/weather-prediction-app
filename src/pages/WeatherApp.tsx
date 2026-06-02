import { useState, useEffect } from "react";
import Header from "@/components/weather/Header";
import CityPills, { CITIES } from "@/components/weather/CityPills";
import CitySearch from "@/components/weather/CitySearch";
import CurrentWeather from "@/components/weather/CurrentWeather";
import AlertBanners from "@/components/weather/AlertBanners";
import ForecastTab from "@/components/weather/ForecastTab";
import SeasonalTab from "@/components/weather/SeasonalTab";
import ManualTab from "@/components/weather/ManualTab";
import WeatherMap from "@/components/weather/WeatherMap";
import { fetchWeather, WeatherData } from "@/lib/weather";
import { Skeleton } from "@/components/ui/skeleton";

type Tab = 'predict' | 'manual' | 'forecast' | 'seasonal' | 'map';

export default function WeatherApp() {
  const [selectedCity, setSelectedCity] = useState({ name: CITIES[0].name, lat: CITIES[0].lat, lon: CITIES[0].lon });
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('predict');
  const [currentTime, setCurrentTime] = useState(new Date());

  // Clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch Weather
  useEffect(() => {
    const loadWeather = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchWeather(selectedCity.lat, selectedCity.lon);
        setWeatherData(data);
      } catch (err: any) {
        setError(err.message || "Failed to load weather data.");
      } finally {
        setLoading(false);
      }
    };
    loadWeather();
  }, [selectedCity]);

  const handleSelectLocation = (name: string, lat: number, lon: number) => {
    setSelectedCity({ name, lat, lon });
    
    // Only redirect to 'predict' if the user is on the 'manual' tab (since manual has no city data).
    // If they are on the 'map' tab, let them stay on the map!
    if (activeTab === 'manual') {
      setActiveTab('predict');
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header currentTime={currentTime} />
      
      {/* Navigation Tabs */}
      <div className="border-b border-border bg-card overflow-x-auto">
        <div className="container mx-auto px-6 flex items-center gap-8 min-w-max">
          {[
            { id: 'predict', label: '🌤️ City Predict' },
            { id: 'manual', label: '⚙️ Manual' },
            { id: 'forecast', label: '📅 7-Day Forecast' },
            { id: 'seasonal', label: '🍂 Seasonal' },
            { id: 'map', label: '🗺️ Map' }
          ].map(tab => (
            <button
              key={tab.id}
              className={`py-4 px-1 border-b-2 font-medium transition-colors ${
                activeTab === tab.id 
                  ? 'border-primary text-primary' 
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => setActiveTab(tab.id as Tab)}
              data-testid={`tab-${tab.id}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 container mx-auto px-6 py-8">
        
        {activeTab !== 'manual' && (
          <div className="mb-8 relative z-[9999]">
            <CityPills selectedCityName={selectedCity.name} onSelectCity={setSelectedCity} />
            <CitySearch onSelectLocation={handleSelectLocation} />
          </div>
        )}

        {/* Tab Content */}
        {loading && activeTab !== 'manual' && activeTab !== 'map' ? (
          <div className="space-y-4">
            <Skeleton className="h-[200px] w-full rounded-xl" />
            <Skeleton className="h-[100px] w-full rounded-xl" />
          </div>
        ) : error && activeTab !== 'manual' && activeTab !== 'map' ? (
          <div className="p-8 bg-destructive/10 text-destructive rounded-xl border border-destructive/20 text-center">
            <p className="font-bold text-lg mb-2">Error Loading Weather Data</p>
            <p>{error}</p>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {activeTab === 'predict' && weatherData && (
              <>
                <AlertBanners alerts={weatherData.alerts} />
                <CurrentWeather city={selectedCity} data={weatherData} />
              </>
            )}
            
            {activeTab === 'forecast' && weatherData && (
              <ForecastTab city={selectedCity.name} data={weatherData} />
            )}
            
            {activeTab === 'seasonal' && (
              <SeasonalTab currentCity={selectedCity.name} currentLat={selectedCity.lat} />
            )}
            
            {activeTab === 'manual' && (
              <ManualTab />
            )}
            
            {activeTab === 'map' && (
              <div className="space-y-6">
                <WeatherMap currentCity={selectedCity} onSelectLocation={handleSelectLocation} />
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}