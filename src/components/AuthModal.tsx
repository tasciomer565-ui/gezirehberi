"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Lock, User, Mail, LogIn, UserPlus } from "lucide-react";
import { loginUser, registerUser } from "@/lib/socialDb";
import { getDictionary, Locale } from "@/lib/i18n";
import { useParams } from "next/navigation";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const params = useParams();
  const locale = (params?.locale || "tr") as Locale;
  const dict = getDictionary(locale);

  const [mode, setMode] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    // Reset state on open/close
    if (isOpen) {
      setUsername("");
      setEmail("");
      setPassword("");
      setError("");
      setSuccessMsg("");
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!username || !password || (mode === "register" && !email)) {
      setError(locale === "tr" ? "Lütfen tüm alanları doldurun." : "Please fill in all fields.");
      return;
    }

    if (mode === "login") {
      const res = loginUser(username, password);
      if (res.success) {
        onSuccess();
        window.dispatchEvent(new Event("yoldefteri_auth_change"));
        onClose();
      } else {
        setError(res.error || "Giriş başarısız.");
      }
    } else {
      const res = registerUser(username, email, password);
      if (res.success) {
        setSuccessMsg(locale === "tr" ? "Hesap başarıyla oluşturuldu! Giriş yapabilirsiniz." : "Account created successfully! You can now log in.");
        setMode("login");
        setPassword("");
      } else {
        setError(res.error || "Kayıt başarısız.");
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className="relative w-full max-w-md overflow-hidden rounded-2xl border border-ink/10 bg-paper/95 p-6 shadow-2xl backdrop-blur-md"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute right-4 top-4 rounded-full p-1.5 text-ink/45 hover:bg-ink/5 hover:text-kiremit transition-colors focus:outline-none"
              aria-label="Close modal"
            >
              <X size={18} />
            </button>

            {/* Header Tabs */}
            <div className="mb-6 flex gap-4 border-b border-ink/10 pb-2">
              <button
                onClick={() => { setMode("login"); setError(""); }}
                className={`flex items-center gap-1.5 pb-2 text-sm font-bold uppercase tracking-wider transition-all focus:outline-none ${
                  mode === "login" ? "border-b-2 border-kiremit text-kiremit" : "text-ink/45"
                }`}
              >
                <LogIn size={15} />
                {locale === "tr" ? "Giriş Yap" : "Sign In"}
              </button>
              <button
                onClick={() => { setMode("register"); setError(""); }}
                className={`flex items-center gap-1.5 pb-2 text-sm font-bold uppercase tracking-wider transition-all focus:outline-none ${
                  mode === "register" ? "border-b-2 border-kiremit text-kiremit" : "text-ink/45"
                }`}
              >
                <UserPlus size={15} />
                {locale === "tr" ? "Kayıt Ol" : "Register"}
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="rounded-lg bg-kiremit/10 p-3 text-xs font-semibold text-kiremit">
                  ⚠️ {error}
                </div>
              )}
              {successMsg && (
                <div className="rounded-lg bg-turkuaz/10 p-3 text-xs font-semibold text-turkuaz">
                  ✓ {successMsg}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-ink/55 flex items-center gap-1.5">
                  <User size={12} /> {locale === "tr" ? "Kullanıcı Adı" : "Username"}
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="can_gezgin"
                  className="w-full rounded-lg border border-ink/10 bg-paper px-3 py-2 text-sm text-ink focus:border-kiremit focus:outline-none"
                />
              </div>

              {mode === "register" && (
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-ink/55 flex items-center gap-1.5">
                    <Mail size={12} /> {locale === "tr" ? "E-Posta" : "Email"}
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="can@gezgin.com"
                    className="w-full rounded-lg border border-ink/10 bg-paper px-3 py-2 text-sm text-ink focus:border-kiremit focus:outline-none"
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-ink/55 flex items-center gap-1.5">
                  <Lock size={12} /> {locale === "tr" ? "Şifre" : "Password"}
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-ink/10 bg-paper px-3 py-2 text-sm text-ink focus:border-kiremit focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-kiremit py-3 text-xs font-bold uppercase tracking-wider text-paper shadow-lg hover:bg-ink transition-all hover:scale-[1.02]"
              >
                {mode === "login"
                  ? locale === "tr" ? "Giriş Yap" : "Sign In"
                  : locale === "tr" ? "Kayıt Ol" : "Register"}
              </button>
            </form>
            <div className="mt-4 rounded-lg bg-safran/10 border border-safran/20 p-3 text-[10px] font-semibold text-ink/70 leading-relaxed">
              🔒 {locale === "tr" 
                ? "Bilgilendirme: Hesap ve rota verileriniz tamamen yerel tarayıcınızda (offline / localStorage) saklanır. Sunucularımıza hiçbir kişisel veri iletilmez." 
                : "Privacy Note: Your account and route data are stored entirely locally in your browser (offline / localStorage). No personal data is transmitted to our servers."}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
