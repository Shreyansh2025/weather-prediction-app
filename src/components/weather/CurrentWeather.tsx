import { Droplets, Wind, CloudRain, Thermometer, Sun, Navigation } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { getWeatherLabel, getWeatherIcon, getWindDirection, getUVLabel, WeatherData } from "@/lib/weather";

export default function CurrentWeather({
  city,
  data
}: {
  city: { name: string; country?: string };
  data: WeatherData
}) {
  const { current } = data;
  const windDir = getWindDirection(current.windDirection);
  const uvInfo = getUVLabel(current.uvIndex);

  return (
    <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
      <div className="flex flex-col md:flex-row gap-6 items-start justify-between p-6">
        <div className="flex flex-col">
          <h2 className="text-4xl font-bold tracking-tight mb-1">
            {city.name}
            {city.country && <span className="text-2xl text-muted-foreground ml-2 font-normal">{city.country}</span>}
          </h2>
          <div className="flex items-center gap-4 mt-4">
            <span className="text-7xl font-bold tracking-tighter">
              {Math.round(current.temp)}°C
            </span>
            <div className="flex flex-col">
              <span className="text-5xl">{getWeatherIcon(current.conditionCode)}</span>
              <span className="text-lg font-medium text-muted-foreground mt-1">
                {getWeatherLabel(current.conditionCode)}
              </span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Feels like <span className="font-semibold text-foreground">{Math.round(current.feelsLike)}°C</span>
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 w-full md:w-auto md:min-w-[360px]">
          <Card className="bg-background/50 border-border">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2.5 bg-primary/10 rounded-full text-primary">
                <Droplets className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">Humidity</p>
                <p className="text-xl font-bold">{Math.round(current.humidity)}%</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-background/50 border-border">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2.5 bg-primary/10 rounded-full text-primary">
                <Wind className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">Wind</p>
                <p className="text-xl font-bold">{Math.round(current.windSpeed)} <span className="text-sm font-normal">km/h</span></p>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                  <Navigation className="w-3 h-3" style={{ transform: `rotate(${current.windDirection}deg)` }} />
                  {windDir}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-background/50 border-border">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2.5 bg-primary/10 rounded-full text-primary">
                <CloudRain className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">Precipitation</p>
                <p className="text-xl font-bold">{data.daily.precipProb[0] || 0}%</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-background/50 border-border">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2.5 bg-primary/10 rounded-full text-primary">
                <Thermometer className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">High / Low</p>
                <p className="text-xl font-bold">
                  {Math.round(data.daily.tempMax[0])}° / {Math.round(data.daily.tempMin[0])}°
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-background/50 border-border col-span-2">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2.5 bg-yellow-500/10 rounded-full text-yellow-400">
                <Sun className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground font-medium">UV Index</p>
                <div className="flex items-center gap-3 mt-0.5">
                  <p className="text-xl font-bold">{current.uvIndex}</p>
                  <span className={`text-sm font-semibold ${uvInfo.color}`}>{uvInfo.label}</span>
                  <div className="flex-1 bg-muted rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-green-400 via-yellow-400 via-orange-400 to-red-500"
                      style={{ width: `${Math.min(100, (current.uvIndex / 12) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
