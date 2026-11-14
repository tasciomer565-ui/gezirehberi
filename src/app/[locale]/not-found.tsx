import Link from "@/components/PlainLink";
import { Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-32 text-center sm:px-6">
      <span className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-kiremit/10 text-kiremit">
        <Compass size={32} />
      </span>
      <h1 className="font-display text-4xl italic text-ink">Bu yol henüz haritada yok</h1>
      <p className="mt-4 text-ink/70">
        Aradığınız sayfa bulunamadı. Belki bölgeler sayfasından yeni bir rota keşfetmek istersiniz.
      </p>
      <Link
        href="/bolgeler"
        className="mt-8 rounded-full bg-kiremit px-6 py-3 text-sm font-semibold text-paper hover:bg-ink transition-colors"
      >
        Bölgeleri Keşfet
      </Link>
    </div>
  );
}
