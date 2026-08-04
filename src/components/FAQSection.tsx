"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface FAQSectionProps {
  name: string;
  whenToGo: string;
  howToGetThere: string;
  budget: string;
  whatToEat: string;
  locale?: string;
}

export default function FAQSection({
  name,
  whenToGo,
  howToGetThere,
  budget,
  whatToEat,
  locale = "tr",
}: FAQSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      q: locale === "tr" 
        ? `${name} seyahati için en ideal zaman hangisidir?` 
        : `What is the best time to visit ${name}?`,
      a: whenToGo
    },
    {
      q: locale === "tr" 
        ? `${name} bölgesine nasıl ulaşım sağlanır?` 
        : `How can I travel to ${name}?`,
      a: howToGetThere
    },
    {
      q: locale === "tr" 
        ? `${name} seyahati için bütçe planlaması nasıl olmalıdır?` 
        : `What is the budget planning for ${name}?`,
      a: budget
    },
    {
      q: locale === "tr"
        ? `${name} seyahatinde tadılması gereken en meşhur yöresel lezzetler nelerdir?`
        : `What are the most famous local dishes to try in ${name}?`,
      a: whatToEat
    },
    {
      q: locale === "tr"
        ? `${name} gezisi için kaç gün ayırmak gerekir?`
        : `How many days are recommended for visiting ${name}?`,
      a: locale === "tr"
        ? `${name} ve çevresini tam anlamıyla keşfetmek, tarihi ve doğal güzelliklerin tadını çıkarmak için en az 2 ila 3 günlük bir seyahat süresi planlamanızı tavsiye ederiz.`
        : `We recommend planning a trip of at least 2 to 3 days to fully explore ${name} and enjoy its rich historical and natural beauty.`
    },
    {
      q: locale === "tr"
        ? `${name} seyahatinde mutlaka görülmesi gereken en popüler yerler nerelerdir?`
        : `What are the top must-visit attractions and locations in ${name}?`,
      a: locale === "tr"
        ? `${name} sınırlarında yer alan popüler cazibe merkezleri arasında tarihi kaleler, kanyonlar, müzeler, antik kent kalıntıları, doğal milli parklar ve manzara seyir terasları yer almaktadır.`
        : `Top tourist spots in ${name} include historic castles, canyons, museums, ancient ruins, natural national parks, and scenic viewpoints.`
    },
    {
      q: locale === "tr"
        ? `${name} bölgesinde konaklama için ne tür seçenekler bulunmaktadır?`
        : `What accommodation options are available for travellers in ${name}?`,
      a: locale === "tr"
        ? `Bölgede her bütçe ve tarza uygun butik oteller, pansiyonlar, tatil köyleri, dağ evleri ve doğa ile iç içe kamp alanları hizmet vermektedir.`
        : `The region offers boutique hotels, guest houses, resorts, alpine chalets, and nature campsites suitable for all budgets and travel styles.`
    },
    {
      q: locale === "tr"
        ? `${name} seyahatinden dönerken hediyelik olarak ne satın alınabilir?`
        : `What are the best local souvenirs and items to buy from ${name}?`,
      a: locale === "tr"
        ? `Yöresel el sanatları ürünleri, organik tarım ürünleri, tescilli yöresel baharatlar ve geleneksel motifli dokumalar satın alınabilecek en güzel hediyeliklerdir.`
        : `Popular souvenirs from ${name} include handcrafted local goods, organic produce, authentic regional spices, and traditional woven textiles.`
    },
    {
      q: locale === "tr"
        ? `${name} çocuklu aileler için uygun bir seyahat destinasyonu mudur?`
        : `Is ${name} a family-friendly travel destination for kids?`,
      a: locale === "tr"
        ? `Evet, geniş parkları, yürüyüş yolları, çocuk dostu plajları/otelleri ve güvenli atmosferi ile aileler için oldukça ideal bir seyahat noktasıdır.`
        : `Yes, ${name} is highly suitable for families due to its spacious parks, walking paths, child-friendly beaches/hotels, and safe environment.`
    },
    {
      q: locale === "tr"
        ? `${name} bölgesini ilk kez ziyaret edeceklere tavsiyeler nelerdir?`
        : `What are the best tips for first-time visitors to ${name}?`,
      a: locale === "tr"
        ? `Rahat yürüyüş ayakkabıları tercih etmeniz, yanınızda küçük miktarlarda nakit para bulundurmanız ve popüler mekanlar için biletlerinizi önceden ayırtmanız önerilir.`
        : `It is highly recommended to wear comfortable walking shoes, carry cash, and book tickets in advance for popular sightseeing spots in ${name}.`
    }
  ];

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(f => ({
      "@type": "Question",
      "name": f.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": f.a
      }
    }))
  };

  return (
    <div className="mt-16 rounded-2xl border border-ink/8 bg-paper p-6 sm:p-8 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <h2 className="font-display text-2xl italic text-ink mb-6">
        {locale === "tr" ? "Sıkça Sorulan Sorular" : "Frequently Asked Questions"}
      </h2>
      <div className="space-y-4">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div key={idx} className="border-b border-ink/5 pb-4">
              <button
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                className="flex w-full items-center justify-between gap-4 text-left font-bold text-ink hover:text-kiremit transition-colors cursor-pointer text-sm sm:text-base"
              >
                <span>{faq.q}</span>
                {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>
              <p className={`mt-3 text-sm text-ink/70 leading-relaxed font-semibold transition-all duration-200 ${isOpen ? "block" : "hidden"}`}>
                {faq.a}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
