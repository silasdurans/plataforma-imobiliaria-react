import { useMemo, useState } from "react";
import { MapPin } from "lucide-react";

interface MapCityOption {
  label: string;
  query: string;
}

interface MapSectionProps {
  title?: string;
  cityOptions?: MapCityOption[];
}

const defaultCities: MapCityOption[] = [
  { label: "São Luís", query: "Sao Luis, Maranhao, Brasil" },
  { label: "São José de Ribamar", query: "Sao Jose de Ribamar, Maranhao, Brasil" },
  { label: "Paço do Lumiar", query: "Paco do Lumiar, Maranhao, Brasil" },
  { label: "Raposa", query: "Raposa, Maranhao, Brasil" },
];

const buildMapUrl = (query: string) =>
  `https://maps.google.com/maps?q=${encodeURIComponent(query)}&z=13&output=embed`;

export function MapSection({
  title = "Nossa Localização",
  cityOptions = defaultCities,
}: MapSectionProps) {
  const [selectedCity, setSelectedCity] = useState(cityOptions[0] ?? defaultCities[0]);
  const mapUrl = useMemo(() => buildMapUrl(selectedCity.query), [selectedCity.query]);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <MapPin className="size-5 text-blue-600" />
        <h2 className="text-2xl text-[#0F172A]">{title}</h2>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {cityOptions.map((city) => {
          const isActive = city.query === selectedCity.query;

          return (
            <button
              key={city.query}
              type="button"
              onClick={() => setSelectedCity(city)}
              className={`rounded-full px-4 py-2 text-sm transition-all ${
                isActive
                  ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {city.label}
            </button>
          );
        })}
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200">
        <iframe
          title={title}
          src={mapUrl}
          className="h-[400px] w-full"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
    </section>
  );
}
