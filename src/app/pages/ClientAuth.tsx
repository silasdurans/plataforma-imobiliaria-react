import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { Building2, Eye, EyeOff, Lock, Mail, User, UserPlus, LogIn, ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router";
import {
  ClientUser,
  getClientSession,
  getClientUsers,
  saveClientSession,
  saveClientUsers,
} from "../lib/clientSession";

type AuthMode = "login" | "register";

export default function ClientAuth() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<AuthMode>("login");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const title = useMemo(
    () => (mode === "login" ? "Entrar como cliente" : "Criar conta de cliente"),
    [mode],
  );

  useEffect(() => {
    if (getClientSession()) {
      navigate("/", { replace: true });
    }
  }, [navigate]);

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleRegister = () => {
    const users = getClientUsers();
    const normalizedEmail = form.email.trim().toLowerCase();

    if (!form.name.trim() || !normalizedEmail || !form.password) {
      setError("Preencha nome, e-mail e senha.");
      return;
    }

    if (form.password.length < 6) {
      setError("A senha precisa ter pelo menos 6 caracteres.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    if (users.some((user) => user.email === normalizedEmail)) {
      setError("Já existe um cliente cadastrado com este e-mail.");
      return;
    }

    const newUser: ClientUser = {
      id: crypto.randomUUID(),
      name: form.name.trim(),
      email: normalizedEmail,
      password: form.password,
      createdAt: new Date().toISOString(),
      phone: "",
      bio: "",
      location: "São Luís, Maranhão",
    };

    saveClientUsers([newUser, ...users]);
    saveClientSession({ id: newUser.id, name: newUser.name, email: newUser.email });
    setSuccess("Cadastro realizado com sucesso. Você já está logado.");
    setError("");
    setTimeout(() => navigate("/", { replace: true }), 900);
  };

  const handleLogin = () => {
    const users = getClientUsers();
    const normalizedEmail = form.email.trim().toLowerCase();
    const user = users.find(
      (item) => item.email === normalizedEmail && item.password === form.password,
    );

    if (!user) {
      setError("E-mail ou senha inválidos.");
      return;
    }

    saveClientSession({ id: user.id, name: user.name, email: user.email });
    setSuccess(`Bem-vindo, ${user.name}.`);
    setError("");
    setTimeout(() => navigate("/", { replace: true }), 900);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    setTimeout(() => {
      if (mode === "register") {
        handleRegister();
      } else {
        handleLogin();
      }
      setIsLoading(false);
    }, 400);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0E27] via-[#0F172A] to-[#1a1f3a] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-16 left-12 w-72 h-72 bg-cyan-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-blue-600/10 rounded-full blur-[140px]" />
      </div>

      <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md relative z-10">
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <Link to="/" className="text-slate-300 hover:text-white transition-colors">
              <ArrowLeft className="size-5" />
            </Link>
            <div className="inline-flex rounded-full bg-white/10 p-1 border border-white/10">
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setError("");
                  setSuccess("");
                }}
                className={`px-4 py-2 rounded-full text-sm transition-colors ${
                  mode === "login" ? "bg-white text-[#0F172A]" : "text-slate-300"
                }`}
              >
                Entrar
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("register");
                  setError("");
                  setSuccess("");
                }}
                className={`px-4 py-2 rounded-full text-sm transition-colors ${
                  mode === "register" ? "bg-white text-[#0F172A]" : "text-slate-300"
                }`}
              >
                Cadastrar
              </button>
            </div>
          </div>

          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center size-16 rounded-2xl bg-white text-[#0F172A] shadow-xl mb-4">
              <Building2 className="size-9" />
            </div>
            <h1 className="text-3xl text-white mb-2">Área do Cliente</h1>
            <p className="text-slate-300">{title}</p>
          </div>

          {error && <div className="mb-4 rounded-2xl border border-red-400/40 bg-red-500/15 px-4 py-3 text-sm text-red-100">{error}</div>}
          {success && <div className="mb-4 rounded-2xl border border-emerald-400/40 bg-emerald-500/15 px-4 py-3 text-sm text-emerald-100">{success}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "register" && (
              <div>
                <label className="block text-sm text-slate-200 mb-2">Nome completo</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-slate-400" />
                  <input type="text" value={form.name} onChange={(event) => handleChange("name", event.target.value)} placeholder="Seu nome" className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500" />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm text-slate-200 mb-2">E-mail</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-slate-400" />
                <input type="email" value={form.email} onChange={(event) => handleChange("email", event.target.value)} placeholder="cliente@email.com" className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500" required />
              </div>
            </div>

            <div>
              <label className="block text-sm text-slate-200 mb-2">Senha</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-slate-400" />
                <input type={showPassword ? "text" : "password"} value={form.password} onChange={(event) => handleChange("password", event.target.value)} placeholder="••••••••" className="w-full pl-12 pr-12 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500" required />
                <button type="button" onClick={() => setShowPassword((current) => !current)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors">
                  {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                </button>
              </div>
            </div>

            {mode === "register" && (
              <div>
                <label className="block text-sm text-slate-200 mb-2">Confirmar senha</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-slate-400" />
                  <input type={showPassword ? "text" : "password"} value={form.confirmPassword} onChange={(event) => handleChange("confirmPassword", event.target.value)} placeholder="Repita a senha" className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500" required />
                </div>
              </div>
            )}

            <motion.button type="submit" disabled={isLoading} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-500/30 disabled:opacity-60">
              {isLoading ? (
                <>
                  <div className="size-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Processando...
                </>
              ) : mode === "login" ? (
                <>
                  <LogIn className="size-5" />
                  Entrar
                </>
              ) : (
                <>
                  <UserPlus className="size-5" />
                  Criar conta
                </>
              )}
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
