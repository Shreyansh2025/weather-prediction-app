import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Cpu, Activity, Thermometer, Droplets, Wind, CloudRain, Gauge } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface PredictionResult {
  prediction: string;
  description: string;
  confidence: number;
  color: string;
  bgColor: string;
  icon: string;
}

function runPrediction(
  temp: number,
  humidity: number,
  wind: number,
  precip: number,
  pressure: number
): PredictionResult {
  let prediction = "Pleasant Day";
  let description = "Comfortable conditions expected. Light clothing recommended.";
  let color = "text-emerald-400";
  let bgColor = "bg-emerald-500/10 border-emerald-500/20";
  let icon = "🌤️";
  let confidence = 82;

  if (temp > 40) {
    prediction = "Extreme Heat";
    description = "Dangerous heat levels. Avoid all outdoor activities. Stay hydrated and in shade.";
    color = "text-red-500"; bgColor = "bg-red-500/10 border-red-500/20"; icon = "🌡️"; confidence = 94;
  } else if (temp > 35 && humidity > 60) {
    prediction = "Hot & Humid";
    description = "Oppressive heat-humidity combination. Risk of heat exhaustion. Limit outdoor exposure.";
    color = "text-orange-500"; bgColor = "bg-orange-500/10 border-orange-500/20"; icon = "🥵"; confidence = 89;
  } else if (temp > 35) {
    prediction = "Hot & Dry";
    description = "Very hot, dry conditions. Stay hydrated, apply sunscreen, avoid midday sun.";
    color = "text-orange-400"; bgColor = "bg-orange-500/10 border-orange-500/20"; icon = "☀️"; confidence = 87;
  } else if (precip > 20 || (precip > 10 && wind > 40)) {
    prediction = "Heavy Rain / Storm";
    description = "Severe weather expected. Avoid travel, stay indoors, watch for flooding.";
    color = "text-indigo-400"; bgColor = "bg-indigo-500/10 border-indigo-500/20"; icon = "⛈️"; confidence = 91;
  } else if (precip > 5 && pressure < 1000) {
    prediction = "Rainy Day";
    description = "Expect moderate to heavy rainfall. Carry umbrella, avoid low-lying areas.";
    color = "text-blue-400"; bgColor = "bg-blue-500/10 border-blue-500/20"; icon = "🌧️"; confidence = 85;
  } else if (precip > 1 && humidity > 70) {
    prediction = "Light Rain / Drizzle";
    description = "Light showers likely. A light waterproof jacket is recommended.";
    color = "text-sky-400"; bgColor = "bg-sky-500/10 border-sky-500/20"; icon = "🌦️"; confidence = 78;
  } else if (wind > 50) {
    prediction = "Strong Winds";
    description = "Dangerous wind speeds. Secure loose objects. Avoid trees and unstable structures.";
    color = "text-yellow-400"; bgColor = "bg-yellow-500/10 border-yellow-500/20"; icon = "💨"; confidence = 88;
  } else if (wind > 30) {
    prediction = "Windy Conditions";
    description = "Noticeably windy. Hold on to lightweight items outdoors.";
    color = "text-amber-400"; bgColor = "bg-amber-500/10 border-amber-500/20"; icon = "🌬️"; confidence = 80;
  } else if (humidity > 90 && temp < 20) {
    prediction = "Foggy / Misty";
    description = "Dense fog likely. Reduced visibility — drive carefully and use fog lights.";
    color = "text-slate-400"; bgColor = "bg-slate-500/10 border-slate-500/20"; icon = "🌫️"; confidence = 76;
  } else if (temp < 5) {
    prediction = "Cold Day";
    description = "Very cold temperatures. Dress in multiple warm layers, protect extremities.";
    color = "text-cyan-400"; bgColor = "bg-cyan-500/10 border-cyan-500/20"; icon = "🥶"; confidence = 92;
  } else if (temp < 15) {
    prediction = "Cool & Fresh";
    description = "Chilly but comfortable. A light jacket is sufficient.";
    color = "text-teal-400"; bgColor = "bg-teal-500/10 border-teal-500/20"; icon = "🧥"; confidence = 83;
  } else if (humidity < 30 && temp > 28) {
    prediction = "Warm & Dry";
    description = "Low humidity with warm temperatures. Good conditions but stay hydrated.";
    color = "text-lime-400"; bgColor = "bg-lime-500/10 border-lime-500/20"; icon = "🌞"; confidence = 80;
  }

  confidence = Math.min(99, Math.max(55, confidence));
  return { prediction, description, confidence, color, bgColor, icon };
}

export default function ManualTab() {
  const [inputs, setInputs] = useState({
    temp: "", humidity: "", wind: "", precip: "", pressure: ""
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);

  const handlePredict = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      const result = runPrediction(
        parseFloat(inputs.temp) || 25,
        parseFloat(inputs.humidity) || 50,
        parseFloat(inputs.wind) || 10,
        parseFloat(inputs.precip) || 0,
        parseFloat(inputs.pressure) || 1013
      );
      setResult(result);
      setLoading(false);
    }, 1000);
  };

  const handleInputChange = (field: string, value: string) => {
    setInputs(prev => ({ ...prev, [field]: value }));
    if (result) setResult(null);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            Manual Data Entry
          </CardTitle>
          <CardDescription>
            Input meteorological parameters to run inference using the Rule-Based Engine.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePredict} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="temp" className="flex items-center gap-2 text-sm">
                  <Thermometer className="w-4 h-4 text-orange-400" />
                  Temperature (°C)
                </Label>
                <Input
                  id="temp" type="number" step="0.1" required
                  placeholder="e.g. 32.5"
                  value={inputs.temp}
                  onChange={(e) => handleInputChange('temp', e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="humidity" className="flex items-center gap-2 text-sm">
                  <Droplets className="w-4 h-4 text-blue-400" />
                  Humidity (%)
                </Label>
                <Input
                  id="humidity" type="number" min="0" max="100" required
                  placeholder="e.g. 65"
                  value={inputs.humidity}
                  onChange={(e) => handleInputChange('humidity', e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="wind" className="flex items-center gap-2 text-sm">
                  <Wind className="w-4 h-4 text-cyan-400" />
                  Wind Speed (km/h)
                </Label>
                <Input
                  id="wind" type="number" min="0" required
                  placeholder="e.g. 12"
                  value={inputs.wind}
                  onChange={(e) => handleInputChange('wind', e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="precip" className="flex items-center gap-2 text-sm">
                  <CloudRain className="w-4 h-4 text-indigo-400" />
                  Precipitation (mm)
                </Label>
                <Input
                  id="precip" type="number" min="0" step="0.1" required
                  placeholder="e.g. 0"
                  value={inputs.precip}
                  onChange={(e) => handleInputChange('precip', e.target.value)}
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <Label htmlFor="pressure" className="flex items-center gap-2 text-sm">
                  <Gauge className="w-4 h-4 text-purple-400" />
                  Pressure (hPa)
                </Label>
                <Input
                  id="pressure" type="number" min="800" max="1200" required
                  placeholder="e.g. 1012"
                  value={inputs.pressure}
                  onChange={(e) => handleInputChange('pressure', e.target.value)}
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-11 text-base font-medium gap-2"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Running Inference...
                </span>
              ) : (
                <>
                  <Cpu className="w-5 h-5" />
                  Predict Weather
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div>
        {result ? (
          <Card className={`h-full border ${result.bgColor}`}>
            <CardHeader>
              <CardTitle>Inference Result</CardTitle>
              <CardDescription>
                Output generated by the <span className="font-semibold text-foreground">Rule-Based Engine</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center h-[calc(100%-100px)] text-center space-y-6 pb-10">
              <div className={`rounded-full p-8 border ${result.bgColor}`}>
                <span className="text-6xl">{result.icon}</span>
              </div>

              <div className="space-y-1">
                <p className="text-xs uppercase tracking-widest text-muted-foreground font-medium">Prediction</p>
                <p className={`text-3xl font-bold ${result.color}`}>
                  {result.prediction}
                </p>
                <p className="text-sm text-muted-foreground max-w-xs mt-2 leading-relaxed">
                  {result.description}
                </p>
              </div>

              <div className="w-full max-w-xs space-y-2 bg-background/50 p-5 rounded-xl border border-border">
                <div className="flex justify-between items-center text-sm font-medium">
                  <span className="text-muted-foreground">Confidence Score</span>
                  <span className={`font-bold ${result.confidence >= 85 ? 'text-emerald-400' : result.confidence >= 70 ? 'text-yellow-400' : 'text-orange-400'}`}>
                    {result.confidence}%
                  </span>
                </div>
                <Progress value={result.confidence} className="h-2 bg-muted" />
                <p className="text-xs text-muted-foreground text-center">
                  {result.confidence >= 85 ? 'High confidence' : result.confidence >= 70 ? 'Moderate confidence' : 'Low confidence'}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground bg-muted/20 rounded-xl border border-dashed border-border p-10 text-center">
            <Activity className="w-14 h-14 mb-4 opacity-20" />
            <p className="text-lg font-medium">No Prediction Yet</p>
            <p className="text-sm max-w-sm mt-2 opacity-70">
              Fill in the meteorological parameters and click Predict to see the engine's output.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2 opacity-50">
              {["Hot Day", "Rainy Day", "Storm", "Foggy", "Cold Day", "Windy"].map(l => (
                <span key={l} className="text-xs border border-border rounded-full px-3 py-1">{l}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}