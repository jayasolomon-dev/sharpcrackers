// ============================================================================
// SHARP CRACKERS - DEFAULT SEED DATA & CATALOG
// ============================================================================

export const DEFAULT_SETTINGS = {
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
  logoUrl: "/images/sharp_crackers_logo_final.png",
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
export const DEFAULT_CATEGORIES = [
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
export const DEFAULT_PRODUCTS = [
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
export const DEFAULT_ORDERS = [
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

// ============================================================================
// 30-DAY BILL RETENTION & AUTO-DELETE SYSTEM
// ============================================================================
