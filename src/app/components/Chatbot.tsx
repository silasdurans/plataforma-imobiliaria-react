/**
 * Componente de chat da aplicação. Organiza a conversa entre usuário e assistente virtual.
 */
import { MessageCircle, X, Send, Sparkles } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Array<{ text: string; isBot: boolean }>>([
    { text: "Olá! 👋 Sou o assistente inteligente da São Paulo Participações. Conte-me o que você procura e vou encontrar o espaço ideal para você!", isBot: true }
  ]);
  const navigate = useNavigate();

  const handleSend = () => {
    if (!message.trim()) return;
    
    const userMessage = message;
    setMessages(prev => [...prev, { text: userMessage, isBot: false }]);
    setMessage("");
    
    // Simula resposta do bot
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        text: "✨ Perfeito! Encontrei alguns espaços que combinam exatamente com o que você está procurando. Vou te mostrar as melhores opções agora...", 
        isBot: true 
      }]);
      
      setTimeout(() => {
        navigate("/resultados");
        setIsOpen(false);
      }, 1500);
    }, 800);
  };

  return (
    <>
      {/* Botão flutuante com design moderno */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 text-white rounded-full p-5 shadow-2xl z-50 group hover:shadow-purple-500/50 transition-all"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X className="size-7" />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative"
            >
              <MessageCircle className="size-7" />
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, -10, 0]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 3
                }}
                className="absolute -top-1 -right-1"
              >
                <Sparkles className="size-4 text-yellow-300" />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Pulse animation ring */}
        {!isOpen && (
          <motion.div
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.5, 0, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute inset-0 bg-purple-500 rounded-full -z-10"
          />
        )}
      </motion.button>

      {/* Modal do chat com design premium */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="fixed bottom-28 right-6 w-[420px] h-[600px] bg-white rounded-3xl shadow-2xl z-50 flex flex-col border border-gray-200 overflow-hidden"
          >
            {/* Header com gradiente */}
            <div className="relative bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 text-white p-6 rounded-t-3xl">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30" />
              
              <div className="relative flex items-center gap-3">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm"
                >
                  <Sparkles className="size-6 text-white" />
                </motion.div>
                <div>
                  <h3 className="font-semibold text-lg">Assistente Inteligente</h3>
                  <div className="flex items-center gap-2 text-xs text-purple-100">
                    <div className="size-2 bg-green-400 rounded-full animate-pulse" />
                    <span>Online agora</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Mensagens com scroll suave */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-gray-50 to-white">
              {messages.map((msg, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-5 py-3 ${
                      msg.isBot
                        ? 'bg-white text-gray-800 shadow-md border border-gray-100'
                        : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{msg.text}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Input com design moderno */}
            <div className="p-4 border-t bg-white">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder='Ex: "Escritório em São Luís até R$2000"'
                  className="flex-1 px-5 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-400 transition-colors text-sm"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSend}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-3 rounded-xl hover:shadow-lg transition-all"
                >
                  <Send className="size-5" />
                </motion.button>
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">
                Powered by AI • Resposta instantânea
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}