"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, Phone, MapPin, Send } from "lucide-react";

export default function ContactForm() {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [kvkkConsent, setKvkkConsent] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  // Honeypot (report item 260-ish, spam protection) — a real field name bots
  // fill in but sighted/keyboard/screen-reader users never see or reach
  // (off-screen, not display:none — some scrapers skip display:none fields).
  // No CAPTCHA service key exists yet [B], so this is the code-only layer.
  const [honeypot, setHoneypot] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (honeypot) return; // silently drop — bot filled the trap field
    if (formData.name && formData.email && formData.message && kvkkConsent) {
      setSubmitted(true);
      setFormData({ name: "", email: "", message: "" });
      setKvkkConsent(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
      <div className="text-center mb-12">
        <h1 className="font-display text-4xl italic text-ink sm:text-5xl mb-4">
          İletişim & Geri Bildirim
        </h1>
        <p className="text-lg text-ink/75 max-w-2xl mx-auto font-medium">
          Mekan düzeltmeleri, reklam iş birlikleri veya seyahat önerileriniz için bize ulaşın.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-12 mt-12 items-start">
        {/* Contact Info */}
        <div className="md:col-span-2 space-y-6">
          <div className="rounded-2xl border border-ink/10 bg-paper p-6 shadow-sm">
            <h3 className="text-sm font-bold uppercase tracking-wider text-kiremit mb-4">
              Kurumsal İletişim
            </h3>
            <div className="space-y-4 text-sm text-ink/80 font-semibold">
              <div className="flex items-center gap-3">
                <Mail className="text-kiremit" size={18} />
                <span>info@yoldefterim.com.tr</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="text-kiremit" size={18} />
                <span>+90 555 166 33 80</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="text-kiremit animate-bounce" size={18} />
                <span>Çanakkale, Türkiye</span>
              </div>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-safran/10 border border-safran/20 text-xs text-ink/75 font-semibold leading-relaxed">
            💡 <strong>Düzeltme Bildirimi:</strong> Sitede eksik veya yanlış olduğunu düşündüğünüz bir yer varsa, yan taraftaki formu kullanarak bize bildirebilirsiniz. Bildirdiğiniz bilgiler düzenli olarak gözden geçirilip güncellenir.
          </div>
        </div>

        {/* Contact Form */}
        <div className="md:col-span-3">
          <div className="rounded-2xl border border-ink/10 bg-paper p-6 sm:p-8 shadow-sm">
            {submitted ? (
              <div className="text-center py-8 space-y-3">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-safran/10 text-kiremit text-2xl font-bold">
                  ✓
                </div>
                <h3 className="font-display text-xl italic text-ink">Mesajınız Alındı!</h3>
                <p className="text-sm text-ink/70 font-semibold">
                  Geri bildiriminiz editör ekibimize iletilmiştir. En kısa sürede inceleme yapılacaktır.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-4 rounded-xl border border-ink/20 px-6 py-2.5 text-xs font-bold text-ink hover:bg-ink hover:text-paper transition-all cursor-pointer"
                >
                  Yeni Mesaj Gönder
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Honeypot field — real bots fill every input they can find,
                    including this one; humans never see or tab to it. */}
                <div className="absolute -left-[9999px] w-px h-px overflow-hidden" aria-hidden="true">
                  <label htmlFor="contact-website">Website</label>
                  <input
                    id="contact-website"
                    type="text"
                    name="website"
                    tabIndex={-1}
                    autoComplete="off"
                    value={honeypot}
                    onChange={(e) => setHoneypot(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="contact-name" className="block text-xs font-bold uppercase tracking-wider text-ink/70 mb-2">
                    Adınız Soyadınız
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full rounded-xl border border-ink/10 bg-paper py-3 px-4 text-sm text-ink placeholder:text-ink/65 outline-none focus:border-kiremit focus:ring-1 focus:ring-kiremit transition-all shadow-inner"
                    placeholder="Örn: Ömer Taşcı"
                  />
                </div>
                <div>
                  <label htmlFor="contact-email" className="block text-xs font-bold uppercase tracking-wider text-ink/70 mb-2">
                    E-posta Adresiniz
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full rounded-xl border border-ink/10 bg-paper py-3 px-4 text-sm text-ink placeholder:text-ink/65 outline-none focus:border-kiremit focus:ring-1 focus:ring-kiremit transition-all shadow-inner"
                    placeholder="Örn: omer@example.com"
                  />
                </div>
                <div>
                  <label htmlFor="contact-message" className="block text-xs font-bold uppercase tracking-wider text-ink/70 mb-2">
                    Mesajınız veya Düzeltme Notu
                  </label>
                  <textarea
                    id="contact-message"
                    required
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full rounded-xl border border-ink/10 bg-paper py-3 px-4 text-sm text-ink placeholder:text-ink/65 outline-none focus:border-kiremit focus:ring-1 focus:ring-kiremit transition-all shadow-inner resize-none"
                    placeholder="Hangi ilçe veya mekanla ilgili bildirimde bulunmak istersiniz?"
                  />
                </div>
                <label className="flex items-start gap-2 text-xs text-ink/65 leading-snug cursor-pointer">
                  <input
                    type="checkbox"
                    required
                    checked={kvkkConsent}
                    onChange={(e) => setKvkkConsent(e.target.checked)}
                    className="mt-0.5 rounded border-ink/20 text-kiremit focus:ring-kiremit cursor-pointer"
                  />
                  <span>
                    <Link href="/tr/gizlilik-politikasi#kvkk" className="underline hover:text-kiremit">
                      KVKK Aydınlatma Metni
                    </Link>
                    &apos;ni okudum, kişisel verilerimin bu talebimi yanıtlamak amacıyla işlenmesini kabul ediyorum.
                  </span>
                </label>
                <button
                  type="submit"
                  disabled={!kvkkConsent}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-kiremit text-paper py-3 px-4 text-sm font-bold uppercase tracking-wider hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer shadow-md disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  <Send size={16} /> Gönder
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
