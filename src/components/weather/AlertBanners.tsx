import { AlertTriangle, CheckCircle2, Flame, Snowflake, Droplets, CloudRain, Wind } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface AlertConfig {
  keyword: string;
  icon: React.ReactNode;
  bgClass: string;
  borderClass: string;
  textClass: string;
}

const ALERT_CONFIGS: AlertConfig[] = [
  {
    keyword: "Heat",
    icon: <Flame className="h-4 w-4" />,
    bgClass: "bg-red-500/10",
    borderClass: "border-red-500/25",
    textClass: "text-red-400",
  },
  {
    keyword: "Cold",
    icon: <Snowflake className="h-4 w-4" />,
    bgClass: "bg-cyan-500/10",
    borderClass: "border-cyan-500/25",
    textClass: "text-cyan-400",
  },
  {
    keyword: "Humidity",
    icon: <Droplets className="h-4 w-4" />,
    bgClass: "bg-blue-500/10",
    borderClass: "border-blue-500/25",
    textClass: "text-blue-400",
  },
  {
    keyword: "Rain",
    icon: <CloudRain className="h-4 w-4" />,
    bgClass: "bg-indigo-500/10",
    borderClass: "border-indigo-500/25",
    textClass: "text-indigo-400",
  },
  {
    keyword: "Wind",
    icon: <Wind className="h-4 w-4" />,
    bgClass: "bg-orange-500/10",
    borderClass: "border-orange-500/25",
    textClass: "text-orange-400",
  },
];

function getAlertConfig(alert: string): AlertConfig {
  const match = ALERT_CONFIGS.find(c => alert.includes(c.keyword));
  return match ?? {
    keyword: "",
    icon: <AlertTriangle className="h-4 w-4" />,
    bgClass: "bg-yellow-500/10",
    borderClass: "border-yellow-500/25",
    textClass: "text-yellow-400",
  };
}

export default function AlertBanners({ alerts }: { alerts: string[] }) {
  if (alerts.length === 0) {
    return (
      <Alert className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 mb-6">
        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
        <AlertTitle className="text-emerald-400">All conditions normal</AlertTitle>
        <AlertDescription className="text-emerald-400/80">
          No severe weather alerts for this location currently.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="flex flex-col gap-3 mb-6">
      {alerts.map((alert, index) => {
        const config = getAlertConfig(alert);
        const parts = alert.split(':');
        const title = parts[0].trim();
        const desc = parts.length > 1 ? parts.slice(1).join(':').trim() : '';

        return (
          <Alert
            key={index}
            className={`${config.bgClass} ${config.borderClass}`}
          >
            <span className={config.textClass}>{config.icon}</span>
            <AlertTitle className={`font-bold ${config.textClass}`}>{title}</AlertTitle>
            {desc && (
              <AlertDescription className={`${config.textClass} opacity-80`}>
                {desc}
              </AlertDescription>
            )}
          </Alert>
        );
      })}
    </div>
  );
}
