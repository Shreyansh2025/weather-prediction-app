import { Cloud } from "lucide-react";
import { format } from "date-fns";

export default function Header({ 
  selectedMLModel, 
  setSelectedMLModel,
  currentTime
}: {
  selectedMLModel: string;
  setSelectedMLModel: (model: 'Ridge' | 'Logistic' | 'RF/GB') => void;
  currentTime: Date;
}) {
  return (
    <header className="w-full bg-card border-b border-border py-4 px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
      <div className="flex items-center gap-4">
        <div className="bg-primary/20 p-2 rounded-lg text-primary">
          <Cloud className="w-8 h-8" />
        </div>
        <div>
          <h1 className="font-bold text-xl tracking-tight">Weather Prediction & Alert System</h1>
          <p className="text-sm text-muted-foreground">Mandsaur University · Minor Project 2026</p>
        </div>
      </div>
      
      <div className="flex items-center gap-6">
        
        <div className="text-right hidden sm:block">
          <div className="font-mono font-medium text-lg tracking-wider">
            {format(currentTime, 'hh:mm:ss aa')}
          </div>
          <div className="text-sm text-muted-foreground font-medium">
            {format(currentTime, 'dd MMM yyyy')}
          </div>
        </div>
      </div>
    </header>
  );
}
