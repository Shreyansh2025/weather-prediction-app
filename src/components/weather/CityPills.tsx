import { Badge } from "@/components/ui/badge";

export const CITIES = [
  { name: "Delhi", lat: 28.6139, lon: 77.2090 },
  { name: "Mumbai", lat: 19.0760, lon: 72.8777 },
  { name: "Kolkata", lat: 22.5726, lon: 88.3639 },
  { name: "Chennai", lat: 13.0827, lon: 80.2707 },
  { name: "Bangalore", lat: 12.9716, lon: 77.5946 },
  { name: "Hyderabad", lat: 17.3850, lon: 78.4867 },
  { name: "Ahmedabad", lat: 23.0225, lon: 72.5714 },
  { name: "Pune", lat: 18.5204, lon: 73.8567 },
  { name: "Jaipur", lat: 26.9124, lon: 75.7873 },
  { name: "Lucknow", lat: 26.8467, lon: 80.9462 },
  { name: "Surat", lat: 21.1702, lon: 72.8311 },
  { name: "Indore", lat: 22.7196, lon: 75.8577 },
  { name: "Bhopal", lat: 23.2599, lon: 77.4126 },
  { name: "Patna", lat: 25.5941, lon: 85.1376 },
  { name: "Chandigarh", lat: 30.7333, lon: 76.7794 },
  { name: "Nagpur", lat: 21.1458, lon: 79.0882 },
  { name: "Visakhapatnam", lat: 17.6868, lon: 83.2185 },
  { name: "Coimbatore", lat: 11.0168, lon: 76.9558 },
  { name: "Kochi", lat: 9.9312, lon: 76.2673 },
  { name: "Guwahati", lat: 26.1445, lon: 91.7362 },
];

export default function CityPills({
  selectedCityName,
  onSelectCity
}: {
  selectedCityName: string;
  onSelectCity: (city: {name: string, lat: number, lon: number}) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {CITIES.map(city => (
        <Badge
          key={city.name}
          variant={selectedCityName === city.name ? 'default' : 'outline'}
          className={`cursor-pointer px-3 py-1.5 text-sm ${selectedCityName === city.name ? 'ring-2 ring-primary ring-offset-1 ring-offset-background' : 'hover:bg-muted'}`}
          onClick={() => onSelectCity(city)}
          data-testid={`city-pill-${city.name.toLowerCase()}`}
        >
          {city.name}
        </Badge>
      ))}
    </div>
  );
}
