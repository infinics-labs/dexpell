export type SupportedLanguage = 'en' | 'tr';

export type Messages = Record<string, any>;

export const messages: Record<SupportedLanguage, Messages> = {
  en: {
    nav: {
      brand: 'Dexpell AI',
      login: 'Login',
      getStarted: 'Get Started',
      instantQuotes: 'Instant Quotes',
      aiConfiguration: 'AI Configuration',
      apiAccess: 'API Access',
      company: 'Company',
      aboutUs: 'About Us',
      contact: 'Contact',
      careers: 'Careers',
      connect: 'Connect',
      whatsapp: 'WhatsApp',
      linkedin: 'LinkedIn',
      support: 'Support',
    },
    popup: {
      title: 'Ready to Transform Your Shipping?',
      subtitle:
        'Join thousands of businesses that trust Dexpell AI for their international shipping needs.',
      cta: { try: "Try Now - It's Free" },
      footnote: 'No credit card required • Instant results',
    },
    hero: {
      title: {
        prefix: '10 Years of Logistics Experience,',
        highlight: 'Now with AI',
      },
      subtitle:
        'Thousands of shipping experiences, millions of delivery points, all unified in one smart platform.',
      explainer:
        'analyzes historical shipments and current market data to provide you with the best shipping rates and optimal solutions.',
      explainer2:
        'Our AI-powered system, built by logistics experts, handles everything from sea freight to air cargo with human-like decision making.',
      cta: { quote: 'Get Instant Quote', team: 'Meet Our Digital Team' },
      tagline: {
        prefix: 'You just make the request —',
        suffix: 'Dexpell.ai takes care of the rest.',
      },
    },
    features: {
      heading: {
        prefix: 'Everything You Need for',
        highlight: 'Smart Shipping',
      },
      subheading: 'Advanced AI technology meets decades of logistics expertise',
    },
    feature: {
      rtq: {
        title: 'Real-Time Shipping Quotes',
        desc: 'Instant UPS Express pricing for international shipments from Turkey',
      },
      global: {
        title: 'Global Coverage',
        desc: 'Ship to any country worldwide with region-based pricing',
      },
      calc: {
        title: 'Smart Calculations',
        desc: 'Automatic volumetric weight calculation and optimal pricing',
      },
      compliance: {
        title: 'Compliance Check',
        desc: 'Built-in verification for prohibited items and shipping regulations',
      },
      team: {
        title: 'AI Powered Team',
        desc: 'Conversational interface for easy quote generation',
      },
      exp: {
        title: '10+ Years Experience',
        desc: 'Trusted by thousands of businesses for reliable shipping solutions',
      },
    },
    benefits: {
      heading: 'Why Choose Dexpell AI?',
      b1: 'Real-time shipping rate calculation',
      b2: 'Instant customs & HS code analysis',
      b3: 'Delivery time & route optimization',
      b4: 'Coverage in every country, every region',
      b5: 'WhatsApp, Web & API integration',
      b6: '24/7 AI-powered support',
    },
    about: {
      heading: { prefix: 'About', highlight: 'Us' },
      p1: 'At Dexpell, we are redefining the future of logistics solutions.',
      p2: 'In 2025, we took a bold step forward by enhancing our business model with artificial intelligence and smart technologies.',
      p3: 'By integrating artificial intelligence into critical processes such as demand forecasting, route planning, and operational efficiency, we are reshaping the road of logistics.',
      p4: 'With innovation at our core, we empower businesses to move smarter—beyond traditional freight forwarding—through AI-powered decision-making, automation, and digital agility.',
      p5: "Dexpell AI isn't just a feature—it's the engine behind a new era of logistics.",
    },
    cta: {
      title: 'Ready to Transform Your Shipping?',
      subtitle:
        'Join thousands of businesses that trust Dexpell AI for their international shipping needs.',
      try: "Try Now - It's Free",
    },
    footer: {
      tagline: 'AI-powered logistics solutions for modern businesses.',
      copyright: '© 2024 Dexpell AI. All rights reserved.',
    },
    chat: {
      new: 'New Chat',
      placeholder: "Ask about shipping costs (e.g. '5kg to Germany')...",
      wait: 'Please wait for the model to finish its response!',
      welcome: {
        title: 'Welcome to Dexpell Cargo Pricing!',
        subtitle: 'Get instant shipping quotes to anywhere in the world',
      },
      suggestions: {
        quote: {
          title: 'Get shipping quote',
          label: 'for my package',
          action: 'I need a shipping quote',
        },
        calculate: {
          title: 'Calculate shipping cost',
          label: 'for electronics to USA',
          action: 'Calculate shipping cost',
        },
        whatCanShip: {
          title: 'What can I ship',
          label: 'with your service?',
          action: 'What items can I ship with your service?',
        },
        checkRates: {
          title: 'Check shipping rates',
          label: 'to European countries',
          action: 'What are the shipping rates to European countries?',
        },
      },
    },
    digitalTeam: {
      heading: 'Meet the Dexpell Digital Team',
      subtitle: 'Global logistics services are not delivered by humans, but our data-driven digital specialists. They provide instant quotes, speak multiple languages, and never miss the details.',
      clickPrompt: 'Click on any available team member to watch their introduction video',
      agents: {
        nova: {
          name: 'Nova',
          title: 'Cargo Pricing Executive',
          description: 'Agile, precise, and street-smart. Nova handles e-commerce and courier delivery planning like no human ever could.',
          features: [
            'Last-mile cost optimization',
            'Courier service & speed analysis',
            'Nearest drop-off hub detection',
            'Marketplace integration',
            'Product-level shipping strategies'
          ]
        },
        arwen: {
          name: 'Arwen',
          title: 'Ocean Freight Pricing Executive',
          description: 'She knows the global trade lanes like the back of her hand. Arwen offers strategic, data-backed ocean freight quotes in seconds.',
          features: [
            'FCL / LCL quotations',
            'Transit time & ETA predictions',
            'Cut-off / CY-CY deadline alerts',
            'Alternative port/route suggestions',
            'Documentation & compliance guidance'
          ]
        },
        elif: {
          name: 'Elif',
          title: 'Air Freight Pricing Executive',
          description: "She doesn't just ship cargo — she delivers time. Elif calculates the fastest airfreight options with total precision.",
          features: [
            'Kg/volume-based pricing',
            'Flight schedule analysis',
            'Cut-off time notifications',
            'EXW, pickup & handling cost integration',
            'Airport-to-door delivery optimization'
          ]
        },
        lucas: {
          name: 'Lucas',
          title: 'Road Freight Pricing Executive',
          description: 'He thinks in kilometers and margins. Lucas delivers accurate trucking quotes, optimized routes, and delivery times instantly.',
          features: [
            'Route & weight-based freight estimation',
            'Lead time predictions',
            'Alternative date suggestions',
            'Supplier margin control',
            'Customs & transit route analysis'
          ]
        },
        sofia: {
          name: 'Sofia',
          title: 'Global Customs Consultant',
          description: "When your goods are at the border, it's already too late. Sofia predicts taxes, identifies HS codes, and flags regulatory issues — before you even ship.",
          features: [
            'HS/HTS code prediction from product details',
            'Country-specific duty & import tax calculation',
            'Trade agreement compliance (FTA, ATR, GSP)',
            'Anti-dumping / Section 232 risk detection',
            'Usage-based classification logic'
          ]
        }
      },
      modal: {
        videoComingSoon: 'Video Coming Soon',
        videoDescription: "'s introduction video will be available here. Ready for portrait video format (1280x720, 16:9 aspect ratio, MP4/H.264).",
        videoUrl: 'Video URL:',
        clickToWatch: 'Click to watch introduction'
      }
    },
  },
  tr: {
    nav: {
      brand: 'Dexpell AI',
      login: 'Giriş Yap',
      getStarted: 'Başla',
      instantQuotes: 'Anında Teklifler',
      aiConfiguration: 'Yapay Zeka Yapılandırması',
      apiAccess: 'API Erişimi',
      company: 'Şirket',
      aboutUs: 'Hakkımızda',
      contact: 'İletişim',
      careers: 'Kariyer',
      connect: 'Bağlantı Kurun',
      whatsapp: 'WhatsApp',
      linkedin: 'LinkedIn',
      support: 'Destek',
    },
    popup: {
      title: 'Gönderilerinizi dönüştürmeye hazır mısınız?',
      subtitle:
        'Uluslararası gönderi ihtiyaçlarında Dexpell AI\'a güvenen binlerce işletmeye katılın.',
      cta: { try: 'Hemen Dene – Ücretsiz' },
      footnote: 'Kredi kartı gerekmez • Anında sonuç',
    },
    hero: {
      title: {
        prefix: '10 Yıllık Lojistik Deneyimi,',
        highlight: 'Şimdi Yapay Zeka ile',
      },
      subtitle:
        'Binlerce gönderi deneyimi, milyonlarca teslimat noktası — hepsi tek bir akıllı platformda birleşti.',
      explainer:
        'geçmiş gönderi verilerini ve güncel piyasa bilgilerini analiz ederek size en uygun navlun fiyatlarını ve çözümleri sunar.',
      explainer2:
        'Lojistik uzmanları tarafından geliştirilen yapay zeka destekli sistemimiz, deniz taşımacılığından hava kargosuna kadar her süreci insan benzeri karar mekanizmaları ile yönetir.',
      cta: { quote: 'Anında Teklif Al', team: 'Dijital Ekibimizle Tanışın' },
      tagline: {
        prefix: 'Siz sadece talebi iletin —',
        suffix: 'Dexpell.ai gerisini halleder.',
      },
    },
    features: {
      heading: {
        prefix: 'Akıllı Gönderi İçin',
        highlight: 'İhtiyacınız Olan Her Şey',
      },
      subheading:
        'Gelişmiş yapay zeka teknolojisi, onlarca yıllık lojistik deneyimiyle buluşuyor',
    },
    feature: {
      rtq: {
        title: 'Anlık Gönderi Teklifleri',
        desc: 'Türkiye\'den uluslararası gönderiler için anında UPS Express fiyatlandırması',
      },
      global: {
        title: 'Küresel Kapsama',
        desc: 'Bölge bazlı fiyatlandırma ile dünyanın her ülkesine gönderim',
      },
      calc: {
        title: 'Akıllı Hesaplamalar',
        desc: 'Otomatik hacimsel ağırlık hesaplaması ve en uygun fiyatlandırma',
      },
      compliance: {
        title: 'Uygunluk Kontrolü',
        desc: 'Yasaklı ürünler ve taşıma kuralları için entegre doğrulama sistemi',
      },
      team: {
        title: 'Yapay Zeka Destekli Ekip',
        desc: 'Kolay teklif alımı için sohbet tabanlı arayüz',
      },
      exp: {
        title: '10+ Yıllık Deneyim',
        desc: 'Güvenilir lojistik çözümleri için binlerce işletme tarafından tercih ediliyor',
      },
    },
    benefits: {
      heading: 'Neden Dexpell AI?',
      b1: 'Anlık navlun fiyat hesaplaması',
      b2: 'Anında gümrük ve GTİP kodu analizi',
      b3: 'Teslimat süresi ve rota optimizasyonu',
      b4: 'Her ülke ve her bölgede kapsama alanı',
      b5: 'WhatsApp, Web ve API entegrasyonu',
      b6: '7/24 yapay zeka destekli müşteri desteği',
    },
    about: {
      heading: { prefix: 'Hakkımızda', highlight: '' },
      p1: 'Dexpell olarak lojistik çözümlerinin geleceğini yeniden tanımlıyoruz.',
      p2: '2025\'te, iş modelimizi yapay zeka ve akıllı teknolojilerle geliştirerek cesur bir adım attık.',
      p3: 'Yapay zekayı talep tahmini, rota planlama ve operasyonel verimlilik gibi kritik süreçlere entegre ederek lojistiğin yolunu yeniden şekillendiriyoruz.',
      p4: 'Yenilikçilik temelimizde yer alırken, işletmeleri yapay zeka destekli karar verme, otomasyon ve dijital çeviklik ile geleneksel nakliye sınırlarının ötesine taşıyoruz.',
      p5: 'Dexpell AI sadece bir özellik değil — lojistikte yeni bir çağın motorudur.',
    },
    cta: {
      title: 'Gönderilerinizi dönüştürmeye hazır mısınız?',
      subtitle:
        'Uluslararası gönderi ihtiyaçlarında Dexpell AI\'a güvenen binlerce işletmeye katılın.',
      try: 'Hemen Dene – Ücretsiz',
    },
    footer: {
      tagline: 'Modern işletmeler için yapay zeka destekli lojistik çözümleri.',
      copyright: '© 2024 Dexpell AI. Tüm hakları saklıdır.',
    },
    chat: {
      new: 'Yeni Sohbet',
      placeholder: "Kargo maliyetlerini sorun (ör. '5kg Almanya')...",
      wait: 'Lütfen modelin yanıtını tamamlamasını bekleyin! ',
      welcome: {
        title: 'Dexpell Kargo Fiyatlandırmasına Hoş Geldiniz!',
        subtitle: 'Dünyanın her yerine anında kargo fiyat teklifi alın',
      },
      suggestions: {
        quote: {
          title: 'Kargo teklifi al',
          label: 'paketim için',
          action: 'Kargo teklifi almak istiyorum',
        },
        calculate: {
          title: 'Kargo maliyeti hesapla',
          label: 'ABD\'ye elektronik için',
          action: 'Kargo maliyetini hesapla',
        },
        whatCanShip: {
          title: 'Ne gönderebilirim',
          label: 'hizmetinizle?',
          action: 'Hizmetinizle hangi ürünleri gönderebilirim?',
        },
        checkRates: {
          title: 'Kargo ücretlerini kontrol et',
          label: 'Avrupa ülkelerine',
          action: 'Avrupa ülkelerine kargo ücretleri nedir?',
        },
      },
    },
    digitalTeam: {
      heading: 'Dexpell Dijital Ekibi ile Tanışın',
      subtitle: 'Küresel lojistik hizmetleri insanlar tarafından değil, veri odaklı dijital uzmanlarımız tarafından sunuluyor. Anında teklifler veriyorlar, birden fazla dil konuşuyorlar ve hiçbir detayı kaçırmıyorlar.',
      clickPrompt: 'Tanıtım videosunu izlemek için herhangi bir mevcut ekip üyesine tıklayın',
      agents: {
        nova: {
          name: 'Nova',
          title: 'Kargo Fiyatlandırma Uzmanı',
          description: 'Çevik, hassas ve sokak zekası olan. Nova, e-ticaret ve kurye teslimat planlamasını hiçbir insanın yapamayacağı şekilde yönetiyor.',
          features: [
            'Son kilometre maliyet optimizasyonu',
            'Kurye servisi ve hız analizi',
            'En yakın teslimat hub tespiti',
            'Marketplace entegrasyonu',
            'Ürün bazlı nakliye stratejileri'
          ]
        },
        arwen: {
          name: 'Arwen',
          title: 'Denizyolu Taşımacılığı Fiyatlandırma Sorumlusu',
          description: 'Küresel ticaret rotalarını avucunun içi gibi biliyor. Arwen, saniyeler içinde stratejik, veri destekli deniz taşımacılığı teklifleri sunuyor.',
          features: [
            'FCL / LCL teklifleri',
            'Transit süresi ve ETA tahminleri',
            'Son teslim / CY-CY deadline uyarıları',
            'Alternatif liman/rota önerileri',
            'Dokümantasyon ve uyumluluk rehberliği'
          ]
        },
        elif: {
          name: 'Elif',
          title: 'Havayolu Taşımacılığı Fiyatlandırma Sorumlusu',
          description: 'Sadece kargo taşımıyor - zaman teslim ediyor. Elif, en hızlı hava taşımacılığı seçeneklerini tam bir hassasiyetle hesaplıyor.',
          features: [
            'Kg/hacim bazlı fiyatlandırma',
            'Uçuş programı analizi',
            'Son teslim zamanı bildirimleri',
            'EXW, toplama ve handling maliyet entegrasyonu',
            'Havaalanından kapıya teslimat optimizasyonu'
          ]
        },
        lucas: {
          name: 'Lucas',
          title: 'Karayolu Taşımacılığı Fiyatlandırma Sorumlusu',
          description: 'Kilometre ve marj olarak düşünüyor. Lucas, doğru kamyon tekliflerini, optimize edilmiş rotaları ve teslimat sürelerini anında sunuyor.',
          features: [
            'Rota ve ağırlık bazlı nakliye tahmini',
            'Teslim süresi tahminleri',
            'Alternatif tarih önerileri',
            'Tedarikçi marj kontrolü',
            'Gümrük ve transit rota analizi'
          ]
        },
        sofia: {
          name: 'Sofia',
          title: 'Uluslararası Gümrük Danışmanı',
          description: 'Mallarınız sınırda olduğunda, artık çok geç. Sofia vergileri tahmin ediyor, HS kodlarını belirliyor ve düzenleyici sorunları işaretliyor - siz daha göndermeden önce.',
          features: [
            'Ürün detaylarından HS/HTS kod tahmini',
            'Ülkeye özel gümrük vergisi ve ithalat vergisi hesaplaması',
            'Ticaret anlaşması uyumluluğu (FTA, ATR, GSP)',
            'Anti-damping / Bölüm 232 risk tespiti',
            'Kullanım bazlı sınıflandırma mantığı'
          ]
        }
      },
      modal: {
        videoComingSoon: 'Video Yakında Geliyor',
        videoDescription: ' tanıtım videosu burada mevcut olacak. Dikey video formatı için hazır (1280x720, 16:9 en boy oranı, MP4/H.264).',
        videoUrl: 'Video URL:',
        clickToWatch: 'Tanıtımı izlemek için tıklayın'
      }
    },
  },
};

export function translate(lang: SupportedLanguage, key: string): string {
  const dict = messages[lang] || messages.en;
  const parts = key.split('.');
  let cur: any = dict;
  for (const p of parts) {
    if (cur && Object.prototype.hasOwnProperty.call(cur, p)) {
      cur = cur[p];
    } else {
      return key;
    }
  }
  return typeof cur === 'string' ? cur : key;
}