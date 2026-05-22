/**
 * Página de login administrativo. Controla o acesso ao painel interno da aplicação.
 */
import { useState } from "react";
import { motion } from "motion/react";
import { Building2, Lock, Mail, Eye, EyeOff, Shield, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router";

const ADMIN_EMAIL = "admin@saopauloparticipacoes.com.br";
const ADMIN_PASSWORD = "admin123";
const ADMIN_SESSION_KEY = "grupo-sp-admin-session";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 400));
      if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        localStorage.setItem(ADMIN_SESSION_KEY, "true");
        navigate("/admin/dashboard");
      } else {
        throw new Error("Credenciais inválidas. Tente novamente.");
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Não foi possível fazer login.");
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemoCredentials = () => {
    setEmail("admin@saopauloparticipacoes.com.br");
    setPassword("admin123");
    setError("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0E27] via-[#0F172A] to-[#1a1f3a] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCAwIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjAzIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-40" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo Card */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 mb-6 border border-white/20 text-center"
        >
          <div className="inline-flex items-center justify-center size-20 bg-white rounded-2xl shadow-2xl mb-4">
            <Building2 className="size-12 text-[#0F172A]" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Grupo São Paulo</h1>
          <p className="text-blue-300">Painel Administrativo</p>
        </motion.div>

        {/* Login Form */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-blue-500/20 rounded-xl">
              <Shield className="size-6 text-blue-300" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Acesso Restrito</h2>
              <p className="text-sm text-slate-300">Faça login para continuar</p>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl flex items-start gap-3"
            >
              <AlertCircle className="size-5 text-red-300 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-200">{error}</p>
            </motion.div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">
                E-mail Corporativo
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                  <Mail className="size-5 text-slate-400" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@saopauloparticipacoes.com.br"
                  required
                  className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">
                Senha
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                  <Lock className="size-5 text-slate-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-12 pr-12 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                </button>
              </div>
            </div>

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  className="size-4 rounded border-white/20 bg-white/10 text-blue-600 focus:ring-blue-500"
                />
                Lembrar-me
              </label>
              <a href="#" className="text-blue-400 hover:text-blue-300 transition-colors">
                Esqueceu a senha?
              </a>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3">
              <motion.button
                type="submit"
                disabled={isLoading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-4 rounded-xl font-semibold shadow-lg shadow-blue-500/50 hover:shadow-blue-500/70 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Verificando...
                  </>
                ) : (
                  <>
                    <Shield className="size-5" />
                    Acessar Painel
                  </>
                )}
              </motion.button>

              <motion.button
                type="button"
                onClick={fillDemoCredentials}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-5 py-4 rounded-xl border border-white/20 bg-white/10 text-white font-medium hover:bg-white/15 transition-all"
              >
                Demo
              </motion.button>
            </div>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
            <p className="text-xs text-blue-200 mb-2 font-semibold">🔐 Credenciais de Demonstração:</p>
            <p className="text-xs text-slate-300 font-mono">Email: admin@saopauloparticipacoes.com.br</p>
            <p className="text-xs text-slate-300 font-mono">Senha: admin123</p>
          </div>
        </motion.div>

        {/* Back to Home */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center mt-6"
        >
          <a
            href="/"
            className="text-slate-300 hover:text-white transition-colors text-sm"
          >
            ← Voltar para o site
          </a>
        </motion.div>
      </motion.div>
    </div>
  );
}
