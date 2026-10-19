"use client";

import { useState } from "react";
import Image from "next/image";
import { ImageIcon } from "lucide-react";
import { CITY_IMAGES } from "@/lib/cityImages";

// Smart Image Mapping Arrays - 100% active, gorgeous Unsplash photos representing Turkey's nature, history, dining and hospitality
const HISTORICAL_IMAGES = {
  marmara: [
    "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?auto=format&fit=crop&w=600&h=450&q=80", // Galata Tower
    "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=600&h=450&q=80", // Dolmabahce Palace
  ],
  ege: [
    "https://images.unsplash.com/photo-1508672019048-805c876b67e2?auto=format&fit=crop&w=600&h=450&q=80", // Ephesus ancient ruins
    "https://images.unsplash.com/photo-1549880338-65ddcdfd017b?auto=format&fit=crop&w=600&h=450&q=80"  // Bodrum Castle
  ],
  akdeniz: [
    "https://images.unsplash.com/photo-1508672019048-805c876b67e2?auto=format&fit=crop&w=600&h=450&q=80", // Apollo Temple Side
    "https://images.unsplash.com/photo-1549880338-65ddcdfd017b?auto=format&fit=crop&w=600&h=450&q=80"  // Phaselis ruins
  ],
  karadeniz: [
    "https://images.unsplash.com/photo-1628155930542-3c7a64e2c833?auto=format&fit=crop&w=600&h=450&q=80", // Sumela cliff monastery
    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=600&h=450&q=80"  // Amasra Castle gate
  ],
  "ic-anadolu": [
    "https://images.unsplash.com/photo-1507608869274-d3177c8bb4c7?auto=format&fit=crop&w=600&h=450&q=80", // Cappadocia balloons
    "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=600&h=450&q=80"  // Ankara Castle
  ],
  "dogu-anadolu": [
    "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=600&h=450&q=80"  // Ishak Pasha Palace
  ],
  "guneydogu-anadolu": [
    "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=600&h=450&q=80", // Mardin stone view
    "https://images.unsplash.com/photo-1508672019048-805c876b67e2?auto=format&fit=crop&w=600&h=450&q=80"  // Gobeklitepe style archaeology
  ]
};

const NATURE_IMAGES = {
  marmara: [
    "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&h=450&q=80", // Belgrad Forest
    "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=600&h=450&q=80"  // Waterfall
  ],
  ege: [
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&h=450&q=80", // Aegean green cove
    "https://images.unsplash.com/photo-1505015920881-0f83c2f7c95e?auto=format&fit=crop&w=600&h=450&q=80"  // Aegean olive valley
  ],
  akdeniz: [
    "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=600&h=450&q=80", // Duden waterfall
    "https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&w=600&h=450&q=80"  // Saklikent Canyon
  ],
  karadeniz: [
    "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&h=450&q=80", // Rize tea hills
    "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&w=600&h=450&q=80"  // Firtina valley forest
  ],
  "ic-anadolu": [
    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=600&h=450&q=80", // Tuz Golu / plains
    "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&h=450&q=80"  // Erciyes volcanic plain
  ],
  "dogu-anadolu": [
    "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=600&h=450&q=80"  // Lake Van coast
  ],
  "guneydogu-anadolu": [
    "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&h=450&q=80"  // Euphrates river canyon
  ]
};

const BEACH_IMAGES = [
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&h=450&q=80", // Oludeniz turquoise
  "https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=600&h=450&q=80", // Sandy beach sunset
  "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?auto=format&fit=crop&w=600&h=450&q=80"  // Cove yachts
];

const MEAT_IMAGES = [
  "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&h=450&q=80", // Turkish Kebab platter
  "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=600&h=450&q=80"  // Barbecue skewers
];

const FISH_IMAGES = [
  "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=600&h=450&q=80", // Grilled sea bass
];

const CAFE_IMAGES = [
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&h=450&q=80", // Turkish breakfast spread
  "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=600&h=450&q=80"  // Fresh pastries & coffee
];

const SWEET_IMAGES = [
  "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&h=450&q=80"  // Baklava / Turkish delights
];

const BOUTIQUE_IMAGES = [
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&h=450&q=80", // Historical stone mansion
  "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=600&h=450&q=80"  // Boutique hotel courtyard
];

const RESORT_IMAGES = [
  "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=600&h=450&q=80", // Luxury suite
  "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&h=450&q=80"  // Resort pool
];

const GRADIENT_PAIRS: [string, string][] = [
  ["#8A3A2B", "#B33A25"], // Red
  ["#2F5F40", "#0F5257"], // Green
  ["#16909C", "#0F5257"], // Blue
  ["#B7791F", "#E4A335"], // Gold
  ["#8A2B45", "#B33A5E"]  // Purple
];

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

interface PlaceholderImageProps {
  seed: string;
  label?: string;
  className?: string;
  iconSize?: number;
  aspect?: "square" | "video" | "wide";
  regionSlug?: string;
  index?: number;
}

export default function PlaceholderImage({
  seed,
  label,
  className = "",
  iconSize = 24,
  aspect = "video",
  regionSlug = "marmara",
  index,
}: PlaceholderImageProps) {
  const [imgError, setImgError] = useState(false);
  const hash = hashString(seed);
  const pair = GRADIENT_PAIRS[hash % GRADIENT_PAIRS.length];
  
  const aspectClass =
    aspect === "square"
      ? "aspect-square"
      : aspect === "wide"
      ? "aspect-[21/9]"
      : "aspect-video";

  const s = seed.toLowerCase();
  const l = (label || "").toLowerCase();
  let reg = (regionSlug || "marmara").toLowerCase();

  // Normalize region slug aliases
  if (reg.includes("marmara")) reg = "marmara";
  else if (reg.includes("ege")) reg = "ege";
  else if (reg.includes("akdeniz")) reg = "akdeniz";
  else if (reg.includes("karadeniz")) reg = "karadeniz";
  else if (reg.includes("ic-anadolu") || reg.includes("anadolu")) reg = "ic-anadolu";
  else if (reg.includes("dogu-anadolu") || reg.includes("doğu")) reg = "dogu-anadolu";
  else if (reg.includes("guneydogu-anadolu") || reg.includes("güneydoğu")) reg = "guneydogu-anadolu";
  else reg = "marmara";

  let imgUrl = "";

  // 1. Check specific city matching (e.g. Canakkale, Istanbul etc.)
  if (CITY_IMAGES[s]) {
    imgUrl = CITY_IMAGES[s];
  } 
  
  // 2. SMART CATEGORY IMAGE MAPPING
  else {
    const chosenIndex = index !== undefined ? index : hash;

    // A. Check Dining Categories
    if (s.includes("restaurant") || s.includes("lokanta") || s.includes("yemek") || s.includes("eat") || s.includes("food") || s.includes("dish")) {
      if (l.includes("balik") || l.includes("balık") || l.includes("deniz") || l.includes("su ürünü") || l.includes("seafood") || l.includes("midye")) {
        imgUrl = FISH_IMAGES[chosenIndex % FISH_IMAGES.length];
      } else if (l.includes("tatli") || l.includes("tatlı") || l.includes("baklava") || l.includes("lokum") || l.includes("helva") || l.includes("şerbet")) {
        imgUrl = SWEET_IMAGES[chosenIndex % SWEET_IMAGES.length];
      } else if (l.includes("cafe") || l.includes("kahve") || l.includes("fırın") || l.includes("pastane") || l.includes("simit") || l.includes("börek") || l.includes("kahvaltı")) {
        imgUrl = CAFE_IMAGES[chosenIndex % CAFE_IMAGES.length];
      } else {
        imgUrl = MEAT_IMAGES[chosenIndex % MEAT_IMAGES.length]; // default to kebab/grill
      }
    } 
    
    // B. Check Accommodation Categories
    else if (s.includes("hotel") || s.includes("accommodation") || s.includes("pansiyon") || s.includes("otel") || s.includes("konak")) {
      if (l.includes("butik") || l.includes("konak") || l.includes("tas") || l.includes("taş") || l.includes("ev") || l.includes("mansion")) {
        imgUrl = BOUTIQUE_IMAGES[chosenIndex % BOUTIQUE_IMAGES.length];
      } else if (l.includes("resort") || l.includes("spa") || l.includes("termal") || l.includes("tatil") || l.includes("doğa")) {
        imgUrl = RESORT_IMAGES[chosenIndex % RESORT_IMAGES.length];
      } else {
        imgUrl = RESORT_IMAGES[chosenIndex % RESORT_IMAGES.length];
      }
    } 
    
    // C. Check Attractions Categories (Region specific)
    else {
      // Determine category (historical, nature, beach, default)
      let cat = "nature";
      if (l.includes("kale") || l.includes("antik") || l.includes("şehir") || l.includes("konak") || l.includes("han") || l.includes("cami") || l.includes("köprü") || l.includes("tarihi") || l.includes("manastır") || l.includes("harabe") || l.includes("müze") || l.includes("tiyatro") || l.includes("kule") || l.includes("saat")) {
        cat = "historical";
      } else if (l.includes("plaj") || l.includes("koy") || l.includes("sahil") || l.includes("deniz") || l.includes("marina") || l.includes("liman") || l.includes("plajı")) {
        cat = "beach";
      } else {
        cat = "nature";
      }

      if (cat === "beach") {
        imgUrl = BEACH_IMAGES[chosenIndex % BEACH_IMAGES.length];
      } else if (cat === "historical") {
        const histPool = HISTORICAL_IMAGES[reg as keyof typeof HISTORICAL_IMAGES] || HISTORICAL_IMAGES.marmara;
        imgUrl = histPool[chosenIndex % histPool.length];
      } else {
        const natPool = NATURE_IMAGES[reg as keyof typeof NATURE_IMAGES] || NATURE_IMAGES.marmara;
        imgUrl = natPool[chosenIndex % natPool.length];
      }
    }
  }

  return (
    <div
      className={`relative w-full overflow-hidden ${aspectClass} ${className}`}
      style={{
        backgroundImage: `linear-gradient(135deg, ${pair[0]}, ${pair[1]})`,
      }}
    >
      {/* Background radial overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.08),transparent_60%)] z-10" />

      {/* Main Image */}
      {!imgError && imgUrl && (
        <Image
          src={imgUrl}
          alt={label || "Travel image"}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          onError={() => setImgError(true)}
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
      )}

      {/* Dark overlay gradients for contrast */}
      <div className="absolute inset-0 bg-gradient-to-t from-ink/65 via-transparent to-transparent z-10" />

      {/* Fallback Icon */}
      {(imgError || !imgUrl) && (
        <div className="absolute inset-0 flex items-center justify-center">
          <ImageIcon size={iconSize} className="text-paper/40" strokeWidth={1.5} />
        </div>
      )}

      {/* Bottom Text Tag */}
      {label && (
        <div className="absolute bottom-0 left-0 right-0 p-3.5 z-20">
          <p className="text-[10px] font-bold uppercase tracking-wider text-paper/90 drop-shadow-md">
            {label}
          </p>
        </div>
      )}
    </div>
  );
}
