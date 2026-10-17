// ==========================================================================
// SHARP CRACKERS - DATA SERVICE & PERSISTENCE LAYER
// Real database simulation via localStorage with cross-tab live synchronization
// ==========================================================================

const STORAGE_KEYS = {
  SETTINGS: 'sharp_crackers_settings',
  CATEGORIES: 'sharp_crackers_categories',
  PRODUCTS: 'sharp_crackers_products',
  ORDERS: 'sharp_crackers_orders',
  DELETED_ORDERS: 'sharp_crackers_deleted_orders',
  ENQUIRIES: 'sharp_crackers_enquiries',
  ADMIN_SESSION: 'sharp_crackers_admin_session'
};

// Cross-tab broadcast channel
const broadcastChannel = typeof window !== 'undefined' && 'BroadcastChannel' in window 
  ? new BroadcastChannel('sharp_crackers_channel') 
  : null;

export const notifyDataChanged = (payload = { type: 'DATA_CHANGED' }) => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('sharp_data_changed', { detail: payload }));
    if (broadcastChannel) {
      try {
        broadcastChannel.postMessage(payload);
      } catch (err) {
        console.error('BroadcastChannel error:', err);
      }
    }
  }
};

// Default Store Configuration
const DEFAULT_SETTINGS = {
  shopName: "SHARP CRACKERS",
  tagline: "Light Up Your Celebrations!",
  subtitle: "Direct From Sivakasi • 100% Genuine Green Crackers • Retail & Online",
  phone: "+91 98421 23456",
  altPhone: "+91 94432 78901",
  whatsapp: "919842123456",
  email: "sales@sharpcrackers.com",
  address: "145/2, By-Pass Road, Near New Bus Stand, Sivakasi - 626123, Tamil Nadu, India",
  branchAddress: "Showroom: 78, Madurai Main Highway, Virudhunagar Dist, Tamil Nadu",
  businessHours: "8:00 AM – 10:00 PM (Monday – Sunday)",
  currencySymbol: "₹",
  minOrderAmount: 1500,
  deliveryCharge: 150,
  freeDeliveryThreshold: 5000,
  promoBannerText: "💥 DIWALI 2026 SPECIAL OFFER: Flat Direct Sourcing with Heavy Savings! Order online now for guaranteed express delivery! 🎆",
  logoUrl: "/images/beats_crackers_logo.jpg",
  heroBannerUrl: "/images/hero_banner_1791567625102.jpg"
};

// Permanent 3-Digit Continuous Serial Numbers across all categories (001 -> 027)
export const PRODUCT_SERIAL_NUMBERS = {
  'SC-SP01': '001',
  'SC-SP02': '002',
  'SC-SP03': '003',
  'SC-SP04': '004',
  'SC-FP01': '005',
  'SC-FP02': '006',
  'SC-FP03': '007',
  'SC-GC01': '008',
  'SC-GC02': '009',
  'SC-GC03': '010',
  'SC-RK01': '011',
  'SC-RK02': '012',
  'SC-RK03': '013',
  'SC-SD01': '014',
  'SC-SD02': '015',
  'SC-SD03': '016',
  'SC-FC01': '017',
  'SC-FC02': '018',
  'SC-FC03': '019',
  'SC-FC04': '020',
  'SC-GB01': '021',
  'SC-GB02': '022',
  'SC-GB03': '023',
  'SC-KD01': '024',
  'SC-KD02': '025',
  'SC-BM01': '026',
  'SC-BM02': '027'
};

// Bilingual Tamil Names for All Products (English / தமிழ்)
export const PRODUCT_TAMIL_NAMES = {
  'SC-SP01': '10 செ.மீ எலக்ட்ரிக் மத்தாப்பு',
  'SC-SP02': '15 செ.மீ சிடில் மத்தாப்பு',
  'SC-SP03': '30 செ.மீ டீலக்ஸ் தங்க மத்தாப்பு',
  'SC-SP04': '50 செ.மீ முவர்ண மெகா மத்தாப்பு',
  'SC-FP01': 'பூந்தொட்டி ஸ்பெஷல்',
  'SC-FP02': 'பூந்தொட்டி அசோகா கலர்',
  'SC-FP03': 'பூந்தொட்டி டீலக்ஸ் ஜெயண்ட்',
  'SC-GC01': 'தரை சக்கரம் ஸ்பெஷல்',
  'SC-GC02': 'தரை சக்கரம் டீலக்ஸ் பெரியது',
  'SC-GC03': '4x4 ஸ்பின்னர் சக்கரம்',
  'SC-RK01': 'பேபி ராக்கெட் (சிகப்பு)',
  'SC-RK02': 'லூனிக் விசில் ராக்கெட்',
  'SC-RK03': 'பாராசூட் ராக்கெட்',
  'SC-SD01': '100 வாலா சிகப்பு சரவெடி',
  'SC-SD02': '1000 வாலா டீலக்ஸ் சரவெடி',
  'SC-SD03': '5000 வாலா ராயல் மெகா சரவெடி',
  'SC-FC01': 'மயில் டான்சிங் பவுண்டன்',
  'SC-FC02': 'நைட் ஸ்டார் கலர் பவுண்டன்',
  'SC-FC03': '12 ஷாட்ஸ் வானவேடிக்கை',
  'SC-FC04': '30 ஷாட்ஸ் ரெயின்போ வானவேடிக்கை',
  'SC-GB01': 'கிட்ஸ் ஜாய் பாக்ஸ் (21 ரகங்கள்)',
  'SC-GB02': 'ஃபேமிலி ஸ்பார்க்கிள் பேக் (35 ரகங்கள்)',
  'SC-GB03': 'ராயல் விஐபி கிப்ட் பாக்ஸ் (50 ரகங்கள்)',
  'SC-KD01': 'வெங்காய வெடி (பாப்-பாப்)',
  'SC-KD02': 'பாம்பு மாத்திரை & விசில்',
  'SC-BM01': 'ரெட் போர்ட் ஹைட்ரஜன் வெடி',
  'SC-BM02': 'பிஜிலி பட்டாசு (100 பீஸ்)'
};

export const CATEGORY_TAMIL_NAMES = {
  'all': 'அனைத்து ரகங்கள்',
  'sparklers': 'கம்பி மத்தாப்பு',
  'flower-pots': 'பூந்தொட்டி',
  'ground-chakkars': 'தரை சக்கரம்',
  'rockets': 'ராக்கெட்',
  'sound-crackers': 'சரவெடி & வெடி',
  'fancy-crackers': 'வானவேடிக்கை',
  'gift-boxes': 'கிப்ட் பாக்ஸ்',
  'kids-special': 'குழந்தைகள் ரகம்',
  'bombs': 'ஹைட்ரஜன் & பிஜிலி'
};

// Default Categories
const DEFAULT_CATEGORIES = [
  { id: "all", name: "All Products", ta: "அனைத்து ரகங்கள்", icon: "✨", image: "/images/hero_banner_1791567625102.jpg", active: true },
  { id: "sparklers", name: "Sparklers", ta: "கம்பி மத்தாப்பு", icon: "🪄", image: "/images/product_sparkler_1791567639029.jpg", active: true },
  { id: "flower-pots", name: "Flower Pots", ta: "பூந்தொட்டி", icon: "🪴", image: "/images/product_flowerpots.jpg", active: true },
  { id: "ground-chakkars", name: "Ground Chakkars", ta: "தரை சக்கரம்", icon: "🌀", image: "/images/product_chakkars.jpg", active: true },
  { id: "rockets", name: "Rockets & Aerial", ta: "ராக்கெட்", icon: "🚀", image: "/images/product_rockets.jpg", active: true },
  { id: "sound-crackers", name: "Sound Crackers & Garlands", ta: "சரவெடி & வெடி", icon: "💥", image: "/images/product_garland.jpg", active: true },
  { id: "fancy-crackers", name: "Fancy Fountains & Sky Shots", ta: "வானவேடிக்கை", icon: "🎆", image: "/images/product_fountain_1791567652291.jpg", active: true },
  { id: "gift-boxes", name: "Diwali Gift Boxes", ta: "கிப்ட் பாக்ஸ்", icon: "🎁", image: "/images/product_giftpack_1791567665442.jpg", active: true },
  { id: "kids-special", name: "Kids' Special Novelties", ta: "குழந்தைகள் ரகம்", icon: "🧸", image: "/images/product_chakkars.jpg", active: true },
  { id: "bombs", name: "Atom Bombs & Bijili", ta: "ஹைட்ரஜன் & பிஜிலி", icon: "💣", image: "/images/product_garland.jpg", active: true }
];

// Default Products (mapped to genuine images in /images/ with 3-digit serial numbers)
const DEFAULT_PRODUCTS = [
  // Sparklers (001 - 004)
  {
    id: "prod-1",
    sno: "001",
    code: "SC-SP01",
    name: "10 cm Electric Sparklers",
    category: "sparklers",
    packDetails: "10 pcs / box",
    unitPrice: 45,
    mrp: 180,
    image: "/images/product_sparkler_1791567639029.jpg",
    inStock: true,
    isBestseller: true,
    isFeatured: true,
    description: "Bright golden sparks with cool silver embers. Ideal for children with low smoke."
  },
  {
    id: "prod-2",
    sno: "002",
    code: "SC-SP02",
    name: "15 cm Crackling Sparklers",
    category: "sparklers",
    packDetails: "10 pcs / box",
    unitPrice: 75,
    mrp: 290,
    image: "/images/product_sparkler_1791567639029.jpg",
    inStock: true,
    isBestseller: false,
    isFeatured: false,
    description: "Crisp crackling sound with high luminous white stars."
  },
  {
    id: "prod-3",
    sno: "003",
    code: "SC-SP03",
    name: "30 cm Deluxe Golden Sparklers",
    category: "sparklers",
    packDetails: "5 pcs / box",
    unitPrice: 110,
    mrp: 420,
    image: "/images/product_sparkler_1791567639029.jpg",
    inStock: true,
    isBestseller: true,
    isFeatured: true,
    description: "Long-burning 30cm rods providing sustained golden aura for memorable photos."
  },
  {
    id: "prod-4",
    sno: "004",
    code: "SC-SP04",
    name: "50 cm Tri-Color Mega Sparklers",
    category: "sparklers",
    packDetails: "5 pcs / box",
    unitPrice: 195,
    mrp: 750,
    image: "/images/product_sparkler_1791567639029.jpg",
    inStock: true,
    isBestseller: false,
    isFeatured: false,
    description: "Spectacular 50cm showstopper sparkler shifting between green, red, and gold."
  },

  // Flower Pots (005 - 007)
  {
    id: "prod-5",
    sno: "005",
    code: "SC-FP01",
    name: "Flower Pot Special (Standard)",
    category: "flower-pots",
    packDetails: "10 pcs / box",
    unitPrice: 130,
    mrp: 520,
    image: "/images/product_flowerpots.jpg",
    inStock: true,
    isBestseller: true,
    isFeatured: true,
    description: "Classic Sivakasi flower pots bursting with dense golden rain up to 8 feet high."
  },
  {
    id: "prod-6",
    sno: "006",
    code: "SC-FP02",
    name: "Flower Pot Ashoka Color",
    category: "flower-pots",
    packDetails: "10 pcs / box",
    unitPrice: 180,
    mrp: 690,
    image: "/images/product_flowerpots.jpg",
    inStock: true,
    isBestseller: false,
    isFeatured: false,
    description: "Vibrant multi-stage color eruption transitioning from emerald green to crimson red."
  },
  {
    id: "prod-7",
    sno: "007",
    code: "SC-FP03",
    name: "Flower Pot Deluxe Giant",
    category: "flower-pots",
    packDetails: "10 pcs / box",
    unitPrice: 260,
    mrp: 980,
    image: "/images/product_flowerpots.jpg",
    inStock: true,
    isBestseller: true,
    isFeatured: true,
    description: "Extra heavy propellant fountain soaring over 15 feet with thick glitter canopy."
  },

  // Ground Chakkars (008 - 010)
  {
    id: "prod-8",
    sno: "008",
    code: "SC-GC01",
    name: "Ground Chakkar Special",
    category: "ground-chakkars",
    packDetails: "10 pcs / box",
    unitPrice: 90,
    mrp: 350,
    image: "/images/product_chakkars.jpg",
    inStock: true,
    isBestseller: true,
    isFeatured: false,
    description: "Smooth clockwise spinning wheels casting concentric fiery circles."
  },
  {
    id: "prod-9",
    sno: "009",
    code: "SC-GC02",
    name: "Ground Chakkar Deluxe Big",
    category: "ground-chakkars",
    packDetails: "10 pcs / box",
    unitPrice: 140,
    mrp: 540,
    image: "/images/product_chakkars.jpg",
    inStock: true,
    isBestseller: false,
    isFeatured: true,
    description: "High-speed spinning wheels with extended burn time and golden flare ring."
  },
  {
    id: "prod-10",
    sno: "010",
    code: "SC-GC03",
    name: "4x4 Spinner Chakkar Wheel",
    category: "ground-chakkars",
    packDetails: "5 pcs / box",
    unitPrice: 220,
    mrp: 850,
    image: "/images/product_chakkars.jpg",
    inStock: true,
    isBestseller: true,
    isFeatured: false,
    description: "Whistling color-changing rotational vortex that dazzles the entire courtyard."
  },

  // Rockets & Aerial (011 - 013)
  {
    id: "prod-11",
    sno: "011",
    code: "SC-RK01",
    name: "Baby Rocket (Red Star)",
    category: "rockets",
    packDetails: "10 pcs / box",
    unitPrice: 85,
    mrp: 320,
    image: "/images/product_rockets.jpg",
    inStock: true,
    isBestseller: false,
    isFeatured: false,
    description: "Swift ascending stick rocket bursting into a bright ruby star in the sky."
  },
  {
    id: "prod-12",
    sno: "012",
    code: "SC-RK02",
    name: "Lunik Flying Whistling Rocket",
    category: "rockets",
    packDetails: "10 pcs / box",
    unitPrice: 160,
    mrp: 620,
    image: "/images/product_rockets.jpg",
    inStock: true,
    isBestseller: true,
    isFeatured: true,
    description: "Piercing whistle on ascent concluding in a resounding aerial bang."
  },
  {
    id: "prod-13",
    sno: "013",
    code: "SC-RK03",
    name: "Sky Parachute Rocket",
    category: "rockets",
    packDetails: "5 pcs / box",
    unitPrice: 380,
    mrp: 1450,
    image: "/images/product_rockets.jpg",
    inStock: true,
    isBestseller: false,
    isFeatured: true,
    description: "Launches high into stratosphere and ejects an illuminated descending parachute."
  },

  // Sound Crackers & Garlands (014 - 016)
  {
    id: "prod-14",
    sno: "014",
    code: "SC-SD01",
    name: "100 Wala Red Cracker Garland",
    category: "sound-crackers",
    packDetails: "1 pc",
    unitPrice: 70,
    mrp: 270,
    image: "/images/product_garland.jpg",
    inStock: true,
    isBestseller: true,
    isFeatured: false,
    description: "Traditional continuous rhythm red paper crackers for auspicious beginnings."
  },
  {
    id: "prod-15",
    sno: "015",
    code: "SC-SD02",
    name: "1000 Wala Deluxe Garland (Ladi)",
    category: "sound-crackers",
    packDetails: "1 pc",
    unitPrice: 390,
    mrp: 1520,
    image: "/images/product_garland.jpg",
    inStock: true,
    isBestseller: true,
    isFeatured: true,
    description: "Non-stop thunderous cadence with thick celebratory smoke and red carpet floor."
  },
  {
    id: "prod-16",
    sno: "016",
    code: "SC-SD03",
    name: "5000 Wala Royal Mega Garland",
    category: "sound-crackers",
    packDetails: "1 pc",
    unitPrice: 1950,
    mrp: 7500,
    image: "/images/product_garland.jpg",
    inStock: true,
    isBestseller: false,
    isFeatured: true,
    description: "The grand master garland with heavy rhythm, giant bottom finale bombs."
  },

  // Fancy Fountains & Sky Shots (017 - 020)
  {
    id: "prod-17",
    sno: "017",
    code: "SC-FC01",
    name: "Peacock Dancing Fountain",
    category: "fancy-crackers",
    packDetails: "1 pc",
    unitPrice: 180,
    mrp: 680,
    image: "/images/product_fountain_1791567652291.jpg",
    inStock: true,
    isBestseller: true,
    isFeatured: true,
    description: "Majestic fanned plume mimicking peacock plumage with whistling color bursts."
  },
  {
    id: "prod-18",
    sno: "018",
    code: "SC-FC02",
    name: "Night Star Multi-Color Fountain",
    category: "fancy-crackers",
    packDetails: "5 pcs / box",
    unitPrice: 340,
    mrp: 1290,
    image: "/images/product_fountain_1791567652291.jpg",
    inStock: true,
    isBestseller: false,
    isFeatured: false,
    description: "High density metallic gold & titanium silver sparks erupting sequentially."
  },
  {
    id: "prod-19",
    sno: "019",
    code: "SC-FC03",
    name: "12 Shots Sky Wonder Repeater",
    category: "fancy-crackers",
    packDetails: "1 box",
    unitPrice: 450,
    mrp: 1750,
    image: "/images/product_fountain_1791567652291.jpg",
    inStock: true,
    isBestseller: true,
    isFeatured: true,
    description: "12 consecutive high-altitude bursts with color peonies and crackling willows."
  },
  {
    id: "prod-20",
    sno: "020",
    code: "SC-FC04",
    name: "30 Shots Rainbow Crackling Sky Burst",
    category: "fancy-crackers",
    packDetails: "1 box",
    unitPrice: 1150,
    mrp: 4400,
    image: "/images/product_fountain_1791567652291.jpg",
    inStock: true,
    isBestseller: false,
    isFeatured: true,
    description: "Pro-grade pyro box firing 30 aerial bouquets in alternating rainbow waves."
  },

  // Diwali Gift Boxes (021 - 023)
  {
    id: "prod-21",
    sno: "021",
    code: "SC-GB01",
    name: "Sharp Kids Joy Box (21 Items)",
    category: "gift-boxes",
    packDetails: "1 Family Pack",
    unitPrice: 690,
    mrp: 2650,
    image: "/images/product_giftpack_1791567665442.jpg",
    inStock: true,
    isBestseller: true,
    isFeatured: true,
    description: "Handpicked assortment of child-safe sparklers, chakkars, pots, and snappers."
  },
  {
    id: "prod-22",
    sno: "022",
    code: "SC-GB02",
    name: "Sharp Family Sparkle Pack (35 Items)",
    category: "gift-boxes",
    packDetails: "1 Mega Box",
    unitPrice: 1490,
    mrp: 5800,
    image: "/images/product_giftpack_1791567665442.jpg",
    inStock: true,
    isBestseller: true,
    isFeatured: true,
    description: "Complete festival box covering ground spinners, fountains, rockets, and garlands."
  },
  {
    id: "prod-23",
    sno: "023",
    code: "SC-GB03",
    name: "Sharp Royal Deluxe VIP Box (50 Items)",
    category: "gift-boxes",
    packDetails: "1 Luxury Trunk",
    unitPrice: 2750,
    mrp: 10500,
    image: "/images/product_giftpack_1791567665442.jpg",
    inStock: true,
    isBestseller: false,
    isFeatured: true,
    description: "Premium corporate and family gift pack with top-tier Sivakasi export items."
  },

  // Kids Special Novelties (024 - 025)
  {
    id: "prod-24",
    sno: "024",
    code: "SC-KD01",
    name: "Pop-Pop Crackling Snappers",
    category: "kids-special",
    packDetails: "50 pcs / box",
    unitPrice: 35,
    mrp: 130,
    image: "/images/product_chakkars.jpg",
    inStock: true,
    isBestseller: true,
    isFeatured: false,
    description: "Throw on ground to pop! Completely matchless and 100% child safe."
  },
  {
    id: "prod-25",
    sno: "025",
    code: "SC-KD02",
    name: "Magic Whistling Snake Eggs",
    category: "kids-special",
    packDetails: "10 pcs / box",
    unitPrice: 45,
    mrp: 160,
    image: "/images/product_chakkars.jpg",
    inStock: true,
    isBestseller: false,
    isFeatured: false,
    description: "Grows into long crackling carbon snakes with fun whistling sound."
  },

  // Atom Bombs & Bijili (026 - 027)
  {
    id: "prod-26",
    sno: "026",
    code: "SC-BM01",
    name: "Red Fort Hydrogen Bomb (Green Label)",
    category: "bombs",
    packDetails: "10 pcs / box",
    unitPrice: 120,
    mrp: 460,
    image: "/images/product_garland.jpg",
    inStock: true,
    isBestseller: true,
    isFeatured: false,
    description: "Thick jute-wrapped loud sound bomb manufactured under PESO safety guidelines."
  },
  {
    id: "prod-27",
    sno: "027",
    code: "SC-BM02",
    name: "Bijili Crackers (Stripped)",
    category: "bombs",
    packDetails: "100 pcs / pkt",
    unitPrice: 60,
    mrp: 230,
    image: "/images/product_garland.jpg",
    inStock: true,
    isBestseller: false,
    isFeatured: false,
    description: "Crisp popping Bijili crackers for lively daytime celebration rhythms."
  }
];

// Initial Realistic Sample Orders for Admin Dashboard
const DEFAULT_ORDERS = [
  {
    orderId: "SC-2026-1082",
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    customer: {
      name: "Suresh Kumar",
      phone: "9876543210",
      email: "suresh.kumar@example.com",
      deliveryType: "delivery",
      address: "No. 12, Anna Nagar West, Madurai - 625020",
      notes: "Please deliver before Friday evening."
    },
    items: [
      { id: "prod-1", code: "SC-SP01", name: "10 cm Electric Sparklers", packDetails: "10 pcs / box", unitPrice: 45, quantity: 4, totalPrice: 180, image: "/images/product_sparkler_1791567639029.jpg" },
      { id: "prod-5", code: "SC-FP01", name: "Flower Pot Special (Standard)", packDetails: "10 pcs / box", unitPrice: 130, quantity: 2, totalPrice: 260, image: "/images/product_flowerpots.jpg" },
      { id: "prod-8", code: "SC-GC01", name: "Ground Chakkar Special", packDetails: "10 pcs / box", unitPrice: 90, quantity: 3, totalPrice: 270, image: "/images/product_chakkars.jpg" },
      { id: "prod-22", code: "SC-GB02", name: "Sharp Family Sparkle Pack (35 Items)", packDetails: "1 Mega Box", unitPrice: 1490, quantity: 1, totalPrice: 1490, image: "/images/product_giftpack_1791567665442.jpg" }
    ],
    subtotal: 2200,
    deliveryCharge: 150,
    grandTotal: 2350,
    status: "Pending"
  },
  {
    orderId: "SC-2026-1045",
    createdAt: new Date(Date.now() - 3600000 * 28).toISOString(),
    customer: {
      name: "Priya Sundaram",
      phone: "9842198421",
      email: "priya.sundar@gmail.com",
      deliveryType: "pickup",
      address: "Store Pickup - Sivakasi Showroom",
      notes: "Will pick up around 6 PM."
    },
    items: [
      { id: "prod-15", code: "SC-SD02", name: "1000 Wala Deluxe Garland (Ladi)", packDetails: "1 pc", unitPrice: 390, quantity: 2, totalPrice: 780, image: "/images/product_garland.jpg" },
      { id: "prod-19", code: "SC-FC03", name: "12 Shots Sky Wonder Repeater", packDetails: "1 box", unitPrice: 450, quantity: 2, totalPrice: 900, image: "/images/product_fountain_1791567652291.jpg" },
      { id: "prod-3", code: "SC-SP03", name: "30 cm Deluxe Golden Sparklers", packDetails: "5 pcs / box", unitPrice: 110, quantity: 5, totalPrice: 550, image: "/images/product_sparkler_1791567639029.jpg" }
    ],
    subtotal: 2230,
    deliveryCharge: 0,
    grandTotal: 2230,
    status: "Processing"
  },
  {
    orderId: "SC-2026-0988",
    createdAt: new Date(Date.now() - 3600000 * 72).toISOString(),
    customer: {
      name: "Murugan Enterprises",
      phone: "9443312345",
      email: "murugan.office@yahoo.com",
      deliveryType: "delivery",
      address: "Plot 88, SIDCO Industrial Estate, Coimbatore - 641021",
      notes: "Company staff Diwali gift packs."
    },
    items: [
      { id: "prod-23", code: "SC-GB03", name: "Sharp Royal Deluxe VIP Box (50 Items)", packDetails: "1 Luxury Trunk", unitPrice: 2750, quantity: 3, totalPrice: 8250, image: "/images/product_giftpack_1791567665442.jpg" },
      { id: "prod-16", code: "SC-SD03", name: "5000 Wala Royal Mega Garland", packDetails: "1 pc", unitPrice: 1950, quantity: 1, totalPrice: 1950, image: "/images/product_garland.jpg" }
    ],
    subtotal: 10200,
    deliveryCharge: 0,
    grandTotal: 10200,
    status: "Completed"
  }
];

// Data service helpers
export const dataService = {
  // --- SETTINGS ---
  getSettings() {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS) || localStorage.getItem('shark_crackers_settings');
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
      return DEFAULT_SETTINGS;
    }
    try {
      const parsed = JSON.parse(data);
      let changed = false;
      if (parsed.shopName === 'SHARK CRACKERS') {
        parsed.shopName = 'SHARP CRACKERS';
        changed = true;
      }
      if (parsed.promoBannerText && parsed.promoBannerText.includes('Wholesale')) {
        parsed.promoBannerText = parsed.promoBannerText.replace(/Flat Wholesale Direct Sourcing/gi, 'Flat Direct Sourcing').replace(/Wholesale/gi, 'Direct');
        changed = true;
      }
      if (parsed.subtitle && parsed.subtitle.includes('Wholesale')) {
        parsed.subtitle = parsed.subtitle.replace(/Wholesale\s*&\s*Retail/gi, 'Retail & Online').replace(/Wholesale/gi, 'Direct');
        changed = true;
      }
      if (!parsed.logoUrl) {
        parsed.logoUrl = '/images/beats_crackers_logo.jpg';
        changed = true;
      }
      if (changed) {
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(parsed));
      }
      return parsed;
    } catch {
      return DEFAULT_SETTINGS;
    }
  },

  updateSettings(newSettings) {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(newSettings));
    notifyDataChanged({ type: 'SETTINGS_UPDATED', settings: newSettings });
    return newSettings;
  },

  // --- CATEGORIES ---
  getCategories() {
    const data = localStorage.getItem(STORAGE_KEYS.CATEGORIES) || localStorage.getItem('shark_crackers_categories');
    let categories = DEFAULT_CATEGORIES;
    if (data) {
      try {
        categories = JSON.parse(data);
      } catch {
        categories = DEFAULT_CATEGORIES;
      }
    }
    // Guarantee that each category has bilingual Tamil name
    let needsSave = !data;
    const mapped = categories.map(c => {
      const expectedTa = CATEGORY_TAMIL_NAMES[c.id] || c.ta || '';
      if (c.ta !== expectedTa) {
        needsSave = true;
        return { ...c, ta: expectedTa };
      }
      return c;
    });
    if (needsSave) {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(mapped));
    }
    return mapped;
  },

  saveCategories(categories) {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    notifyDataChanged({ type: 'CATEGORIES_UPDATED' });
    return categories;
  },

  addCategory(category) {
    const categories = this.getCategories();
    const newCat = {
      id: category.id || category.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      name: category.name,
      icon: category.icon || '🎆',
      image: category.image || '/images/hero_banner_1791567625102.jpg',
      active: true
    };
    categories.push(newCat);
    this.saveCategories(categories);
    return newCat;
  },

  updateCategory(updatedCat) {
    const categories = this.getCategories().map(c => c.id === updatedCat.id ? { ...c, ...updatedCat } : c);
    this.saveCategories(categories);
    return updatedCat;
  },

  deleteCategory(catId) {
    const products = this.getProducts();
    const isUsed = products.some(p => p.category === catId);
    if (isUsed) {
      throw new Error(`Cannot delete category "${catId}" because it contains active products. Please reassign products first.`);
    }
    const categories = this.getCategories().filter(c => c.id !== catId);
    this.saveCategories(categories);
    return true;
  },

  // --- PRODUCTS ---
  getProducts() {
    const data = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    let products = DEFAULT_PRODUCTS;
    if (data) {
      try {
        products = JSON.parse(data);
      } catch (e) {
        products = DEFAULT_PRODUCTS;
      }
    }

    // Guarantee that every product has permanent 3-digit serial number sno (001, 002... 027) and bilingual tamilName
    let needsSave = !data;
    const mapped = products.map((p, idx) => {
      let expectedSno = PRODUCT_SERIAL_NUMBERS[p.code];
      if (!expectedSno) {
        if (p.sno) {
          const num = parseInt(p.sno, 10);
          expectedSno = !isNaN(num) ? String(num).padStart(3, '0') : p.sno;
        } else {
          expectedSno = String(idx + 1).padStart(3, '0');
        }
      }
      const expectedTamil = PRODUCT_TAMIL_NAMES[p.code] || p.tamilName || '';
      if (p.sno !== expectedSno || p.tamilName !== expectedTamil) {
        needsSave = true;
        return { ...p, sno: expectedSno, tamilName: expectedTamil };
      }
      return p;
    });

    if (needsSave) {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(mapped));
    }
    return mapped;
  },

  getProductById(id) {
    return this.getProducts().find(p => p.id === id);
  },

  saveProducts(products) {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    notifyDataChanged({ type: 'PRODUCTS_UPDATED' });
    return products;
  },

  addProduct(product) {
    const products = this.getProducts();
    const maxSno = products.reduce((max, p) => {
      const n = parseInt(p.sno, 10);
      return !isNaN(n) && n > max ? n : max;
    }, products.length);

    const newProd = {
      id: "prod-" + Date.now(),
      sno: product.sno || String(maxSno + 1).padStart(3, '0'),
      code: product.code || ("SC-" + (products.length + 101)),
      name: product.name,
      category: product.category || "sparklers",
      packDetails: product.packDetails || "1 box",
      unitPrice: Number(product.unitPrice) || 0,
      mrp: Number(product.mrp) || (Number(product.unitPrice) * 3.5),
      image: product.image || "/images/product_sparkler_1791567639029.jpg",
      inStock: product.inStock !== false,
      isBestseller: !!product.isBestseller,
      isFeatured: !!product.isFeatured,
      description: product.description || ""
    };
    products.push(newProd);
    this.saveProducts(products);
    return newProd;
  },

  updateProduct(updatedProduct) {
    const products = this.getProducts().map(p => p.id === updatedProduct.id ? {
      ...p,
      ...updatedProduct,
      unitPrice: Number(updatedProduct.unitPrice),
      mrp: Number(updatedProduct.mrp) || (Number(updatedProduct.unitPrice) * 3.5)
    } : p);
    this.saveProducts(products);
    return updatedProduct;
  },

  deleteProduct(productId) {
    const products = this.getProducts().filter(p => p.id !== productId);
    this.saveProducts(products);
    return true;
  },

  // --- ORDERS & SYNC ---
  getDeletedOrderIds() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DELETED_ORDERS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  addDeletedOrderId(orderId) {
    const list = this.getDeletedOrderIds();
    if (!list.includes(orderId)) {
      list.push(orderId);
      localStorage.setItem(STORAGE_KEYS.DELETED_ORDERS, JSON.stringify(list));
    }
  },

  getOrders() {
    const data = localStorage.getItem(STORAGE_KEYS.ORDERS);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(DEFAULT_ORDERS));
      return DEFAULT_ORDERS;
    }
    try {
      const parsed = JSON.parse(data);
      const deletedSet = new Set(this.getDeletedOrderIds());
      return parsed.filter(o => o && o.orderId && !deletedSet.has(o.orderId));
    } catch {
      return DEFAULT_ORDERS;
    }
  },

  // Safe deduplicated two-way merge: never blindly overwrites
  mergeOrders(localOrders = [], remoteOrders = [], deletedIds = []) {
    const deletedSet = new Set(deletedIds);
    const map = new Map();

    // 1. Load local orders
    localOrders.forEach(o => {
      if (o && o.orderId && !deletedSet.has(o.orderId)) {
        map.set(o.orderId, o);
      }
    });

    // 2. Merge remote orders (keep newest update/status)
    remoteOrders.forEach(ro => {
      if (!ro || !ro.orderId || deletedSet.has(ro.orderId)) return;
      const existing = map.get(ro.orderId);
      if (!existing) {
        map.set(ro.orderId, ro);
      } else {
        const localTime = new Date(existing.updatedAt || existing.createdAt || 0).getTime();
        const remoteTime = new Date(ro.updatedAt || ro.createdAt || 0).getTime();
        if (remoteTime >= localTime) {
          map.set(ro.orderId, { ...existing, ...ro });
        }
      }
    });

    return Array.from(map.values()).sort((a, b) => {
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    });
  },

  async fetchOrders() {
    const localOrders = this.getOrders();
    const deletedIds = this.getDeletedOrderIds();

    // 1. Try smart bidirectional sync API
    try {
      const res = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orders: localOrders,
          deletedOrderIds: deletedIds
        }),
        cache: 'no-store'
      });

      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.orders)) {
          if (Array.isArray(data.deletedOrderIds)) {
            const mergedDeleted = Array.from(new Set([...deletedIds, ...data.deletedOrderIds]));
            localStorage.setItem(STORAGE_KEYS.DELETED_ORDERS, JSON.stringify(mergedDeleted));
          }

          const merged = this.mergeOrders(localOrders, data.orders, this.getDeletedOrderIds());
          localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(merged));
          return merged;
        }
      }
    } catch (e) {
      // Offline fallback: keep local orders intact
    }

    // 2. Fallback to GET /api/orders if sync endpoint is unavailable
    try {
      const res = await fetch('/api/orders', { cache: 'no-store' });
      if (res.ok) {
        const remote = await res.json();
        if (Array.isArray(remote)) {
          const merged = this.mergeOrders(localOrders, remote, deletedIds);
          localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(merged));
          return merged;
        }
      }
    } catch (e) {
      // Fallback
    }

    return localOrders;
  },

  getOrderById(orderId) {
    return this.getOrders().find(o => o.orderId === orderId);
  },

  async createOrder(orderData) {
    const orders = this.getOrders();
    const catalog = this.getProducts();
    let calculatedSubtotal = 0;

    const validatedItems = orderData.items.map(item => {
      const liveProduct = catalog.find(p => p.id === item.id) || item;
      const unitPrice = Number(liveProduct.unitPrice);
      const quantity = Math.max(1, parseInt(item.quantity) || 1);
      const totalPrice = unitPrice * quantity;
      calculatedSubtotal += totalPrice;

      return {
        id: liveProduct.id,
        code: liveProduct.code,
        name: liveProduct.name,
        packDetails: liveProduct.packDetails,
        unitPrice: unitPrice,
        quantity: quantity,
        totalPrice: totalPrice,
        image: liveProduct.image
      };
    });

    const randomHex = Math.floor(1000 + Math.random() * 9000);
    const orderId = `SC-${new Date().getFullYear()}-${randomHex}`;

    const newOrder = {
      orderId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      customer: {
        name: orderData.customer.name.trim(),
        phone: orderData.customer.phone.trim(),
        email: (orderData.customer.email || '').trim(),
        deliveryType: orderData.customer.deliveryType || 'delivery',
        address: (orderData.customer.address || '').trim(),
        notes: (orderData.customer.notes || '').trim()
      },
      items: validatedItems,
      subtotal: calculatedSubtotal,
      deliveryCharge: 0,
      grandTotal: calculatedSubtotal,
      status: 'Pending'
    };

    // Save immediately locally so it is NEVER lost on device
    orders.unshift(newOrder);
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    notifyDataChanged({ type: 'ORDER_CREATED', order: newOrder });

    // Sync to universal cloud/server API with guaranteed await
    try {
      await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrder)
      });
    } catch (err) {
      console.warn('Network sync pending; order safely stored locally:', err);
    }

    return newOrder;
  },

  async updateOrderStatus(orderId, newStatus) {
    const orders = this.getOrders().map(o => {
      if (o.orderId === orderId) {
        return { ...o, status: newStatus, updatedAt: new Date().toISOString() };
      }
      return o;
    });
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    notifyDataChanged({ type: 'ORDER_STATUS_CHANGED', orderId, status: newStatus });

    try {
      await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, updatedAt: new Date().toISOString() })
      });
    } catch (_) {}

    return true;
  },

  async deleteOrder(orderId) {
    this.addDeletedOrderId(orderId);
    const orders = this.getOrders().filter(o => o.orderId !== orderId);
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    notifyDataChanged({ type: 'ORDER_DELETED', orderId });

    try {
      await fetch(`/api/orders/${orderId}`, { method: 'DELETE' });
    } catch (_) {}

    return true;
  },

  // --- ENQUIRIES ---
  getEnquiries() {
    const data = localStorage.getItem(STORAGE_KEYS.ENQUIRIES);
    return data ? JSON.parse(data) : [];
  },

  async fetchEnquiries() {
    try {
      const res = await fetch('/api/enquiries', { cache: 'no-store' });
      if (res.ok) {
        const remote = await res.json();
        if (Array.isArray(remote)) {
          localStorage.setItem(STORAGE_KEYS.ENQUIRIES, JSON.stringify(remote));
          return remote;
        }
      }
    } catch (e) {
      // Fall back to localStorage if API unreachable
    }
    return this.getEnquiries();
  },

  deleteEnquiry(id) {
    const enquiries = this.getEnquiries().filter(e => e.id !== id);
    localStorage.setItem(STORAGE_KEYS.ENQUIRIES, JSON.stringify(enquiries));
    notifyDataChanged({ type: 'ENQUIRY_DELETED', id });

    try {
      fetch(`/api/enquiries/${id}`, { method: 'DELETE' }).catch(() => {});
    } catch (_) {}

    return true;
  },

  addEnquiry(enquiry) {
    const enquiries = this.getEnquiries();
    const count = enquiries.length + 1;
    const enquiryNumber = `#ENQ-${1000 + count}`;
    const newEnquiry = {
      id: 'enq-' + Date.now(),
      enquiryNumber: enquiryNumber,
      createdAt: new Date().toISOString(),
      ...enquiry
    };
    enquiries.unshift(newEnquiry);
    localStorage.setItem(STORAGE_KEYS.ENQUIRIES, JSON.stringify(enquiries));
    notifyDataChanged({ type: 'ENQUIRY_ADDED', enquiry: newEnquiry });

    // Sync to universal cloud/server API so ALL devices see this enquiry
    try {
      fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEnquiry)
      }).catch(err => console.warn('Could not sync enquiry to /api/enquiries:', err));
    } catch (_) {}

    return newEnquiry;
  },

  // --- ADMIN AUTH ---
  isAdminAuthenticated() {
    const session = localStorage.getItem(STORAGE_KEYS.ADMIN_SESSION);
    if (!session) return false;
    try {
      const parsed = JSON.parse(session);
      return parsed && parsed.authenticated === true;
    } catch {
      return false;
    }
  },

  adminLogin(username, password) {
    const validUsers = ['admin', 'sharp', 'shark'];
    const validPasswords = ['sharp2026!', 'shark2026!', 'admin123'];
    if (validUsers.includes(username) && validPasswords.includes(password)) {
      const session = {
        authenticated: true,
        user: 'Admin Manager',
        loginTime: new Date().toISOString()
      };
      localStorage.setItem(STORAGE_KEYS.ADMIN_SESSION, JSON.stringify(session));
      return { success: true };
    }
    return { success: false, message: 'Invalid username or password. (Hint: admin / sharp2026!)' };
  },

  adminLogout() {
    localStorage.removeItem(STORAGE_KEYS.ADMIN_SESSION);
  },

  // --- RESET ALL DATA (Demo Helper) ---
  resetAllData() {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(DEFAULT_CATEGORIES));
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(DEFAULT_PRODUCTS));
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(DEFAULT_ORDERS));
    localStorage.removeItem(STORAGE_KEYS.DELETED_ORDERS);
    localStorage.removeItem(STORAGE_KEYS.ENQUIRIES);
    notifyDataChanged({ type: 'DATA_RESET' });
  }
};
