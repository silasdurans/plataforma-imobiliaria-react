export interface Property {
  id: string;
  title: string;
  type: string;
  price: number;
  location: string;
  size: number;
  capacity: number;
  rating: number;
  image: string;
  images: string[];
  description: string;
  features: string[];
  lat: number;
  lng: number;
}

const officeImages = [
  "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1497366412874-3415097a27e7?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1497215842964-222b430dc094?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1604328698692-f76ea9498e76?auto=format&fit=crop&w=1200&q=80",
];

const featureSets = [
  ["Wi-Fi empresarial", "Portaria 24h", "Ar condicionado central", "2 vagas", "Sala de reunião", "CFTV"],
  ["Internet incluída", "Copa compartilhada", "Recepção premium", "Elevador", "Gerador", "Estacionamento rotativo"],
  ["Mobiliado", "Iluminação LED", "Piso em porcelanato", "Banheiro privativo", "Auditório no edifício", "Controle de acesso"],
  ["Wi-Fi Gigabit", "Sala de reunião privativa", "Café livre", "Ar condicionado split", "3 vagas", "Hall corporativo"],
  ["Recepção compartilhada", "Segurança 24h", "Forro modular", "Vista para o mar", "Banheiro no andar", "Estacionamento"],
];

const propertiesSeed = [
  { id: "1", title: "Sala Corporativa Atlante", location: "Ponta d'Areia, São Luís - MA", price: 4200, size: 52, capacity: 8, rating: 4.9, lat: -2.4908, lng: -44.2938 },
  { id: "2", title: "Sala Prime Renascença One", location: "Renascença, São Luís - MA", price: 3900, size: 48, capacity: 7, rating: 4.8, lat: -2.5042, lng: -44.2925 },
  { id: "3", title: "Sala Vista Mar Calhau", location: "Calhau, São Luís - MA", price: 4600, size: 58, capacity: 9, rating: 4.8, lat: -2.4862, lng: -44.2859 },
  { id: "4", title: "Sala Boutique Península", location: "Península da Ponta d'Areia, São Luís - MA", price: 6100, size: 63, capacity: 10, rating: 4.9, lat: -2.4926, lng: -44.2898 },
  { id: "5", title: "Sala Executiva São Marcos", location: "São Marcos, São Luís - MA", price: 3400, size: 44, capacity: 6, rating: 4.7, lat: -2.4944, lng: -44.2834 },
  { id: "6", title: "Sala Médica Jardim Renascença", location: "Jardim Renascença, São Luís - MA", price: 3700, size: 46, capacity: 7, rating: 4.8, lat: -2.5005, lng: -44.2891 },
  { id: "7", title: "Sala Empresarial Cohafuma Center", location: "Cohafuma, São Luís - MA", price: 3200, size: 40, capacity: 6, rating: 4.7, lat: -2.5171, lng: -44.2647 },
  { id: "8", title: "Sala Heritage Quintas", location: "Quintas do Calhau, São Luís - MA", price: 4900, size: 62, capacity: 10, rating: 4.8, lat: -2.4682, lng: -44.2562 },
  { id: "9", title: "Sala Strategic Holandeses", location: "Calhau, São Luís - MA", price: 4300, size: 54, capacity: 8, rating: 4.7, lat: -2.4783, lng: -44.2664 },
  { id: "10", title: "Sala Nobile Renascença II", location: "Renascença II, São Luís - MA", price: 3600, size: 43, capacity: 6, rating: 4.7, lat: -2.5061, lng: -44.2875 },
  { id: "11", title: "Sala Prime Olho d'Água", location: "Olho d'Água, São Luís - MA", price: 4100, size: 50, capacity: 8, rating: 4.8, lat: -2.4635, lng: -44.2458 },
  { id: "12", title: "Sala Corporate Jaracaty", location: "Jaracaty, São Luís - MA", price: 3000, size: 38, capacity: 5, rating: 4.6, lat: -2.5018, lng: -44.2752 },
  { id: "13", title: "Sala Premium Ponta do Farol", location: "Ponta do Farol, São Luís - MA", price: 5200, size: 60, capacity: 10, rating: 4.9, lat: -2.4881, lng: -44.2872 },
  { id: "14", title: "Sala Select São Francisco", location: "São Francisco, São Luís - MA", price: 2800, size: 36, capacity: 5, rating: 4.6, lat: -2.5156, lng: -44.2923 },
  { id: "15", title: "Sala Garden Eldorado", location: "Jardim Eldorado, São Luís - MA", price: 3350, size: 41, capacity: 6, rating: 4.7, lat: -2.5114, lng: -44.2682 },
  { id: "16", title: "Sala Imperial Calhau Tower", location: "Calhau, São Luís - MA", price: 5800, size: 68, capacity: 11, rating: 4.9, lat: -2.4821, lng: -44.2817 },
  { id: "17", title: "Sala Costa Atlântica", location: "Quintas do Calhau, São Luís - MA", price: 4700, size: 56, capacity: 9, rating: 4.8, lat: -2.4705, lng: -44.2504 },
  { id: "18", title: "Sala Smart Península Office", location: "Península da Ponta d'Areia, São Luís - MA", price: 6400, size: 70, capacity: 12, rating: 5.0, lat: -2.4917, lng: -44.291 },
  { id: "19", title: "Sala Office Center Renascença", location: "Renascença, São Luís - MA", price: 3550, size: 42, capacity: 6, rating: 4.7, lat: -2.5031, lng: -44.2909 },
  { id: "20", title: "Sala Blue Tower Cohafuma", location: "Cohafuma, São Luís - MA", price: 3450, size: 44, capacity: 6, rating: 4.7, lat: -2.5158, lng: -44.2611 },
  { id: "21", title: "Sala Brisa Mar Olho d'Água", location: "Olho d'Água, São Luís - MA", price: 3950, size: 49, capacity: 7, rating: 4.8, lat: -2.4588, lng: -44.2423 },
  { id: "22", title: "Sala Prime Park São Marcos", location: "São Marcos, São Luís - MA", price: 3650, size: 45, capacity: 6, rating: 4.7, lat: -2.4923, lng: -44.2812 },
];

export const properties: Property[] = propertiesSeed.map((item, index) => {
  const image = officeImages[index % officeImages.length];
  const secondaryImage = officeImages[(index + 2) % officeImages.length];
  const tertiaryImage = officeImages[(index + 4) % officeImages.length];
  const features = featureSets[index % featureSets.length];

  return {
    id: item.id,
    title: item.title,
    type: "Sala Comercial",
    price: item.price,
    location: item.location,
    size: item.size,
    capacity: item.capacity,
    rating: item.rating,
    image,
    images: [image, secondaryImage, tertiaryImage],
    description:
      `${item.title} em localizacao nobre de Sao Luis, ideal para operacoes administrativas, atendimento premium e equipes que precisam de presenca corporativa forte. ` +
      `A sala entrega infraestrutura pronta para uso, facil acesso e perfil executivo valorizado na regiao.`,
    features,
    lat: item.lat,
    lng: item.lng,
  };
});
