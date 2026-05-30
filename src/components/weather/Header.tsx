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
        <div className="flex items-center gap-3 bg-background rounded-full px-4 py-1.5 border border-border">
          <span className="text-sm font-medium text-muted-foreground">ML Models:</span>
          <div className="flex space-x-1">
            {['Ridge', 'Logistic', 'RF/GB'].map(model => (
              <button
                key={model}
                onClick={() => setSelectedMLModel(model as any)}
                className={`text-xs px-3 py-1 rounded-full transition-colors ${
                  selectedMLModel === model 
                    ? 'bg-primary text-primary-foreground font-medium' 
                    : 'text-muted-foreground hover:bg-muted'
                }`}
                data-testid={`model-select-${model.toLowerCase().replace('/', '')}`}
              >
                {model}
              </button>
            ))}
          </div>
        </div>
        
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
