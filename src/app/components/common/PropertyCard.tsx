import { MapPin, Users, Maximize2, Star, Heart } from "lucide-react";
import { Link } from "react-router";
import { useEffect, useState } from "react";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { motion } from "motion/react";
import { FAVORITES_EVENT, isPropertyFavorite, toggleFavoriteProperty } from "../../lib/clientFavorites";

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
  type 
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
            className="absolute top-4 right-4 size-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-all z-10 shadow-lg"
          >
            <Heart 
              className={`size-5 transition-colors ${
                isFavorite ? 'fill-red-500 text-red-500' : 'text-slate-600'
              }`} 
            />
          </button>
          
          <div className="absolute top-4 left-4 px-3 py-1.5 bg-[#0F172A]/90 backdrop-blur-sm rounded-full text-white text-xs font-medium">
            {type}
          </div>
        </div>
        
        <div className="p-6">
          <h3 className="text-xl mb-3 text-[#0F172A] group-hover:text-blue-600 transition-colors line-clamp-1">
            {title}
          </h3>
          
          <div className="flex items-center gap-1.5 text-slate-600 mb-4">
            <MapPin className="size-4 flex-shrink-0" />
            <span className="text-sm line-clamp-1">{location}</span>
          </div>
          
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-1">
              <Star className="size-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium text-[#0F172A]">{rating}</span>
              <span className="text-xs text-slate-500">(45)</span>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 text-slate-600">
                <Maximize2 className="size-4" />
                <span className="text-sm">{size}m²</span>
              </div>
              <div className="flex items-center gap-1 text-slate-600">
                <Users className="size-4" />
                <span className="text-sm">{capacity}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl text-[#0F172A] mb-1">
                R$ {price.toLocaleString('pt-BR')}
              </div>
              <div className="text-xs text-slate-500">por mês</div>
            </div>
            <div className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
              Ver detalhes
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
