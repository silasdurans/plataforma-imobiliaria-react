/**
 * Versão alternativa ou legada do card de imóvel.
 */
import { MapPin, Users, Maximize2, Star, Heart } from "lucide-react";
import { Link } from "react-router";
import { useEffect, useState } from "react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { motion } from "motion/react";
import { FAVORITES_EVENT, isPropertyFavorite, toggleFavoriteProperty } from "../lib/clientFavorites";

interface PropertyCardProps {
  id: string;
  image: string;
  title: string;
  price: number;
  location: string;
  size: number;
  capacity: number;
  rating: number;
  type: string;
  matchReasons?: string[];
}

export function PropertyCard({ 
  id, 
  image, 
  title, 
  price, 
  location, 
  size, 
  capacity, 
  rating,
  type,
  matchReasons = [],
}: PropertyCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const syncFavorite = () => setIsFavorite(isPropertyFavorite(id));

    syncFavorite();
    window.addEventListener(FAVORITES_EVENT, syncFavorite);
    window.addEventListener("storage", syncFavorite);

    return () => {
      window.removeEventListener(FAVORITES_EVENT, syncFavorite);
      window.removeEventListener("storage", syncFavorite);
    };
  }, [id]);

  return (
    <Link to={`/imovel/${id}`} className="group block">
      <motion.div 
        whileHover={{ y: -8 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-2xl overflow-hidden border border-slate-200 hover:shadow-2xl transition-all duration-300 h-full"
      >
        <div className="relative overflow-hidden aspect-[4/3]">
          <ImageWithFallback 
            src={image} 
            alt={title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          <button
            onClick={(e) => {
              e.preventDefault();
              setIsFavorite(toggleFavoriteProperty(id));
            }}
            className="absolute top-4 right-4 p-2.5 bg-white/95 backdrop-blur-sm rounded-full hover:bg-white transition-all shadow-lg hover:scale-110"
          >
            <Heart 
              className={`size-5 transition-all ${isFavorite ? 'fill-red-500 text-red-500 scale-110' : 'text-gray-700'}`} 
            />
          </button>
          
          <div className="absolute top-4 left-4 px-4 py-2 bg-[#0F172A] text-white text-sm rounded-full shadow-lg backdrop-blur-sm">
            {type}
          </div>

          <div className="absolute bottom-4 right-4 flex items-center gap-1.5 px-3 py-1.5 bg-white/95 backdrop-blur-sm rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Star className="size-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium">{rating}</span>
          </div>
        </div>
        
        <div className="p-5">
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-2xl font-bold bg-gradient-to-r from-[#0F172A] to-blue-600 bg-clip-text text-transparent">
              R$ {price.toLocaleString('pt-BR')}
            </span>
            <span className="text-sm text-slate-500">/mês</span>
          </div>
          
          <h3 className="font-semibold text-lg text-[#0F172A] line-clamp-1 mb-3 group-hover:text-blue-500 transition-colors">
            {title}
          </h3>
          
          <div className="flex items-center gap-2 text-slate-500 text-sm mb-4">
            <MapPin className="size-4 flex-shrink-0" />
            <span className="line-clamp-1">{location}</span>
          </div>
          
          <div className="flex items-center gap-6 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Maximize2 className="size-4 text-[#0F172A]" />
              <span className="font-medium">{size}m²</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Users className="size-4 text-[#0F172A]" />
              <span className="font-medium">{capacity} pessoas</span>
            </div>
          </div>

          {!!matchReasons.length && (
            <div className="mt-4 flex flex-wrap gap-2">
              {matchReasons.slice(0, 2).map((reason) => (
                <span
                  key={reason}
                  className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-medium text-cyan-700"
                >
                  bate com: {reason}
                </span>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </Link>
  );
}
