import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router";
import {
  CalendarDays,
  Heart,
  LogOut,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Save,
  Settings,
  User,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import { Header } from "../components/layout/Header";
import { Footer } from "../components/layout/Footer";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { FAVORITES_EVENT, getFavoritePropertyIds, removeFavoriteProperty } from "../lib/clientFavorites";
import {
  clearClientSession,
  getCurrentClientUser,
  updateCurrentClientUser,
} from "../lib/clientSession";
import { useProperties } from "../../data/properties";

type ProfileTab = "perfil" | "reservas" | "favoritos" | "configuracoes";

const fallbackProfile = {
  location: "São Luís, Maranhão",
  phone: "(98) 98888-1234",
  bio: "Apaixonado por ambientes bem localizados e por uma experiência simples na busca do imóvel ideal.",
};

const tabs = [
  { id: "perfil", label: "Perfil", icon: User },
  { id: "reservas", label: "Reservas", icon: CalendarDays },
  { id: "favoritos", label: "Favoritos", icon: Heart },
  { id: "configuracoes", label: "Configurações", icon: Settings },
] as const;

export default function ClientProfile() {
  const navigate = useNavigate();
  const properties = useProperties();
  const [clientUser, setClientUser] = useState(() => getCurrentClientUser());
  const [activeTab, setActiveTab] = useState<ProfileTab>("perfil");
  const [favoriteIds, setFavoriteIds] = useState<string[]>(() => getFavoritePropertyIds());
  const [isEditing, setIsEditing] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [form, setForm] = useState({
    name: clientUser?.name || "",
    email: clientUser?.email || "",
    phone: clientUser?.phone || fallbackProfile.phone,
    bio: clientUser?.bio || fallbackProfile.bio,
    location: clientUser?.location || fallbackProfile.location,
  });

  useEffect(() => {
    const syncFavorites = () => setFavoriteIds(getFavoritePropertyIds());

    window.addEventListener(FAVORITES_EVENT, syncFavorites);
    window.addEventListener("storage", syncFavorites);

    return () => {
      window.removeEventListener(FAVORITES_EVENT, syncFavorites);
      window.removeEventListener("storage", syncFavorites);
    };
  }, []);

  if (!clientUser) {
    return <Navigate to="/cliente/login" replace />;
  }

  const avatarFallback = clientUser.name
    .split(" ")
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

  const reservations = useMemo(
    () =>
      properties.slice(0, 3).map((property, index) => ({
        id: `${property.id}-${index}`,
        title: property.title,
        date: new Intl.DateTimeFormat("pt-BR", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        }).format(new Date(Date.now() + (index + 1) * 86400000 * 7)),
        status: index === 0 ? "Confirmada" : index === 1 ? "Pendente" : "Finalizada",
      })),
    [properties],
  );

  const favoriteItems = useMemo(
    () => properties.filter((property) => favoriteIds.includes(property.id)),
    [favoriteIds, properties],
  );

  const handleFormChange = (field: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSave = () => {
    if (!form.name.trim() || !form.email.trim()) {
      setFeedback("Preencha nome e e-mail para continuar.");
      return;
    }

    const updatedUser = updateCurrentClientUser({
      name: form.name,
      email: form.email,
      phone: form.phone,
      bio: form.bio,
      location: form.location,
    });

    if (!updatedUser) {
      setFeedback("Não foi possível atualizar o perfil.");
      return;
    }

    setClientUser(updatedUser);
    setIsEditing(false);
    setFeedback("Perfil atualizado com sucesso.");
  };

  const handleLogout = () => {
    clearClientSession();
    navigate("/cliente/login", { replace: true });
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "perfil":
        return (
          <motion.div
            key="perfil"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid gap-4 md:grid-cols-2"
          >
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Nome</p>
              <p className="mt-3 text-lg text-[#0F172A]">{clientUser.name}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Email</p>
              <div className="mt-3 flex items-center gap-2 text-lg text-[#0F172A]">
                <Mail className="size-4 text-slate-400" />
                {clientUser.email}
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Telefone</p>
              <div className="mt-3 flex items-center gap-2 text-lg text-[#0F172A]">
                <Phone className="size-4 text-slate-400" />
                {clientUser.phone || fallbackProfile.phone}
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Localização</p>
              <div className="mt-3 flex items-center gap-2 text-lg text-[#0F172A]">
                <MapPin className="size-4 text-slate-400" />
                {clientUser.location || fallbackProfile.location}
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 md:col-span-2">
              <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Bio</p>
              <p className="mt-3 leading-7 text-slate-600">
                {clientUser.bio || fallbackProfile.bio}
              </p>
            </div>
          </motion.div>
        );
      case "reservas":
        return (
          <motion.div key="reservas" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            {reservations.map((reservation) => (
              <div key={reservation.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-lg text-[#0F172A]">{reservation.title}</h3>
                    <p className="mt-1 text-sm text-slate-500">{reservation.date}</p>
                  </div>
                  <span className={`w-fit rounded-full px-3 py-1 text-xs font-medium ${
                    reservation.status === "Confirmada"
                      ? "bg-emerald-50 text-emerald-700"
                      : reservation.status === "Pendente"
                        ? "bg-amber-50 text-amber-700"
                        : "bg-slate-100 text-slate-600"
                  }`}>
                    {reservation.status}
                  </span>
                </div>
              </div>
            ))}
          </motion.div>
        );
      case "favoritos":
        return (
          <motion.div key="favoritos" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="grid gap-4 sm:grid-cols-2">
            {favoriteItems.length === 0 && (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500 sm:col-span-2">
                Nenhum imóvel favorito salvo.
              </div>
            )}
            {favoriteItems.map((item) => (
              <Link
                key={item.id}
                to={`/imovel/${item.id}`}
                className="block overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <ImageWithFallback src={item.image} alt={item.title} className="h-full w-full object-cover" />
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg text-[#0F172A]">{item.title}</h3>
                      <p className="mt-1 text-sm text-slate-500">{item.location}</p>
                    </div>
                    <button
                      type="button"
                      onClick={(event) => {
                        event.preventDefault();
                        removeFavoriteProperty(item.id);
                      }}
                      className="rounded-full bg-rose-50 p-2 text-rose-500 transition-colors hover:bg-rose-100"
                    >
                      <Heart className="size-4 fill-current" />
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </motion.div>
        );
      case "configuracoes":
        return (
          <motion.div key="configuracoes" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="grid gap-4 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => {
                setFeedback("");
                setIsEditing(true);
              }}
              className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
            >
              <div>
                <p className="text-lg text-[#0F172A]">Editar perfil</p>
                <p className="mt-1 text-sm text-slate-500">Atualize seus dados pessoais</p>
              </div>
              <Pencil className="size-5 text-slate-400" />
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center justify-between rounded-2xl border border-red-100 bg-red-50 p-5 text-left shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
            >
              <div>
                <p className="text-lg text-red-700">Sair</p>
                <p className="mt-1 text-sm text-red-500">Encerrar sessão com segurança</p>
              </div>
              <LogOut className="size-5 text-red-400" />
            </button>
          </motion.div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#f1f5f9_32%,#ffffff_100%)]">
      <Header />

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
        <section className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
          <div className="h-28 bg-[linear-gradient(135deg,#0f172a_0%,#1d4ed8_55%,#7dd3fc_100%)]" />
          <div className="px-5 pb-6 sm:px-8 sm:pb-8">
            <div className="-mt-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                <div className="flex size-24 items-center justify-center rounded-full border-4 border-white bg-gradient-to-br from-blue-500 to-cyan-500 text-2xl font-semibold text-white shadow-lg shadow-cyan-200">
                  {avatarFallback}
                </div>
                <div>
                  <h1 className="text-3xl text-[#0F172A]">{clientUser.name}</h1>
                  <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-500">
                    {clientUser.bio || fallbackProfile.bio}
                  </p>
                </div>
              </div>
              <div className="rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-600">
                {clientUser.location || fallbackProfile.location}
              </div>
            </div>

            {feedback && (
              <div className="mt-6 rounded-2xl border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm text-cyan-700">
                {feedback}
              </div>
            )}

            <div className="mt-8 flex flex-wrap gap-2 border-b border-slate-200 pb-4">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition-all ${
                      isActive
                        ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md shadow-cyan-200"
                        : "bg-slate-100 text-slate-600 hover:bg-cyan-50 hover:text-[#0F172A]"
                    }`}
                  >
                    <Icon className="size-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            <div className="mt-6">{renderTabContent()}</div>
          </div>
        </section>
      </main>

      {isEditing && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-2xl rounded-[28px] border border-slate-200 bg-white p-6 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl text-[#0F172A]">Editar perfil</h2>
                <p className="mt-1 text-sm text-slate-500">Atualize seus dados sem sair da página.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="rounded-full bg-slate-100 p-2 text-slate-500 transition-colors hover:bg-slate-200"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm text-slate-600">Nome</span>
                <input value={form.name} onChange={(event) => handleFormChange("name", event.target.value)} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-cyan-400" />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm text-slate-600">Email</span>
                <input type="email" value={form.email} onChange={(event) => handleFormChange("email", event.target.value)} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-cyan-400" />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm text-slate-600">Telefone</span>
                <input value={form.phone} onChange={(event) => handleFormChange("phone", event.target.value)} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-cyan-400" />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm text-slate-600">Localização</span>
                <input value={form.location} onChange={(event) => handleFormChange("location", event.target.value)} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-cyan-400" />
              </label>
              <label className="block sm:col-span-2">
                <span className="mb-2 block text-sm text-slate-600">Bio</span>
                <textarea value={form.bio} onChange={(event) => handleFormChange("bio", event.target.value)} rows={4} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-cyan-400" />
              </label>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button type="button" onClick={() => setIsEditing(false)} className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50">
                Cancelar
              </button>
              <button type="button" onClick={handleSave} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-3 text-sm font-medium text-white shadow-lg shadow-cyan-200">
                <Save className="size-4" />
                Salvar alterações
              </button>
            </div>
          </motion.div>
        </div>
      )}

      <Footer />
    </div>
  );
}
