import { useState } from "react";
import { format, parseISO } from "date-fns";
import { CloudRain } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { WeatherData, getWeatherIcon, getWeatherLabel } from "@/lib/weather";
import { Badge } from "@/components/ui/badge";

export default function ForecastTab({ 
  city, 
  data 
}: { 
  city: string; 
  data: WeatherData 
}) {
  const [selectedDayIdx, setSelectedDayIdx] = useState(0);

  const getRiskLabel = (prob: number) => {
    if (prob < 30) return { label: "Low", color: "bg-emerald-500/20 text-emerald-500" };
    if (prob <= 60) return { label: "Moderate", color: "bg-yellow-500/20 text-yellow-500" };
    return { label: "High", color: "bg-red-500/20 text-red-500" };
  };

  const getDotColor = (prob: number) => {
    if (prob < 30) return "bg-emerald-500";
    if (prob <= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  // Skip the first day if we want exactly 7 future days, or just take first 7
  const forecastDays = data.daily.time.slice(0, 7);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold">7-Day Forecast</h3>
        <p className="text-sm text-muted-foreground italic bg-muted/50 px-4 py-1.5 rounded-full">
          7-Day typical weather pattern for {city} — historical monthly averages from dataset, not live forecast
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {forecastDays.map((dateStr, idx) => {
          const date = parseISO(dateStr);
          const maxTemp = Math.round(data.daily.tempMax[idx]);
          const minTemp = Math.round(data.daily.tempMin[idx]);
          const condition = data.daily.conditionCode[idx];
          const rainProb = data.daily.precipProb[idx] || 0;
          
          return (
            <Card 
              key={dateStr}
              className={`cursor-pointer transition-all hover-elevate ${selectedDayIdx === idx ? 'ring-2 ring-primary bg-primary/5' : 'hover:bg-muted/50'}`}
              onClick={() => setSelectedDayIdx(idx)}
            >
              <CardContent className="p-4 flex flex-col items-center text-center space-y-3">
                <div className="w-full flex justify-between items-center mb-1">
                  <div className={`w-2 h-2 rounded-full ${getDotColor(rainProb)}`} />
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {format(date, 'EEE')}
                  </span>
                </div>
                
                <span className="text-sm font-medium">
                  {format(date, 'dd MMM')}
                </span>
                
                <div className="text-3xl my-2">{getWeatherIcon(condition)}</div>
                
                <div className="flex flex-col items-center">
                  <span className="text-xl font-bold">{maxTemp}°C</span>
                  <span className="text-xs text-muted-foreground">{minTemp}°C</span>
                </div>
                
                <div className="flex items-center gap-1.5 text-xs font-medium text-blue-400 mt-2 bg-blue-500/10 px-2 py-1 rounded-md w-full justify-center">
                  <CloudRain className="w-3 h-3" />
                  {rainProb}%
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="px-6 py-4 border-b border-border bg-muted/30">
          <h4 className="font-semibold">Daily Breakdown</h4>
        </div>
        <div className="divide-y divide-border">
          {forecastDays.map((dateStr, idx) => {
            const date = parseISO(dateStr);
            const maxTemp = Math.round(data.daily.tempMax[idx]);
            const condition = data.daily.conditionCode[idx];
            const rainProb = data.daily.precipProb[idx] || 0;
            const risk = getRiskLabel(rainProb);
            
            return (
              <div 
                key={`list-${dateStr}`} 
                className={`flex items-center justify-between p-4 transition-colors ${selectedDayIdx === idx ? 'bg-primary/5' : 'hover:bg-muted/30'}`}
                onClick={() => setSelectedDayIdx(idx)}
              >
                <div className="flex items-center gap-4 md:w-1/4">
                  <span className="font-medium min-w-[40px]">{format(date, 'EEE')}</span>
                  <span className="text-muted-foreground text-sm">{format(date, 'dd MMM')}</span>
                </div>
                
                <div className="flex items-center gap-6 flex-1">
                  <span className="text-lg font-bold w-12">{maxTemp}°C</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{getWeatherIcon(condition)}</span>
                    <span className="text-sm font-medium hidden md:inline-block">{getWeatherLabel(condition)}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 justify-end md:w-1/3">
                  <div className="flex items-center gap-1.5 text-sm font-medium">
                    <CloudRain className="w-4 h-4 text-blue-400" />
                    {rainProb}% <span className="hidden md:inline">rain</span>
                  </div>
                  <Badge variant="outline" className={`w-20 justify-center border-transparent ${risk.color}`}>
                    {risk.label}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
