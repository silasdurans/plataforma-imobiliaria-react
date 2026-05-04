/**
 * Página de perfil do cliente. Mostra dados da conta, favoritos e histórico relacionado ao usuário logado.
 */
import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router";
import {
  CalendarDays,
  Heart,
  LogOut,
  Mail,
  MapPin,
  MessageCircle,
  Pencil,
  Phone,
  Save,
  Settings,
  ShieldCheck,
  Sparkles,
  User,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import { Header } from "../components/layout/Header";
import { Footer } from "../components/layout/Footer";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import {
  FAVORITES_EVENT,
  getFavoritePropertyIds,
  removeFavoriteProperty,
} from "../lib/clientFavorites";
import {
  clearClientSession,
  fetchClientSession,
  updateCurrentClientUser,
} from "../lib/clientSession";
import { useProperties } from "../../data/properties";
import { formatScheduleTimeLabel, useSchedules } from "../../data/schedules";

type ProfileTab = "perfil" | "reservas" | "favoritos" | "contato" | "configuracoes";

const fallbackProfile = {
  location: "São Luís, Maranhão",
  phone: "(98) 98888-1234",
  bio: "Apaixonado por ambientes bem localizados e por uma experiência simples na busca do imóvel ideal.",
};

const tabs = [
  { id: "perfil", label: "Visão geral", icon: User },
  { id: "reservas", label: "Reservas", icon: CalendarDays },
  { id: "favoritos", label: "Favoritos", icon: Heart },
  { id: "contato", label: "Contato", icon: MessageCircle },
  { id: "configuracoes", label: "Configurações", icon: Settings },
] as const;

const formatReservationStatus = (status: string) => {
  if (status === "confirmado") return "Confirmada";
  if (status === "agendado") return "Pendente";
  return "Cancelada";
};

const getReservationStatusClass = (status: string) => {
  if (status === "Confirmada") {
    return "bg-emerald-100 text-emerald-700";
  }

  if (status === "Pendente") {
    return "bg-amber-100 text-amber-700";
  }

  return "bg-slate-200 text-slate-600";
};

export default function ClientProfile() {
  const navigate = useNavigate();
  const properties = useProperties();
  const schedules = useSchedules();
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  const [clientUser, setClientUser] = useState<Awaited<ReturnType<typeof fetchClientSession>>>(null);
  const [activeTab, setActiveTab] = useState<ProfileTab>("perfil");
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: fallbackProfile.phone,
    bio: fallbackProfile.bio,
    location: fallbackProfile.location,
  });

  useEffect(() => {
    fetchClientSession().then((user) => {
      setClientUser(user);
      setForm({
        name: user?.name || "",
        email: user?.email || "",
        phone: user?.phone || fallbackProfile.phone,
        bio: user?.bio || fallbackProfile.bio,
        location: user?.location || fallbackProfile.location,
      });
      setIsLoadingSession(false);
    });
  }, []);

  useEffect(() => {
    const syncFavorites = async () => setFavoriteIds(await getFavoritePropertyIds());

    syncFavorites();
    window.addEventListener(FAVORITES_EVENT, syncFavorites);

    return () => {
      window.removeEventListener(FAVORITES_EVENT, syncFavorites);
    };
  }, []);

  const clientId = clientUser?.id ?? "";
  const clientEmail = clientUser?.email?.toLowerCase() ?? "";
  const clientName = clientUser?.name ?? "Cliente";
  const clientBio = clientUser?.bio || fallbackProfile.bio;
  const clientPhone = clientUser?.phone || fallbackProfile.phone;
  const clientLocation = clientUser?.location || fallbackProfile.location;

  const avatarFallback = useMemo(
    () =>
      clientName
        .split(" ")
        .slice(0, 2)
        .map((part) => part.charAt(0).toUpperCase())
        .join(""),
    [clientName],
  );

  const reservations = useMemo(() => {
    return schedules
      .filter(
        (schedule) =>
          !!clientUser &&
          (schedule.clientId === clientId ||
            schedule.clientEmail.toLowerCase() === clientEmail),
      )
      .slice()
      .sort(
        (first, second) =>
          new Date(second.createdAt ?? 0).getTime() - new Date(first.createdAt ?? 0).getTime(),
      )
      .map((schedule) => ({
        id: String(schedule.id),
        title: schedule.propertyTitle,
        date: new Intl.DateTimeFormat("pt-BR", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        }).format(new Date(`${schedule.date}T12:00:00`)),
        time: formatScheduleTimeLabel(schedule),
        status: formatReservationStatus(schedule.status),
      }));
  }, [clientEmail, clientId, clientUser, schedules]);

  const favoriteItems = useMemo(
    () => properties.filter((property) => favoriteIds.includes(property.id)),
    [favoriteIds, properties],
  );

  const stats = useMemo(
    () => [
      {
        label: "Reservas ativas",
        value: reservations.filter((reservation) => reservation.status !== "Cancelada").length,
        detail: "Agenda vinculada à sua conta",
      },
      {
        label: "Favoritos",
        value: favoriteItems.length,
        detail: "Imóveis salvos para comparar",
      },
      {
        label: "Perfil",
        value: clientPhone ? "100%" : "75%",
        detail: "Complete seus dados para agilizar contato",
      },
    ],
    [clientPhone, favoriteItems.length, reservations],
  );

  const nextReservation = reservations.find((reservation) => reservation.status !== "Cancelada") || null;
  const normalizedPhoneDigits = clientPhone.replace(/\D/g, "");
  const whatsappDigits =
    normalizedPhoneDigits.length >= 10 && !normalizedPhoneDigits.startsWith("55")
      ? `55${normalizedPhoneDigits}`
      : normalizedPhoneDigits;
  const whatsappHref = whatsappDigits
    ? `https://wa.me/${whatsappDigits}?text=${encodeURIComponent(
        `Olá, ${clientName}! Estamos entrando em contato sobre seu atendimento na Grupo SP.`,
      )}`
    : "";

  const handleFormChange = (field: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.email.trim()) {
      setFeedback("Preencha nome e e-mail para continuar.");
      return;
    }

    try {
      const updatedUser = await updateCurrentClientUser({
        name: form.name,
        email: form.email,
        phone: form.phone,
        bio: form.bio,
        location: form.location,
      });

      setClientUser(updatedUser);
      setIsEditing(false);
      setFeedback("Perfil atualizado com sucesso.");
    } catch {
      setFeedback("Não foi possível atualizar o perfil.");
    }
  };

  const handleLogout = async () => {
    await clearClientSession();
    navigate("/cliente/login", { replace: true });
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "perfil":
        return (
          <motion.div
            key="perfil"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]"
          >
            <section className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-[#0F172A] p-3 text-white">
                  <Sparkles className="size-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                    Conta
                  </p>
                  <h2 className="mt-1 text-2xl text-[#0F172A]">Resumo do seu perfil</h2>
                </div>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                  <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Nome</p>
                  <p className="mt-3 text-lg text-[#0F172A]">{clientName}</p>
                </div>
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                  <p className="text-xs uppercase tracking-[0.22em] text-slate-400">E-mail</p>
                  <div className="mt-3 flex items-center gap-2 text-lg text-[#0F172A]">
                    <Mail className="size-4 text-slate-400" />
                    {clientUser?.email}
                  </div>
                </div>
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                  <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Telefone</p>
                  <div className="mt-3 flex items-center gap-2 text-lg text-[#0F172A]">
                    <Phone className="size-4 text-slate-400" />
                    {clientPhone}
                  </div>
                </div>
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                  <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Localização</p>
                  <div className="mt-3 flex items-center gap-2 text-lg text-[#0F172A]">
                    <MapPin className="size-4 text-slate-400" />
                    {clientLocation}
                  </div>
                </div>
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 md:col-span-2">
                  <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Bio</p>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{clientBio}</p>
                </div>
              </div>
            </section>

            <section className="space-y-6">
              <div className="rounded-[30px] border border-slate-200 bg-[linear-gradient(135deg,#0f172a_0%,#1e3a8a_50%,#22d3ee_100%)] p-6 text-white shadow-[0_18px_50px_rgba(14,116,144,0.25)]">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-100/80">
                      Próxima movimentação
                    </p>
                    <h3 className="mt-2 text-2xl">Seu painel pessoal</h3>
                    <p className="mt-3 max-w-md text-sm leading-6 text-cyan-50/90">
                      Acompanhe reservas, favoritos e dados de contato em um só lugar, sem depender de registros locais.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/15 bg-white/10 p-3">
                    <ShieldCheck className="size-5" />
                  </div>
                </div>

                <div className="mt-6 rounded-3xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
                  <p className="text-xs uppercase tracking-[0.22em] text-cyan-100/80">
                    {nextReservation ? "Próxima reserva" : "Status atual"}
                  </p>
                  <p className="mt-2 text-lg font-semibold">
                    {nextReservation ? nextReservation.title : "Nenhuma reserva ativa no momento"}
                  </p>
                  <p className="mt-1 text-sm text-cyan-50/85">
                    {nextReservation
                      ? `${nextReservation.date} • ${nextReservation.time}`
                      : "Salve imóveis ou faça uma nova reserva para acompanhar por aqui."}
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
                {stats.map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.05)]"
                  >
                    <p className="text-xs uppercase tracking-[0.22em] text-slate-400">{stat.label}</p>
                    <p className="mt-3 text-3xl text-[#0F172A]">{stat.value}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-500">{stat.detail}</p>
                  </div>
                ))}
              </div>
            </section>
          </motion.div>
        );

      case "reservas":
        return (
          <motion.div
            key="reservas"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {reservations.length === 0 && (
              <div className="rounded-[28px] border border-dashed border-slate-300 bg-white px-6 py-8 text-sm text-slate-500">
                Você ainda não possui reservas registradas.
              </div>
            )}

            {reservations.map((reservation) => (
              <article
                key={reservation.id}
                className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.05)]"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                      Reserva
                    </p>
                    <h3 className="mt-2 text-xl text-[#0F172A]">{reservation.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      {reservation.time === "Dia inteiro"
                        ? `${reservation.date} • Dia inteiro`
                        : `${reservation.date} • ${reservation.time}`}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                      {reservation.date}
                    </div>
                    <span
                      className={`rounded-full px-4 py-2 text-xs font-semibold ${getReservationStatusClass(reservation.status)}`}
                    >
                      {reservation.status}
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </motion.div>
        );

      case "favoritos":
        return (
          <motion.div
            key="favoritos"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid gap-5 lg:grid-cols-2"
          >
            {favoriteItems.length === 0 && (
              <div className="rounded-[28px] border border-dashed border-slate-300 bg-white px-6 py-8 text-sm text-slate-500 lg:col-span-2">
                Nenhum imóvel favorito salvo.
              </div>
            )}

            {favoriteItems.map((item) => (
              <Link
                key={item.id}
                to={`/imovel/${item.id}`}
                className="group block overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-[0_18px_40px_rgba(15,23,42,0.05)] transition-all hover:-translate-y-1 hover:shadow-[0_22px_50px_rgba(15,23,42,0.08)]"
              >
                <div className="relative aspect-[16/10] overflow-hidden">
                  <ImageWithFallback
                    src={item.image}
                    alt={item.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <button
                    type="button"
                    onClick={async (event) => {
                      event.preventDefault();
                      await removeFavoriteProperty(item.id);
                      setFavoriteIds((current) =>
                        current.filter((favoriteId) => favoriteId !== item.id),
                      );
                    }}
                    className="absolute right-4 top-4 rounded-full bg-white/90 p-2 text-rose-500 shadow-md backdrop-blur transition-colors hover:bg-white"
                  >
                    <Heart className="size-4 fill-current" />
                  </button>
                </div>

                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-xl text-[#0F172A]">{item.title}</h3>
                      <p className="mt-2 text-sm text-slate-500">{item.location}</p>
                    </div>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                      Favorito
                    </span>
                  </div>

                  <div className="mt-4 flex items-center justify-between text-sm">
                    <span className="text-slate-400">Preço</span>
                    <span className="font-semibold text-[#0F172A]">
                      {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                        maximumFractionDigits: 0,
                      }).format(item.price)}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </motion.div>
        );

      case "contato":
        return (
          <motion.div
            key="contato"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]"
          >
            <section className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-[#0F172A] p-3 text-white">
                  <MessageCircle className="size-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                    Contato
                  </p>
                  <h2 className="mt-1 text-2xl text-[#0F172A]">Canais principais</h2>
                </div>
              </div>

              <div className="mt-6 grid gap-4">
                <a
                  href={clientUser?.email ? `mailto:${clientUser.email}` : undefined}
                  className="flex items-center justify-between rounded-[26px] border border-slate-200 bg-slate-50 px-5 py-4 transition hover:border-cyan-200 hover:bg-cyan-50"
                >
                  <div className="flex items-center gap-4">
                    <div className="rounded-2xl bg-white p-3 text-slate-700 shadow-sm">
                      <Mail className="size-5" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                        E-mail
                      </p>
                      <p className="mt-1 text-base text-[#0F172A]">{clientUser?.email}</p>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-slate-500">Abrir</span>
                </a>

                <a
                  href={normalizedPhoneDigits ? `tel:${normalizedPhoneDigits}` : undefined}
                  className="flex items-center justify-between rounded-[26px] border border-slate-200 bg-slate-50 px-5 py-4 transition hover:border-cyan-200 hover:bg-cyan-50"
                >
                  <div className="flex items-center gap-4">
                    <div className="rounded-2xl bg-white p-3 text-slate-700 shadow-sm">
                      <Phone className="size-5" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                        Telefone
                      </p>
                      <p className="mt-1 text-base text-[#0F172A]">{clientPhone}</p>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-slate-500">Ligar</span>
                </a>

                <a
                  href={whatsappHref || undefined}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between rounded-[26px] border border-emerald-200 bg-emerald-50 px-5 py-4 transition hover:border-emerald-300 hover:bg-emerald-100"
                >
                  <div className="flex items-center gap-4">
                    <div className="rounded-2xl bg-white p-3 text-emerald-600 shadow-sm">
                      <MessageCircle className="size-5" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-500">
                        WhatsApp
                      </p>
                      <p className="mt-1 text-base text-emerald-900">
                        {normalizedPhoneDigits ? "Abrir conversa rápida" : "Cadastre um telefone válido"}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-emerald-700">Conversar</span>
                </a>
              </div>
            </section>

            <section className="space-y-6">
              <div className="rounded-[30px] border border-slate-200 bg-[linear-gradient(135deg,#082f49_0%,#0369a1_55%,#67e8f9_100%)] p-6 text-white shadow-[0_18px_50px_rgba(8,47,73,0.22)]">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-100/80">
                  Atendimento
                </p>
                <h3 className="mt-2 text-2xl">Contato centralizado</h3>
                <p className="mt-3 text-sm leading-6 text-cyan-50/90">
                  Usamos seus dados salvos para confirmar reservas, alinhar horários e agilizar o retorno da equipe.
                </p>

                <div className="mt-6 grid gap-3">
                  <div className="rounded-[24px] border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-sm">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-100/75">
                      Preferência atual
                    </p>
                    <p className="mt-2 text-sm font-medium">
                      {normalizedPhoneDigits ? "Telefone e WhatsApp prontos para contato" : "Atualize seu telefone para liberar WhatsApp"}
                    </p>
                  </div>

                  <div className="rounded-[24px] border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-sm">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-100/75">
                      E-mail vinculado
                    </p>
                    <p className="mt-2 text-sm font-medium">{clientUser?.email}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                  Dica
                </p>
                <h3 className="mt-2 text-xl text-[#0F172A]">Mantenha seus dados atualizados</h3>
                <p className="mt-3 text-sm leading-7 text-slate-500">
                  Quando seu telefone e sua localização estão corretos, a confirmação da reserva fica mais rápida e a equipe consegue te encontrar no canal certo sem fricção.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setFeedback("");
                    setIsEditing(true);
                  }}
                  className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#0F172A] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
                >
                  <Pencil className="size-4" />
                  Atualizar contato
                </button>
              </div>
            </section>
          </motion.div>
        );

      case "configuracoes":
        return (
          <motion.div
            key="configuracoes"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid gap-5 lg:grid-cols-2"
          >
            <button
              type="button"
              onClick={() => {
                setFeedback("");
                setIsEditing(true);
              }}
              className="rounded-[30px] border border-slate-200 bg-white p-6 text-left shadow-[0_18px_40px_rgba(15,23,42,0.05)] transition-all hover:-translate-y-1 hover:shadow-[0_22px_50px_rgba(15,23,42,0.08)]"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                    Conta
                  </p>
                  <h3 className="mt-2 text-xl text-[#0F172A]">Editar perfil</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Atualize nome, telefone, localização e bio sem sair da página.
                  </p>
                </div>
                <div className="rounded-2xl bg-slate-100 p-3 text-slate-500">
                  <Pencil className="size-5" />
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="rounded-[30px] border border-rose-100 bg-[linear-gradient(135deg,#fff1f2_0%,#ffffff_100%)] p-6 text-left shadow-[0_18px_40px_rgba(244,63,94,0.08)] transition-all hover:-translate-y-1 hover:shadow-[0_22px_50px_rgba(244,63,94,0.12)]"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-rose-400">
                    Sessão
                  </p>
                  <h3 className="mt-2 text-xl text-rose-700">Sair</h3>
                  <p className="mt-2 text-sm leading-6 text-rose-500">
                    Encerrar a sessão atual com segurança neste dispositivo.
                  </p>
                </div>
                <div className="rounded-2xl bg-rose-100 p-3 text-rose-500">
                  <LogOut className="size-5" />
                </div>
              </div>
            </button>
          </motion.div>
        );
    }
  };

  if (isLoadingSession) {
    return (
      <div className="min-h-screen bg-[linear-gradient(180deg,#f5f7fb_0%,#eef4ff_40%,#ffffff_100%)]">
        <Header />
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-[36px] border border-slate-200 bg-white shadow-[0_24px_60px_rgba(15,23,42,0.06)]">
            <div className="h-40 animate-pulse bg-[linear-gradient(135deg,#dbeafe_0%,#bfdbfe_45%,#e0f2fe_100%)]" />
            <div className="px-6 pb-8 sm:px-8">
              <div className="-mt-14 flex flex-col gap-5 lg:flex-row">
                <div className="size-28 animate-pulse rounded-[32px] border-4 border-white bg-slate-200" />
                <div className="flex-1 space-y-3 pt-2">
                  <div className="h-8 w-56 animate-pulse rounded-full bg-slate-200" />
                  <div className="h-4 w-full max-w-2xl animate-pulse rounded-full bg-slate-100" />
                  <div className="h-4 w-full max-w-xl animate-pulse rounded-full bg-slate-100" />
                </div>
              </div>
              <div className="mt-8 grid gap-4 lg:grid-cols-3">
                <div className="h-40 animate-pulse rounded-[28px] bg-slate-100" />
                <div className="h-40 animate-pulse rounded-[28px] bg-slate-100" />
                <div className="h-40 animate-pulse rounded-[28px] bg-slate-100" />
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!clientUser) {
    return <Navigate to="/cliente/login" replace />;
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f5f7fb_0%,#eef4ff_40%,#ffffff_100%)]">
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="overflow-hidden rounded-[36px] border border-slate-200 bg-white shadow-[0_24px_60px_rgba(15,23,42,0.06)]">
          <div className="relative overflow-hidden bg-[linear-gradient(120deg,#0f172a_0%,#1d4ed8_45%,#22d3ee_100%)] px-6 pb-14 pt-8 sm:px-8 lg:px-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.28),transparent_32%),radial-gradient(circle_at_bottom_left,rgba(125,211,252,0.35),transparent_26%)]" />

            <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-end">
                <div className="flex size-28 items-center justify-center rounded-[32px] border-4 border-white/80 bg-white/15 text-3xl font-semibold text-white shadow-[0_18px_50px_rgba(15,23,42,0.25)] backdrop-blur-md">
                  {avatarFallback}
                </div>

                <div className="max-w-2xl text-white">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-100/85">
                    Área do cliente
                  </p>
                  <h1 className="mt-3 text-3xl leading-tight sm:text-4xl">{clientName}</h1>
                  <p className="mt-3 text-sm leading-7 text-cyan-50/90 sm:text-base">
                    {clientBio}
                  </p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[320px]">
                <div className="rounded-[24px] border border-white/15 bg-white/12 px-4 py-3 text-white backdrop-blur-md">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-100/75">
                    Localização
                  </p>
                  <p className="mt-2 text-sm font-medium">{clientLocation}</p>
                </div>
                <div className="rounded-[24px] border border-white/15 bg-white/12 px-4 py-3 text-white backdrop-blur-md">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-100/75">
                    Telefone
                  </p>
                  <p className="mt-2 text-sm font-medium">{clientPhone}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="px-4 pb-8 sm:px-6 lg:px-8">
            <div className="-mt-8 rounded-[30px] border border-slate-200 bg-white/95 p-4 shadow-[0_18px_45px_rgba(15,23,42,0.08)] backdrop-blur sm:p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-wrap gap-2">
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
                            ? "bg-[#0F172A] text-white shadow-lg shadow-slate-200"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-[#0F172A]"
                        }`}
                      >
                        <Icon className="size-4" />
                        {tab.label}
                      </button>
                    );
                  })}
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setFeedback("");
                      setIsEditing(true);
                    }}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                  >
                    <Pencil className="size-4" />
                    Editar perfil
                  </button>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="inline-flex items-center gap-2 rounded-full bg-rose-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-rose-600"
                  >
                    <LogOut className="size-4" />
                    Sair
                  </button>
                </div>
              </div>
            </div>

            {feedback && (
              <div className="mt-6 rounded-[24px] border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm text-cyan-800">
                {feedback}
              </div>
            )}

            <div className="mt-6">{renderTabContent()}</div>
          </div>
        </section>
      </main>

      {isEditing && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="w-full max-w-3xl rounded-[32px] border border-slate-200 bg-white p-6 shadow-2xl sm:p-7"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                  Atualização de perfil
                </p>
                <h2 className="mt-2 text-2xl text-[#0F172A]">Edite suas informações</h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Esses dados ajudam a equipe a confirmar reservas e contato com mais agilidade.
                </p>
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
                <span className="mb-2 block text-sm font-medium text-slate-600">Nome</span>
                <input
                  value={form.name}
                  onChange={(event) => handleFormChange("name", event.target.value)}
                  className="w-full rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-cyan-400 focus:bg-white"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-600">Email</span>
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) => handleFormChange("email", event.target.value)}
                  className="w-full rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-cyan-400 focus:bg-white"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-600">Telefone</span>
                <input
                  value={form.phone}
                  onChange={(event) => handleFormChange("phone", event.target.value)}
                  className="w-full rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-cyan-400 focus:bg-white"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-600">Localização</span>
                <input
                  value={form.location}
                  onChange={(event) => handleFormChange("location", event.target.value)}
                  className="w-full rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-cyan-400 focus:bg-white"
                />
              </label>

              <label className="block sm:col-span-2">
                <span className="mb-2 block text-sm font-medium text-slate-600">Bio</span>
                <textarea
                  value={form.bio}
                  onChange={(event) => handleFormChange("bio", event.target.value)}
                  rows={4}
                  className="w-full rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-cyan-400 focus:bg-white"
                />
              </label>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="rounded-[20px] border border-slate-200 px-5 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="inline-flex items-center justify-center gap-2 rounded-[20px] bg-[linear-gradient(135deg,#0f172a_0%,#1d4ed8_55%,#22d3ee_100%)] px-5 py-3 text-sm font-medium text-white shadow-lg shadow-cyan-200"
              >
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
