/**
 * Página de detalhes do imóvel. Exibe informações completas, galeria, mapa e ações de contato/agendamento.
 */
import { 
  MapPin, 
  Maximize2, 
  Users, 
  Star, 
  Heart, 
  Share2, 
  MessageCircle,
  CheckCircle2,
  Wifi,
  Car,
  Coffee,
  ShieldCheck,
  Wind,
  DoorOpen,
  Phone,
  Mail,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { Header } from "../components/Header";
import { AIAgent } from "../components/AIAgent";
import { Footer } from "../components/Footer";
import { useParams, Link } from "react-router";
import { useEffect, useState } from "react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { motion } from "motion/react";
import { ScheduleVisitModal } from "../components/common/ScheduleVisitModal";
import { MapSection } from "../components/common/MapSection";
import { useProperties } from "../../data/properties";
import { FAVORITES_EVENT, isPropertyFavorite, toggleFavoriteProperty } from "../lib/clientFavorites";

export default function PropertyDetail() {
  const { id } = useParams();
  const properties = useProperties();
  const property = properties.find(p => p.id === id);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (!id) {
      return;
    }

    const syncFavorite = async () => setIsFavorite(await isPropertyFavorite(id));

    syncFavorite();
    window.addEventListener(FAVORITES_EVENT, syncFavorite);

    return () => {
      window.removeEventListener(FAVORITES_EVENT, syncFavorite);
    };
  }, [id]);

  if (!property) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl mb-4 text-[#0F172A]">Imóvel não encontrado</h1>
          <Link to="/resultados" className="text-blue-500 hover:underline">
            Voltar para resultados
          </Link>
        </div>
      </div>
    );
  }

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % property.images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + property.images.length) % property.images.length);
  };

  const featureIcons: Record<string, any> = {
    "Wi-Fi de alta velocidade": Wifi,
    "Wi-Fi Gigabit": Wifi,
    "Internet incluída": Wifi,
    "Internet rápida": Wifi,
    "Wi-Fi empresarial": Wifi,
    "Estacionamento disponível": Car,
    "3 vagas de estacionamento": Car,
    "2 vagas": Car,
    "4 vagas cobertas": Car,
    "Estacionamento rotativo": Car,
    "Café e água inclusos": Coffee,
    "Copa equipada": Coffee,
    "Copa compartilhada": Coffee,
    "Café livre": Coffee,
    "Segurança 24h": ShieldCheck,
    "CFTV": ShieldCheck,
    "Portaria 24h": ShieldCheck,
    "Segurança": ShieldCheck,
    "Concierge": ShieldCheck,
    "Ar condicionado": Wind,
    "Ambiente climatizado": Wind,
    "Ar condicionado split": Wind,
    "Ar condicionado central": Wind,
    "Sala de reunião": DoorOpen,
    "Sala de reunião privativa": DoorOpen,
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6 text-sm text-slate-500"
        >
          <Link to="/" className="hover:text-[#0F172A]">Início</Link>
          <span className="mx-2 text-slate-300">/</span>
          <Link to="/resultados" className="hover:text-[#0F172A]">Espaços</Link>
          <span className="mx-2 text-slate-300">/</span>
          <span className="text-[#0F172A]">{property.title}</span>
        </motion.div>

        {/* Galeria de fotos */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="relative rounded-3xl overflow-hidden bg-black aspect-[16/9] max-h-[600px] shadow-2xl">
            <motion.div
              key={currentImageIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <ImageWithFallback
                src={property.images[currentImageIndex]}
                alt={property.title}
                className="w-full h-full object-contain"
              />
            </motion.div>
            
            {property.images.length > 1 && (
              <>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/95 hover:bg-white rounded-full shadow-xl transition-colors backdrop-blur-sm"
                >
                  <ChevronLeft className="size-6" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/95 hover:bg-white rounded-full shadow-xl transition-colors backdrop-blur-sm"
                >
                  <ChevronRight className="size-6" />
                </motion.button>
              </>
            )}

            {/* Contador de imagens */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/70 backdrop-blur-sm text-white rounded-full text-sm">
              {currentImageIndex + 1} / {property.images.length}
            </div>

            {/* Botões de ação */}
            <div className="absolute top-4 right-4 flex gap-2">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={async () => {
                  if (!id) return;
                  setIsFavorite(await toggleFavoriteProperty(id));
                }}
                className="p-3 bg-white/95 backdrop-blur-sm hover:bg-white rounded-full shadow-xl transition-colors"
              >
                <Heart className={`size-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-700'}`} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-3 bg-white/95 backdrop-blur-sm hover:bg-white rounded-full shadow-xl transition-colors"
              >
                <Share2 className="size-5 text-gray-700" />
              </motion.button>
            </div>
          </div>

          {/* Thumbnails */}
          {property.images.length > 1 && (
            <div className="grid grid-cols-6 gap-3 mt-4">
              {property.images.map((image, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`aspect-video rounded-xl overflow-hidden border-2 transition-all ${
                    currentImageIndex === index ? 'border-blue-600 shadow-lg' : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <ImageWithFallback
                    src={image}
                    alt={`${property.title} - ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </motion.button>
              ))}
            </div>
          )}
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Informações principais */}
          <div className="lg:col-span-2 space-y-8">
            {/* Cabeçalho */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="inline-block px-4 py-2 bg-[#0F172A] text-white rounded-full text-sm mb-3 shadow-lg">
                    {property.type}
                  </div>
                  <h1 className="text-4xl mb-3 text-[#0F172A]">{property.title}</h1>
                  <div className="flex items-center gap-4 text-slate-500">
                    <div className="flex items-center gap-2">
                      <MapPin className="size-5 text-[#0F172A]" />
                      <span>{property.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="size-5 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{property.rating}</span>
                      <span className="text-gray-500">(127 avaliações)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Métricas rápidas */}
              <div className="grid grid-cols-3 gap-4 p-6 bg-slate-50 rounded-2xl border border-slate-200 shadow-sm">
                <div className="text-center">
                  <div className="inline-block p-3 bg-[#0F172A]/10 rounded-xl mb-2">
                    <Maximize2 className="size-6 text-[#0F172A]" />
                  </div>
                  <div className="text-2xl text-[#0F172A]">{property.size}m²</div>
                  <div className="text-sm text-slate-500">Área total</div>
                </div>
                <div className="text-center border-x border-slate-200">
                  <div className="inline-block p-3 bg-[#0F172A]/10 rounded-xl mb-2">
                    <Users className="size-6 text-[#0F172A]" />
                  </div>
                  <div className="text-2xl text-[#0F172A]">{property.capacity}</div>
                  <div className="text-sm text-slate-500">Capacidade</div>
                </div>
                <div className="text-center">
                  <div className="inline-block p-3 bg-yellow-50 rounded-xl mb-2">
                    <Star className="size-6 text-yellow-500" />
                  </div>
                  <div className="text-2xl text-[#0F172A]">{property.rating}</div>
                  <div className="text-sm text-slate-500">Avaliação</div>
                </div>
              </div>
            </motion.div>

            {/* Descrição */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm"
            >
              <h2 className="text-2xl mb-4 text-[#0F172A]">Sobre o Espaço</h2>
              <p className="text-slate-600 leading-relaxed">{property.description}</p>
            </motion.div>

            {/* Características */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm"
            >
              <h2 className="text-2xl mb-6 text-[#0F172A]">Características e Comodidades</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {property.features.map((feature, index) => {
                  const IconComponent = Object.keys(featureIcons).find(key => feature.includes(key)) 
                    ? featureIcons[Object.keys(featureIcons).find(key => feature.includes(key))!]
                    : CheckCircle2;
                  
                  return (
                    <motion.div 
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + index * 0.05 }}
                      className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl hover:bg-[#0F172A]/5 transition-colors"
                    >
                      <div className="p-2 bg-[#0F172A]/10 rounded-lg">
                        <IconComponent className="size-5 text-[#0F172A] flex-shrink-0" />
                      </div>
                      <span className="text-slate-700">{feature}</span>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>

            {/* Localização */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <MapSection
                title="Nossa Localização"
                cityOptions={[
                  { label: "São Luís", query: "Sao Luis, Maranhao, Brasil" },
                  { label: "Local do Imóvel", query: `${property.location}, Brasil` },
                  { label: "São José de Ribamar", query: "Sao Jose de Ribamar, Maranhao, Brasil" },
                  { label: "Paço do Lumiar", query: "Paco do Lumiar, Maranhao, Brasil" },
                ]}
              />
            </motion.div>
          </div>

          {/* Sidebar de contato */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl p-6 border border-slate-200 sticky top-24 space-y-6 shadow-sm"
            >
              <div>
                <div className="text-3xl font-bold bg-gradient-to-r from-[#0F172A] to-blue-600 bg-clip-text text-transparent mb-1">
                  R$ {property.price.toLocaleString('pt-BR')}
                  <span className="text-lg text-slate-500">/mês</span>
                </div>
                <p className="text-sm text-slate-500">+ taxas e condomínio</p>
              </div>

              <div className="space-y-3">
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full border-2 border-[#0F172A] text-[#0F172A] py-3 rounded-xl hover:bg-[#0F172A]/5 transition-all flex items-center justify-center gap-2"
                >
                  <MessageCircle className="size-5" />
                  Entrar em Contato
                </motion.button>
              </div>

              <div className="pt-6 border-t border-slate-200 space-y-4">
                <h3 className="text-[#0F172A]">Contato do Proprietário</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-slate-600 p-3 bg-slate-50 rounded-xl">
                    <Phone className="size-5 text-[#0F172A]" />
                    <span>(98) 9 8765-4321</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-600 p-3 bg-slate-50 rounded-xl">
                    <Mail className="size-5 text-[#0F172A]" />
                    <span className="text-sm">contato@spparticipacoes.com.br</span>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-200">
                <div className="bg-emerald-50 rounded-xl p-4 text-sm border border-emerald-200">
                  <CheckCircle2 className="size-5 mb-2 text-green-600" />
                  <p className="mb-1 text-green-900">Resposta rápida garantida</p>
                  <p className="text-green-700">Em média 2 horas</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="mt-10"
        >
          <ScheduleVisitModal propertyTitle={property.title} />
        </motion.div>
      </div>

      <AIAgent />

      {/* Footer */}
      <Footer />
    </div>
  );
}
