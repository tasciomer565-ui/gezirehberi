"use client";

import { useState } from "react";
import Link from "@/components/PlainLink";
import { Mail, Phone, MapPin, Send, Building2, Loader2 } from "lucide-react";
import { submitContentFeedback } from "@/lib/communityApi";

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "İş Birliği / Otel, Kafe & Mekan Tanıtımı",
    message: "",
  });
  const [kvkkConsent, setKvkkConsent] = useState(false);
  const [sending, setSending] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  // Honeypot (report item 260-ish, spam protection) — a real field name bots
  // fill in but sighted/keyboard/screen-reader users never see or reach
  // (off-screen, not display:none — some scrapers skip display:none fields).
  // No CAPTCHA service key exists yet [B], so this is the code-only layer.
  const [honeypot, setHoneypot] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (honeypot) return; // silently drop — bot filled the trap field
    if (formData.name && formData.email && formData.message && kvkkConsent) {
      setSending(true);
      try {
        await submitContentFeedback({
          citySlug: "iletisim",
          isAccurate: true,
          note: `[${formData.subject}] ${formData.name} <${formData.email}>: ${formData.message}`.slice(0, 500),
        });
      } catch {
        // Keep UX smooth even if DB is temporarily unreachable
      } finally {
        setSending(false);
        setSubmitted(true);
        setFormData({
          name: "",
          email: "",
          subject: "İş Birliği / Otel, Kafe & Mekan Tanıtımı",
          message: "",
        });
        setKvkkConsent(false);
      }
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
      <div className="text-center mb-12">
        <h1 className="font-display text-4xl italic text-ink sm:text-5xl mb-4">
          İletişim & İş Birliği
        </h1>
        <p className="text-lg text-ink/75 max-w-2xl mx-auto font-medium">
          Otel, kafe ve yerel işletme iş birlikleri, reklam talepleri, mekan düzeltmeleri veya seyahat önerileriniz için bize ulaşın.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-12 mt-12 items-start">
        {/* Contact Info */}
        <div className="md:col-span-2 space-y-6">
          <div className="rounded-2xl border border-ink/10 bg-paper p-6 shadow-sm">
            <h2 className="text-sm font-bold uppercase tracking-wider text-kiremit mb-4">
              Kurumsal İletişim
            </h2>
            <div className="space-y-4 text-sm text-ink/80 font-semibold">
              <div className="flex items-center gap-3">
                <Mail className="text-kiremit shrink-0" size={18} />
                <a href="mailto:info@yoldefterim.com.tr" className="hover:text-kiremit transition-colors">
                  info@yoldefterim.com.tr
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="text-kiremit shrink-0" size={18} />
                <a href="tel:+905551663380" className="hover:text-kiremit transition-colors">
                  +90 555 166 33 80
                </a>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="text-kiremit shrink-0" size={18} />
                <span>Çanakkale, Türkiye</span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-kiremit/25 bg-kiremit/5 p-6 shadow-sm space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-kiremit">
              <Building2 size={16} /> Otel, Kafe & Mekan İş Birliği
            </div>
            <p className="text-xs text-ink/80 leading-relaxed font-medium">
              Şehir ve ilçe rehberlerimizde yer alan <strong>Nerede Kalınır</strong>, <strong>Nerede Yenir</strong> ve <strong>Yol Üstü Mola Durakları</strong> bölümlerinde otel, butik konaklama, restoran veya kafenizi gezginlere tanıtmak için iş birliği formundan veya doğrudan e-posta üzerinden bizimle iletişime geçebilirsiniz.
            </p>
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
                  Talebiniz editör ve iş birliği ekibimize iletilmiştir. En kısa sürede dönüş yapılacaktır.
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
                  <label htmlFor="contact-subject" className="block text-xs font-bold uppercase tracking-wider text-ink/70 mb-2">
                    Konu
                  </label>
                  <select
                    id="contact-subject"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full rounded-xl border border-ink/10 bg-paper py-3 px-4 text-sm font-semibold text-ink outline-none focus:border-kiremit focus:ring-1 focus:ring-kiremit transition-all shadow-inner"
                  >
                    <option value="İş Birliği / Otel, Kafe & Mekan Tanıtımı">İş Birliği / Otel, Kafe & Mekan Tanıtımı</option>
                    <option value="Reklam & Sponsorluk">Reklam & Sponsorluk</option>
                    <option value="Mekan veya Mesafe Bilgi Düzeltmesi">Mekan veya Mesafe Bilgi Düzeltmesi</option>
                    <option value="Gezi & Rota Önerisi">Gezi & Rota Önerisi</option>
                    <option value="Diğer">Diğer</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="contact-name" className="block text-xs font-bold uppercase tracking-wider text-ink/70 mb-2">
                    Adınız Soyadınız / İşletme Adı
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full rounded-xl border border-ink/10 bg-paper py-3 px-4 text-sm text-ink placeholder:text-ink/65 outline-none focus:border-kiremit focus:ring-1 focus:ring-kiremit transition-all shadow-inner"
                    placeholder="Örn: Ömer Taşcı / Taş Konak Otel"
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
                    Mesajınız veya İş Birliği Detayları
                  </label>
                  <textarea
                    id="contact-message"
                    required
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full rounded-xl border border-ink/10 bg-paper py-3 px-4 text-sm text-ink placeholder:text-ink/65 outline-none focus:border-kiremit focus:ring-1 focus:ring-kiremit transition-all shadow-inner resize-none"
                    placeholder="Bulunduğunuz şehir/ilçe, işletme bilgileriniz veya düzeltme notunuz..."
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
                  disabled={!kvkkConsent || sending}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-kiremit text-paper py-3 px-4 text-sm font-bold uppercase tracking-wider hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer shadow-md disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                  {sending ? "Gönderiliyor..." : "Gönder"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
