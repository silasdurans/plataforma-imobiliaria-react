/**
 * Painel administrativo da plataforma. Permite acompanhar dados, imóveis e operações de gestão.
 */
import { useState, useEffect, useMemo } from "react";
import { motion } from "motion/react";
import { 
  Building2, 
  Users, 
  DollarSign, 
  TrendingUp, 
  Calendar,
  Eye,
  Bell,
  MessageSquare,
  Star,
  MapPin,
  Filter,
  Download,
  Plus,
  Edit,
  Trash2,
  LogOut,
  Menu,
  X,
  BarChart3,
  PieChart,
  Activity,
  Clock,
  CheckCircle2,
  AlertCircle,
  Search,
  Save,
  X as CloseIcon
} from "lucide-react";
import { useNavigate } from "react-router";
import { 
  getAllProperties, 
  addProperty, 
  updateProperty, 
  deleteProperty, 
  renderizarImoveis,
  type Property 
} from "../../data/properties";
import {
  useSchedules,
  addSchedule as createSchedule,
  updateSchedule as persistScheduleUpdate,
  deleteSchedule as removeSchedule,
  type ScheduleItem,
  type ScheduleStatus,
} from "../../data/schedules";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const schedules = useSchedules();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPropertyModal, setShowPropertyModal] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [propertyForm, setPropertyForm] = useState({
    title: '',
    description: '',
    price: 0,
    location: '',
    image: '',
    bedrooms: 0,
    bathrooms: 0,
    area: 0,
    images: [''],
    type: 'Escritório' as Property['type'],
    status: 'disponivel' as Property['status']
  });

  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<ScheduleItem | null>(null);
  const [scheduleForm, setScheduleForm] = useState<ScheduleItem>({
    id: 0,
    propertyTitle: '',
    clientName: '',
    clientEmail: '',
    date: '',
    time: '',
    status: 'agendado',
    notes: '',
    createdAt: ''
  });

  useEffect(() => {
    // Verificar autenticação
    const isAuthenticated = localStorage.getItem("admin_authenticated");
    if (!isAuthenticated) {
      navigate("/admin/login");
    }

    // Carregar propriedades
    loadProperties();
  }, [navigate]);

  useEffect(() => {
    const syncProperties = () => {
      setProperties(renderizarImoveis());
    };

    window.addEventListener("grupo-sp-properties:updated", syncProperties);
    return () => window.removeEventListener("grupo-sp-properties:updated", syncProperties);
  }, []);

  const loadProperties = async () => {
    try {
      setLoading(true);
      const data = await getAllProperties();
      setProperties(data);
    } catch (error) {
      console.error('Erro ao carregar propriedades:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 0,
    }).format(value);

  const formatRelativeTime = (value?: string) => {
    if (!value) return "Agora";

    const target = new Date(value).getTime();
    if (Number.isNaN(target)) return "Agora";

    const diffInMinutes = Math.max(0, Math.round((Date.now() - target) / 60000));

    if (diffInMinutes < 1) return "Agora";
    if (diffInMinutes < 60) return `${diffInMinutes} min atrás`;

    const diffInHours = Math.round(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} h atrás`;

    const diffInDays = Math.round(diffInHours / 24);
    return `${diffInDays} d atrás`;
  };

  // Funções de análise de dados
  const getPropertyTypeDistribution = () => {
    const typeCount = properties.reduce((acc, property) => {
      acc[property.type] = (acc[property.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const colors = {
      'apartamento': '#3B82F6',
      'casa': '#10B981',
      'terreno': '#F59E0B',
      'sala comercial': '#06B6D4',
      'escritório': '#8B5CF6',
      'escritorio': '#8B5CF6',
      'coworking': '#14B8A6',
      'loja': '#F97316',
    };

    return Object.entries(typeCount).map(([type, count]) => ({
      name: type.charAt(0).toUpperCase() + type.slice(1),
      value: count,
      color: colors[type as keyof typeof colors] || '#6B7280'
    }));
  };

  const getPriceByLocation = () => {
    const locationPrices = properties.reduce((acc, property) => {
      const location = property.location.split(',')[0].trim(); // Pega apenas a cidade
      if (!acc[location]) {
        acc[location] = { total: 0, count: 0 };
      }
      acc[location].total += property.price;
      acc[location].count += 1;
      return acc;
    }, {} as Record<string, { total: number; count: number }>);

    return Object.entries(locationPrices).map(([location, data]) => ({
      location,
      avgPrice: Math.round(data.total / data.count),
      count: data.count
    })).sort((a, b) => b.avgPrice - a.avgPrice);
  };

  const getStatusDistribution = () => {
    const statusCount = properties.reduce((acc, property) => {
      acc[property.status] = (acc[property.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(statusCount).map(([status, count]) => ({
      status: status.charAt(0).toUpperCase() + status.slice(1),
      count,
      percentage: Math.round((count / properties.length) * 100)
    }));
  };

  const getPriceTrends = () => {
    const formatter = new Intl.DateTimeFormat('pt-BR', { month: 'short' });
    const months = Array.from({ length: 6 }, (_, index) => {
      const date = new Date();
      date.setDate(1);
      date.setMonth(date.getMonth() - (5 - index));
      return date;
    });

    return months.map((monthDate) => {
      const monthKey = `${monthDate.getFullYear()}-${monthDate.getMonth()}`;
      const monthProperties = properties.filter((property) => {
        const createdAt = property.created_at ? new Date(property.created_at) : null;
        if (!createdAt || Number.isNaN(createdAt.getTime())) {
          return false;
        }
        return `${createdAt.getFullYear()}-${createdAt.getMonth()}` === monthKey;
      });

      const avgPrice = monthProperties.length > 0
        ? Math.round(monthProperties.reduce((sum, property) => sum + property.price, 0) / monthProperties.length)
        : 0;

      return {
        month: formatter.format(monthDate).replace('.', ''),
        avgPrice,
        listings: monthProperties.length,
      };
    });
  };

  const getAnalyticsStats = () => {
    const totalValue = properties.reduce((sum, p) => sum + p.price, 0);
    const avgPrice = properties.length > 0 ? totalValue / properties.length : 0;
    const totalArea = properties.reduce((sum, p) => sum + p.area, 0);
    const avgArea = properties.length > 0 ? totalArea / properties.length : 0;
    const availableProperties = properties.filter((p) => p.status === 'disponivel').length;
    const bookedSchedules = schedules.filter((item) => item.status !== 'cancelado').length;
    const topLocation = getPriceByLocation()[0]?.location ?? 'Sem dados';

    return {
      totalProperties: properties.length,
      availableProperties,
      bookedSchedules,
      totalValue: Math.round(totalValue),
      avgPrice: Math.round(avgPrice),
      avgArea: Math.round(avgArea),
      mostExpensive: properties.length > 0 ? Math.max(...properties.map(p => p.price)) : 0,
      cheapest: properties.length > 0 ? Math.min(...properties.map(p => p.price)) : 0,
      topLocation,
    };
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_authenticated");
    navigate("/admin/login");
  };

  const handleAddProperty = () => {
    setEditingProperty(null);
    setPropertyForm({
      title: '',
      description: '',
      price: 0,
      location: '',
      image: '',
      bedrooms: 0,
      bathrooms: 0,
      area: 0,
      images: [''],
      type: 'Escritório',
      status: 'disponivel'
    });
    setShowPropertyModal(true);
  };

  const handleEditProperty = (property: Property) => {
    setEditingProperty(property);
    setPropertyForm({
      title: property.title,
      description: property.description,
      price: property.price,
      location: property.location,
      image: property.image,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      area: property.area,
      images: property.images,
      type: property.type,
      status: property.status
    });
    setShowPropertyModal(true);
  };

  const handleDeleteProperty = async (id: string) => {
    if (confirm('Tem certeza que deseja deletar este imóvel?')) {
      try {
        await deleteProperty(id);
        await loadProperties();
      } catch (error) {
        console.error('Erro ao deletar propriedade:', error);
        alert('Erro ao deletar propriedade');
      }
    }
  };

  const handleSaveProperty = async () => {
    if (
      !propertyForm.title.trim() ||
      !propertyForm.description.trim() ||
      !propertyForm.location.trim() ||
      !propertyForm.image.trim() ||
      propertyForm.price <= 0
    ) {
      alert('Preencha titulo, descricao, preco, localizacao e imagem do imovel.');
      return;
    }

    const payload = {
      ...propertyForm,
      image: propertyForm.image,
      images: [propertyForm.image],
      area: propertyForm.area || 60,
      bedrooms: propertyForm.bedrooms || 2,
      bathrooms: propertyForm.bathrooms || 1,
      size: propertyForm.area || 60,
      capacity: Math.max(2, propertyForm.bedrooms * 2 || 4),
      rating: editingProperty?.rating ?? 4.8,
      features: editingProperty?.features ?? ["Cadastro via painel administrativo"],
      lat: editingProperty?.lat ?? -2.5297,
      lng: editingProperty?.lng ?? -44.3028,
    };

    try {
      if (editingProperty) {
        await updateProperty(editingProperty.id, payload);
      } else {
        await addProperty(payload);
      }
      setShowPropertyModal(false);
      await loadProperties();
    } catch (error) {
      console.error('Erro ao salvar propriedade:', error);
      alert('Erro ao salvar propriedade');
    }
  };

  const handleImageChange = (value: string) => {
    setPropertyForm({ ...propertyForm, image: value, images: [value] });
  };

  const handleAddSchedule = () => {
    setEditingSchedule(null);
    setScheduleForm({
      id: 0,
      propertyTitle: '',
      clientName: '',
      clientEmail: '',
      date: '',
      time: '',
      status: 'agendado',
      notes: '',
      createdAt: ''
    });
    setShowScheduleModal(true);
  };

  const handleEditSchedule = (schedule: ScheduleItem) => {
    setEditingSchedule(schedule);
    setScheduleForm(schedule);
    setShowScheduleModal(true);
  };

  const handleDeleteSchedule = async (id: number) => {
    if (confirm('Deseja excluir este agendamento?')) {
      await removeSchedule(id);
    }
  };

  const handleSaveSchedule = async () => {
    if (
      !scheduleForm.propertyTitle.trim() ||
      !scheduleForm.clientName.trim() ||
      !scheduleForm.clientEmail.trim() ||
      !scheduleForm.date ||
      !scheduleForm.time
    ) {
      alert('Preencha imóvel, nome do cliente, e-mail, data e horário.');
      return;
    }

    if (editingSchedule) {
      await persistScheduleUpdate(editingSchedule.id, scheduleForm);
    } else {
      await createSchedule({
        propertyTitle: scheduleForm.propertyTitle,
        clientName: scheduleForm.clientName,
        clientEmail: scheduleForm.clientEmail,
        clientId: scheduleForm.clientId,
        date: scheduleForm.date,
        time: scheduleForm.time,
        status: scheduleForm.status,
        notes: scheduleForm.notes,
      });
    }
    setShowScheduleModal(false);
  };

  const getScheduleSummary = () => {
    const total = schedules.length;
    const confirmed = schedules.filter((item) => item.status === 'confirmado').length;
    const pending = schedules.filter((item) => item.status === 'agendado').length;
    const canceled = schedules.filter((item) => item.status === 'cancelado').length;

    return { total, confirmed, pending, canceled };
  };
  const scheduleSummary = useMemo(() => getScheduleSummary(), [schedules]);
  const analyticsStats = useMemo(() => getAnalyticsStats(), [properties, schedules]);

  const overviewStats = useMemo(() => [
    {
      label: "Total de Imóveis",
      value: analyticsStats.totalProperties,
      change: `${analyticsStats.availableProperties} disponíveis`,
      icon: Building2,
      color: "from-blue-500 to-cyan-600",
      bgColor: "from-blue-50 to-cyan-50",
    },
    {
      label: "Agendamentos",
      value: scheduleSummary.total.toLocaleString(),
      change: `${scheduleSummary.confirmed} confirmados`,
      icon: Calendar,
      color: "from-purple-500 to-violet-600",
      bgColor: "from-purple-50 to-violet-50",
    },
    {
      label: "Ticket Médio",
      value: formatCurrency(analyticsStats.avgPrice),
      change: `${analyticsStats.avgArea} m² em média`,
      icon: DollarSign,
      color: "from-green-500 to-emerald-600",
      bgColor: "from-green-50 to-emerald-50",
    },
    {
      label: "Carteira Ativa",
      value: formatCurrency(analyticsStats.totalValue),
      change: analyticsStats.topLocation,
      icon: TrendingUp,
      color: "from-orange-500 to-amber-600",
      bgColor: "from-orange-50 to-amber-50",
    },
  ], [analyticsStats, scheduleSummary]);

  const recentActivities = useMemo(() => {
    const scheduleActivities = schedules
      .slice()
      .sort((first, second) =>
        new Date(second.createdAt ?? 0).getTime() - new Date(first.createdAt ?? 0).getTime(),
      )
      .slice(0, 4)
      .map((schedule) => ({
        id: `schedule-${schedule.id}`,
        type: "booking" as const,
        property: schedule.propertyTitle,
        user: schedule.clientName,
        time: formatRelativeTime(schedule.createdAt),
        status: schedule.status,
      }));

    const recentProperties = properties
      .slice()
      .sort((first, second) =>
        new Date(second.created_at ?? 0).getTime() - new Date(first.created_at ?? 0).getTime(),
      )
      .slice(0, 2)
      .map((property) => ({
        id: `property-${property.id}`,
        type: "property" as const,
        property: property.title,
        user: "Cadastro do sistema",
        time: formatRelativeTime(property.created_at),
        status: property.status,
      }));

    return [...scheduleActivities, ...recentProperties].slice(0, 6);
  }, [properties, schedules]);

  const topProperties = useMemo(() => {
    return properties
      .map((property) => {
        const leads = schedules.filter((schedule) => schedule.propertyTitle === property.title).length;
        const confirmed = schedules.filter(
          (schedule) => schedule.propertyTitle === property.title && schedule.status === "confirmado",
        ).length;

        return {
          id: property.id,
          name: property.title,
          leads,
          confirmed,
          revenue: formatCurrency(property.price),
          rating: property.rating ?? 0,
        };
      })
      .sort((first, second) => {
        if (second.leads !== first.leads) return second.leads - first.leads;
        if (second.confirmed !== first.confirmed) return second.confirmed - first.confirmed;
        return second.rating - first.rating;
      })
      .slice(0, 4);
  }, [properties, schedules]);

  const getPropertyStatusStyles = (status: Property["status"]) => {
    if (status === "vendido") return "bg-rose-100 text-rose-700";
    if (status === "alugado") return "bg-amber-100 text-amber-700";
    return "bg-emerald-100 text-emerald-700";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full bg-gradient-to-br from-[#0A0E27] via-[#0F172A] to-[#1a1f3a] text-white transition-all duration-300 z-50 ${sidebarOpen ? "w-72" : "w-20"}`}>
        <div className="p-6">
          {/* Logo */}
          <div className="flex items-center justify-between mb-8">
            {sidebarOpen ? (
              <div className="flex items-center gap-3">
                <div className="size-10 bg-white rounded-lg flex items-center justify-center">
                  <Building2 className="size-6 text-[#0F172A]" />
                </div>
                <div>
                  <div className="font-bold">Grupo SP</div>
                  <div className="text-xs text-blue-300">Admin</div>
                </div>
              </div>
            ) : (
              <div className="size-10 bg-white rounded-lg flex items-center justify-center mx-auto">
                <Building2 className="size-6 text-[#0F172A]" />
              </div>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              {sidebarOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>

          {/* Navigation */}
          <nav className="space-y-2">
            {[
              { id: "overview", icon: BarChart3, label: "Visão Geral" },
              { id: "properties", icon: Building2, label: "Imóveis" },
              { id: "analytics", icon: PieChart, label: "Análises" },
              { id: "notifications", icon: Bell, label: "Notificações", badge: 12 },
              { id: "calendar", icon: Calendar, label: "Agenda" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  activeTab === item.id
                    ? "bg-gradient-to-r from-blue-600 to-cyan-600 shadow-lg"
                    : "hover:bg-white/10"
                }`}
              >
                <item.icon className="size-5" />
                {sidebarOpen && (
                  <>
                    <span className="flex-1 text-left">{item.label}</span>
                    {item.badge && (
                      <span className="px-2 py-0.5 bg-red-500 rounded-full text-xs">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </button>
            ))}
          </nav>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-500/20 transition-all mt-auto absolute bottom-6 left-6 right-6"
          >
            <LogOut className="size-5" />
            {sidebarOpen && <span>Sair</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`transition-all duration-300 ${sidebarOpen ? "ml-72" : "ml-20"}`}>
        {/* Header */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
          <div className="px-8 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-[#0F172A]">Painel Administrativo</h1>
                <p className="text-slate-500">Bem-vindo de volta, Administrador</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Buscar..."
                    className="pl-10 pr-4 py-2 bg-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                  />
                </div>
                <div className="size-10 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-full flex items-center justify-center text-white font-bold">
                  A
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-8">
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {overviewStats.map((stat, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className={`bg-gradient-to-br ${stat.bgColor} rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-lg transition-shadow`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 bg-gradient-to-br ${stat.color} rounded-xl shadow-lg`}>
                        <stat.icon className="size-6 text-white" />
                      </div>
                      <span className="text-sm font-semibold text-slate-700 bg-white/80 px-2 py-1 rounded-full">
                        {stat.change}
                      </span>
                    </div>
                    <div className="text-3xl font-bold text-[#0F172A] mb-1">{stat.value}</div>
                    <div className="text-sm text-slate-600">{stat.label}</div>
                  </motion.div>
                ))}
              </div>

              {/* Charts Row */}
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Recent Activity */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-[#0F172A] flex items-center gap-2">
                      <Activity className="size-5 text-blue-600" />
                      Atividade Recente
                    </h2>
                    <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                      Ver tudo
                    </button>
                  </div>
                  <div className="space-y-4">
                    {recentActivities.map((activity) => (
                      <div key={activity.id} className="flex items-start gap-4 p-3 hover:bg-slate-50 rounded-xl transition-colors">
                        <div className={`p-2 rounded-lg ${
                          activity.type === "booking" ? "bg-purple-100" : "bg-blue-100"
                        }`}>
                          {activity.type === "booking" && <Calendar className="size-4 text-purple-600" />}
                          {activity.type === "property" && <Building2 className="size-4 text-blue-600" />}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-[#0F172A]">{activity.user}</div>
                          <div className="text-sm text-slate-600">{activity.property}</div>
                          <div className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                            <Clock className="size-3" />
                            {activity.time}
                          </div>
                        </div>
                        {"status" in activity && activity.status && (
                          <div className="text-xs font-medium text-slate-500 capitalize">
                            {activity.status}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* Top Properties */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-[#0F172A] flex items-center gap-2">
                      <TrendingUp className="size-5 text-green-600" />
                      Imóveis em Destaque
                    </h2>
                    <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                      Ver tudo
                    </button>
                  </div>
                  <div className="space-y-4">
                    {topProperties.map((property, index) => (
                      <div key={property.id} className="flex items-center gap-4 p-4 bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl hover:shadow-md transition-shadow">
                        <div className="size-12 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                          #{index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-[#0F172A]">{property.name}</div>
                          <div className="flex items-center gap-4 mt-1 text-sm text-slate-600">
                            <span className="flex items-center gap-1">
                              <Users className="size-3" />
                              {property.leads}
                            </span>
                            <span className="flex items-center gap-1">
                              <CheckCircle2 className="size-3" />
                              {property.confirmed}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-green-600">{property.revenue}</div>
                          <div className="text-xs text-slate-500">Preço base</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </div>

              {/* Properties Table */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-[#0F172A] flex items-center gap-2">
                    <Building2 className="size-5 text-blue-600" />
                    Todos os Imóveis
                  </h2>
                  <div className="flex items-center gap-3">
                    <button className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center gap-2">
                      <Filter className="size-4" />
                      Filtrar
                    </button>
                    <button className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center gap-2">
                      <Download className="size-4" />
                      Exportar
                    </button>
                    <button 
                      onClick={handleAddProperty}
                      className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                    >
                      <Plus className="size-4" />
                      Novo Imóvel
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Imóvel</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Localização</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Preço</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Status</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Avaliação</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {properties.slice(0, 8).map((property) => (
                        <tr key={property.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                          <td className="py-4 px-4">
                            <div className="font-medium text-[#0F172A]">{property.title}</div>
                            <div className="text-sm text-slate-500">{property.type}</div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-1 text-sm text-slate-600">
                              <MapPin className="size-3" />
                              {property.location}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="font-semibold text-[#0F172A]">
                              R$ {property.price.toLocaleString()}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm ${getPropertyStatusStyles(property.status)}`}>
                              <CheckCircle2 className="size-3" />
                              {property.status}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-1">
                              <Star className="size-4 fill-yellow-400 text-yellow-400" />
                              <span className="font-medium">{property.rating ?? '-'}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              <button className="p-2 hover:bg-blue-50 rounded-lg transition-colors">
                                <Eye className="size-4 text-blue-600" />
                              </button>
                              <button onClick={() => handleEditProperty(property)} className="p-2 hover:bg-green-50 rounded-lg transition-colors">
                                <Edit className="size-4 text-green-600" />
                              </button>
                              <button onClick={() => handleDeleteProperty(property.id)} className="p-2 hover:bg-red-50 rounded-lg transition-colors">
                                <Trash2 className="size-4 text-red-600" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            </div>
          )}

          {/* Properties Tab */}
          {activeTab === "properties" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-[#0F172A]">Gerenciamento de Imóveis</h2>
                <button
                  onClick={handleAddProperty}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                >
                  <Plus className="size-5" />
                  Novo Imóvel
                </button>
              </div>

              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin size-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-slate-600">Carregando imóveis...</p>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="text-left py-4 px-6 text-sm font-semibold text-slate-600">Imóvel</th>
                          <th className="text-left py-4 px-6 text-sm font-semibold text-slate-600">Localização</th>
                          <th className="text-left py-4 px-6 text-sm font-semibold text-slate-600">Preço</th>
                          <th className="text-left py-4 px-6 text-sm font-semibold text-slate-600">Tipo</th>
                          <th className="text-left py-4 px-6 text-sm font-semibold text-slate-600">Status</th>
                          <th className="text-left py-4 px-6 text-sm font-semibold text-slate-600">Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {properties.map((property) => (
                          <tr key={property.id} className="border-t border-slate-100 hover:bg-slate-50 transition-colors">
                            <td className="py-4 px-6">
                              <div className="font-medium text-[#0F172A]">{property.title}</div>
                              <div className="text-sm text-slate-500">{property.description?.slice(0, 50)}...</div>
                            </td>
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-1 text-sm text-slate-600">
                                <MapPin className="size-4" />
                                {property.location}
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <div className="font-semibold text-[#0F172A]">
                                R$ {property.price.toLocaleString()}
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <span className="capitalize text-sm text-slate-600">{property.type}</span>
                            </td>
                            <td className="py-4 px-6">
                              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm ${
                                property.status === 'disponivel' ? 'bg-green-100 text-green-700' :
                                property.status === 'vendido' ? 'bg-red-100 text-red-700' :
                                'bg-yellow-100 text-yellow-700'
                              }`}>
                                {property.status === 'disponivel' && <CheckCircle2 className="size-3" />}
                                {property.status === 'vendido' && <AlertCircle className="size-3" />}
                                {property.status === 'alugado' && <Clock className="size-3" />}
                                {property.status}
                              </span>
                            </td>
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleEditProperty(property)}
                                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                  title="Editar"
                                >
                                  <Edit className="size-4" />
                                </button>
                                <button
                                  onClick={() => property.id && handleDeleteProperty(property.id)}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Deletar"
                                >
                                  <Trash2 className="size-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {properties.length === 0 && (
                    <div className="text-center py-12">
                      <Building2 className="size-12 text-slate-400 mx-auto mb-4" />
                      <p className="text-slate-600">Nenhum imóvel cadastrado</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === "analytics" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-[#0F172A]">Análises e Relatórios</h2>
                <div className="flex items-center gap-3">
                  <button className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center gap-2">
                    <Download className="size-4" />
                    Exportar Relatório
                  </button>
                  <button className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center gap-2">
                    <Filter className="size-4" />
                    Filtrar Período
                  </button>
                </div>
              </div>

              {/* Analytics Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(() => {
                  const stats = getAnalyticsStats();
                  return [
                    { 
                      label: "Total de Imóveis", 
                      value: stats.totalProperties, 
                      icon: Building2, 
                      color: "from-blue-500 to-cyan-600"
                    },
                    { 
                      label: "Valor Total do Portfólio", 
                      value: `R$ ${(stats.totalValue / 1000000).toFixed(1)}M`, 
                      icon: DollarSign, 
                      color: "from-green-500 to-emerald-600"
                    },
                    { 
                      label: "Preço Médio", 
                      value: `R$ ${(stats.avgPrice / 1000).toFixed(0)}K`, 
                      icon: TrendingUp, 
                      color: "from-purple-500 to-violet-600"
                    },
                    { 
                      label: "Área Média", 
                      value: `${stats.avgArea}m²`, 
                      icon: Activity, 
                      color: "from-orange-500 to-amber-600"
                    },
                    { 
                      label: "Imóvel Mais Caro", 
                      value: `R$ ${(stats.mostExpensive / 1000000).toFixed(1)}M`, 
                      icon: Star, 
                      color: "from-red-500 to-pink-600"
                    },
                    { 
                      label: "Imóvel Mais Barato", 
                      value: `R$ ${(stats.cheapest / 1000).toFixed(0)}K`, 
                      icon: Clock, 
                      color: "from-indigo-500 to-blue-600"
                    },
                  ].map((stat, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className={`p-3 bg-gradient-to-br ${stat.color} rounded-xl shadow-lg`}>
                          <stat.icon className="size-6 text-white" />
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-[#0F172A] mb-1">{stat.value}</div>
                      <div className="text-sm text-slate-600">{stat.label}</div>
                    </motion.div>
                  ));
                })()}
              </div>

              {/* Charts Grid */}
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Property Type Distribution */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm"
                >
                  <h3 className="text-xl font-bold text-[#0F172A] mb-6 flex items-center gap-2">
                    <PieChart className="size-5 text-blue-600" />
                    Distribuição por Tipo
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPieChart>
                      <Pie
                        data={getPropertyTypeDistribution()}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {getPropertyTypeDistribution().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </motion.div>

                {/* Price by Location */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm"
                >
                  <h3 className="text-xl font-bold text-[#0F172A] mb-6 flex items-center gap-2">
                    <BarChart3 className="size-5 text-green-600" />
                    Preço Médio por Localização
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={getPriceByLocation()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="location" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`R$ ${value.toLocaleString()}`, 'Preço Médio']} />
                      <Bar dataKey="avgPrice" fill="#10B981" />
                    </BarChart>
                  </ResponsiveContainer>
                </motion.div>

                {/* Status Distribution */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm"
                >
                  <h3 className="text-xl font-bold text-[#0F172A] mb-6 flex items-center gap-2">
                    <Activity className="size-5 text-purple-600" />
                    Status dos Imóveis
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={getStatusDistribution()} layout="horizontal">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="status" type="category" width={80} />
                      <Tooltip formatter={(value) => [value, 'Quantidade']} />
                      <Bar dataKey="count" fill="#8B5CF6" />
                    </BarChart>
                  </ResponsiveContainer>
                </motion.div>

                {/* Price Trends */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 }}
                  className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm"
                >
                  <h3 className="text-xl font-bold text-[#0F172A] mb-6 flex items-center gap-2">
                    <TrendingUp className="size-5 text-orange-600" />
                    Tendência de Preços
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={getPriceTrends()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`R$ ${value.toLocaleString()}`, 'Preço Médio']} />
                      <Area type="monotone" dataKey="avgPrice" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </motion.div>
              </div>

              {/* Detailed Table */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0 }}
                className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm"
              >
                <h3 className="text-xl font-bold text-[#0F172A] mb-6">Análise Detalhada</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Localização</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Imóveis</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Preço Médio</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Preço Máximo</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Preço Mínimo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getPriceByLocation().map((location, index) => {
                        const locationProperties = properties.filter(p => 
                          p.location.split(',')[0].trim() === location.location
                        );
                        const maxPrice = Math.max(...locationProperties.map(p => p.price));
                        const minPrice = Math.min(...locationProperties.map(p => p.price));

                        return (
                          <tr key={index} className="border-t border-slate-100 hover:bg-slate-50 transition-colors">
                            <td className="py-3 px-4 font-medium text-[#0F172A]">{location.location}</td>
                            <td className="py-3 px-4 text-slate-600">{location.count}</td>
                            <td className="py-3 px-4 font-semibold text-green-600">
                              R$ {location.avgPrice.toLocaleString()}
                            </td>
                            <td className="py-3 px-4 text-slate-600">
                              R$ {maxPrice.toLocaleString()}
                            </td>
                            <td className="py-3 px-4 text-slate-600">
                              R$ {minPrice.toLocaleString()}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            </div>
          )}

          {/* Calendar / Agenda Tab */}
          {activeTab === "calendar" && (
            <div className="space-y-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-[#0F172A]">Agenda de Visitas</h2>
                  <p className="text-slate-500">Gerencie compromissos de visita e agendamentos de clientes.</p>
                </div>
                <button
                  onClick={handleAddSchedule}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                >
                  <Plus className="size-5" />
                  Novo Agendamento
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {(() => {
                  const summary = getScheduleSummary();
                  return [
                    { label: 'Total', value: summary.total, color: 'from-blue-500 to-cyan-600' },
                    { label: 'Confirmados', value: summary.confirmed, color: 'from-green-500 to-emerald-600' },
                    { label: 'Agendados', value: summary.pending, color: 'from-orange-500 to-amber-600' },
                    { label: 'Cancelados', value: summary.canceled, color: 'from-red-500 to-pink-600' }
                  ].map((card, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className={`bg-white rounded-2xl p-6 border border-slate-200 shadow-sm`}
                    >
                      <div className={`p-3 bg-gradient-to-br ${card.color} rounded-xl shadow-lg mb-4`} />
                      <div className="text-3xl font-bold text-[#0F172A] mb-1">{card.value}</div>
                      <div className="text-sm text-slate-600">{card.label}</div>
                    </motion.div>
                  ));
                })()}
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-[#0F172A]">Próximos Agendamentos</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Propriedade</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Cliente</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Data</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Horário</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Status</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {schedules.map((schedule) => (
                        <tr key={schedule.id} className="border-t border-slate-100 hover:bg-slate-50 transition-colors">
                          <td className="py-4 px-4 font-medium text-[#0F172A]">{schedule.propertyTitle}</td>
                          <td className="py-4 px-4 text-slate-600">
                            <div className="font-medium text-[#0F172A]">{schedule.clientName}</div>
                            <div className="text-xs text-slate-500">{schedule.clientEmail}</div>
                          </td>
                          <td className="py-4 px-4 text-slate-600">{schedule.date}</td>
                          <td className="py-4 px-4 text-slate-600">{schedule.time}</td>
                          <td className="py-4 px-4">
                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm ${
                              schedule.status === 'confirmado' ? 'bg-green-100 text-green-700' :
                              schedule.status === 'agendado' ? 'bg-orange-100 text-orange-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {schedule.status}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleEditSchedule(schedule)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Editar"
                              >
                                <Edit className="size-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteSchedule(schedule.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Excluir"
                              >
                                <Trash2 className="size-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            </div>
          )}

          {/* Other Tabs Content */}
          {activeTab !== "overview" && activeTab !== "properties" && activeTab !== "analytics" && activeTab !== "calendar" && (
            <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center">
              <div className="inline-block p-6 bg-slate-100 rounded-full mb-4">
                <Building2 className="size-12 text-slate-400" />
              </div>
              <h3 className="text-2xl font-bold text-[#0F172A] mb-2">
                {activeTab === "properties" && "Gerenciamento de Imóveis"}
                {activeTab === "analytics" && "Análises e Relatórios"}
                {activeTab === "notifications" && "Central de Notificações"}
                {activeTab === "calendar" && "Agenda e Visitas"}
              </h3>
              <p className="text-slate-600">Esta seção está em desenvolvimento</p>
            </div>
          )}
        </div>
      </main>

      {/* Property Modal */}
      {showPropertyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-[#0F172A]">
                  {editingProperty ? 'Editar Imóvel' : 'Novo Imóvel'}
                </h3>
                <button
                  onClick={() => setShowPropertyModal(false)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <CloseIcon className="size-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Título</label>
                  <input
                    type="text"
                    value={propertyForm.title}
                    onChange={(e) => setPropertyForm({ ...propertyForm, title: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Título do imóvel"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Localização</label>
                  <input
                    type="text"
                    value={propertyForm.location}
                    onChange={(e) => setPropertyForm({ ...propertyForm, location: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Cidade, Estado"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Preço</label>
                  <input
                    type="number"
                    value={propertyForm.price}
                    onChange={(e) => setPropertyForm({ ...propertyForm, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Tipo</label>
                  <select
                    value={propertyForm.type}
                    onChange={(e) => setPropertyForm({ ...propertyForm, type: e.target.value as Property['type'] })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Escritório">Escritório</option>
                    <option value="Coworking">Coworking</option>
                    <option value="Sala Comercial">Sala Comercial</option>
                    <option value="Loja">Loja</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Quartos</label>
                  <input
                    type="number"
                    value={propertyForm.bedrooms}
                    onChange={(e) => setPropertyForm({ ...propertyForm, bedrooms: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Banheiros</label>
                  <input
                    type="number"
                    value={propertyForm.bathrooms}
                    onChange={(e) => setPropertyForm({ ...propertyForm, bathrooms: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Área (m²)</label>
                  <input
                    type="number"
                    value={propertyForm.area}
                    onChange={(e) => setPropertyForm({ ...propertyForm, area: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
                  <select
                    value={propertyForm.status}
                    onChange={(e) => setPropertyForm({ ...propertyForm, status: e.target.value as Property['status'] })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="disponivel">Disponível</option>
                    <option value="vendido">Vendido</option>
                    <option value="alugado">Alugado</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Descrição</label>
                <textarea
                  value={propertyForm.description}
                  onChange={(e) => setPropertyForm({ ...propertyForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none"
                  placeholder="Descrição do imóvel"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Imagem do imóvel</label>
                <input
                  type="text"
                  value={propertyForm.image}
                  onChange={(e) => handleImageChange(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="URL da imagem principal"
                />
                <p className="text-xs text-slate-500 mt-2">
                  Esta imagem sera usada automaticamente na listagem principal do site.
                </p>
              </div>
            </div>

            <div className="p-6 border-t border-slate-200 flex justify-end gap-3">
              <button
                onClick={() => setShowPropertyModal(false)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveProperty}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
              >
                <Save className="size-4" />
                {editingProperty ? 'Atualizar' : 'Salvar'}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {showScheduleModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-[#0F172A]">
                  {editingSchedule ? 'Editar Agendamento' : 'Novo Agendamento'}
                </h3>
                <button
                  onClick={() => setShowScheduleModal(false)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <CloseIcon className="size-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Propriedade</label>
                  <input
                    type="text"
                    value={scheduleForm.propertyTitle}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, propertyTitle: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Título do imóvel"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Cliente</label>
                  <input
                    type="text"
                    value={scheduleForm.clientName}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, clientName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nome do cliente"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">E-mail do cliente</label>
                  <input
                    type="email"
                    value={scheduleForm.clientEmail}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, clientEmail: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="cliente@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Data</label>
                  <input
                    type="date"
                    value={scheduleForm.date}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, date: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Horário</label>
                  <input
                    type="time"
                    value={scheduleForm.time}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, time: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
                  <select
                    value={scheduleForm.status}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, status: e.target.value as ScheduleStatus})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="agendado">Agendado</option>
                    <option value="confirmado">Confirmado</option>
                    <option value="cancelado">Cancelado</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Notas</label>
                <textarea
                  value={scheduleForm.notes}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none"
                  placeholder="Observações do agendamento"
                />
              </div>
            </div>

            <div className="p-6 border-t border-slate-200 flex justify-end gap-3">
              <button
                onClick={() => setShowScheduleModal(false)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveSchedule}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
              >
                <Save className="size-4" />
                {editingSchedule ? 'Atualizar' : 'Salvar'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
