"use client";

import { useState } from "react";
import { Mail, MapPin, Send } from "lucide-react";

export default function ContactForm() {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [kvkkAccepted, setKvkkAccepted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.email && formData.message && kvkkAccepted) {
      setSubmitted(true);
      setFormData({ name: "", email: "", message: "" });
      setKvkkAccepted(false);
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
                <MapPin className="text-kiremit animate-bounce" size={18} />
                <span>Çanakkale</span>
              </div>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-safran/10 border border-safran/20 text-xs text-ink/75 font-semibold leading-relaxed">
            💡 <strong>Düzeltme Bildirimi:</strong> Sitede eksik veya yanlış olduğunu düşündüğünüz bir yer varsa, yan taraftaki formu kullanarak bize bildirebilirsiniz. Editörlerimiz 24 saat içinde verileri doğrulamaktadır.
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
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-ink/70 mb-2">
                    Adınız Soyadınız
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full rounded-xl border border-ink/10 bg-paper py-3 px-4 text-sm text-ink placeholder:text-ink/30 outline-none focus:border-kiremit focus:ring-1 focus:ring-kiremit transition-all shadow-inner"
                    placeholder="Örn: Ömer Taşcı"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-ink/70 mb-2">
                    E-posta Adresiniz
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full rounded-xl border border-ink/10 bg-paper py-3 px-4 text-sm text-ink placeholder:text-ink/30 outline-none focus:border-kiremit focus:ring-1 focus:ring-kiremit transition-all shadow-inner"
                    placeholder="Örn: omer@example.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-ink/70 mb-2">
                    Mesajınız veya Düzeltme Notu
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full rounded-xl border border-ink/10 bg-paper py-3 px-4 text-sm text-ink placeholder:text-ink/30 outline-none focus:border-kiremit focus:ring-1 focus:ring-kiremit transition-all shadow-inner resize-none"
                    placeholder="Hangi ilçe veya mekanla ilgili bildirimde bulunmak istersiniz?"
                  />
                </div>
                <div className="flex items-start gap-2.5 pt-2">
                  <input
                    type="checkbox"
                    id="kvkk"
                    required
                    checked={kvkkAccepted}
                    onChange={(e) => setKvkkAccepted(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-ink/10 text-kiremit focus:ring-kiremit cursor-pointer"
                  />
                  <label htmlFor="kvkk" className="text-xs text-ink/75 font-semibold leading-relaxed cursor-pointer selection:bg-transparent">
                    <a href="/tr/gizlilik-politikasi" target="_blank" className="text-kiremit hover:underline">Gizlilik Politikası</a> ve Çerez Kullanım şartlarını, KVKK aydınlatma metni kapsamında kabul ediyorum.
                  </label>
                </div>
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-kiremit text-paper py-3 px-4 text-sm font-bold uppercase tracking-wider hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer shadow-md"
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
