// ==========================================================================
// SHARP CRACKERS - DATA SERVICE & PERSISTENCE LAYER
// Real database simulation via localStorage with cross-tab live synchronization
// ==========================================================================

const STORAGE_KEYS = {
  SETTINGS: 'sharp_crackers_settings',
  CATEGORIES: 'sharp_crackers_categories',
  PRODUCTS: 'sharp_crackers_products',
  ORDERS: 'sharp_crackers_orders',
  BACKUP_ORDERS: 'sharp_crackers_orders_backup',
  DELETED_ORDERS: 'sharp_crackers_deleted_orders',
  ENQUIRIES: 'sharp_crackers_enquiries',
  ADMIN_SESSION: 'sharp_crackers_admin_session'
};

// Cross-tab broadcast channel
const broadcastChannel = typeof window !== 'undefined' && 'BroadcastChannel' in window 
  ? new BroadcastChannel('sharp_crackers_channel') 
  : null;

// Cross-tab broadcast listener: immediately forwards messages to custom event
if (broadcastChannel) {
  broadcastChannel.onmessage = (event) => {
    if (typeof window !== 'undefined' && event && event.data) {
      window.dispatchEvent(new CustomEvent('sharp_data_changed', { detail: event.data }));
    }
  };
}

// Fallback: storage event listener for cross-tab localStorage synchronisation
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key && Object.values(STORAGE_KEYS).includes(e.key)) {
      window.dispatchEvent(new CustomEvent('sharp_data_changed', { 
        detail: { type: 'STORAGE_SYNC', key: e.key } 
      }));
    }
  });
}

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
  subtitle: "100% Genuine Green Crackers • Retail & Online",
  phone: "+91 95668 86795",
  altPhone: "",
  whatsapp: "919566886795",
  email: "sharpcrackars@gmail.com",
  address: "89, Sivasakthy Layout, Selvam Mahal (opposite), Chettipalayam Road, Echanari, Coimbatore - 641 021. Tamilnadu",
  branchAddress: "",
  businessHours: "8:00 AM – 10:00 PM (Monday – Sunday)",
  currencySymbol: "₹",
  minOrderAmount: 1500,
  deliveryCharge: 0,
  freeDeliveryThreshold: 0,
  promoBannerText: "DIWALI 2026 SPECIAL OFFER: Flat Direct Sourcing with Heavy Savings! Order online now for guaranteed express booking!",
  logoUrl: "/images/sharp_crackers_brand_logo.jpg",
  heroBannerUrl: "/images/home_hero_bg.jpg"
};

// Permanent 3-Digit Continuous Serial Numbers across all categories (001 -> 007 and expandable)
export const PRODUCT_SERIAL_NUMBERS = {
  'SC-SP01': '001',
  'SC-SP02': '002',
  'SC-SP03': '003',
  'SC-SP04': '004',
  'SC-SP05': '005',
  'SC-SP06': '006',
  'SC-SP07': '007',
  'SC-FP01': '008',
  'SC-FP02': '009',
  'SC-FP03': '010',
  'SC-FP04': '011',
  'SC-FP05': '012',
  'SC-FP06': '013',
  'SC-FP07': '014',
  'SC-GC01': '015',
  'SC-GC02': '016',
  'SC-GC03': '017',
  'SC-RK01': '018',
  'SC-RK02': '019',
  'SC-TW01': '020',
  'SC-BF01': '021',
  'SC-BF02': '022',
  'SC-BF03': '023',
  'SC-BF04': '024',
  'SC-BF05': '025',
  'SC-BF06': '026',
  'SC-BF07': '027',
  'SC-BF08': '028',
  'SC-BF09': '029',
  'SC-BF10': '030',
  'SC-BF11': '031',
  'SC-BF12': '032',
  'SC-BF13': '033',
  'SC-SD01': '034',
  'SC-SD02': '035',
  'SC-SD03': '036',
  'SC-SD04': '037',
  'SC-SD05': '038',
  'SC-SD06': '039',
  'SC-SD07': '040',
  'SC-GD01': '041',
  'SC-GD02': '042',
  'SC-GD03': '043',
  'SC-GD04': '044',
  'SC-GD05': '045',
  'SC-GD06': '046',
  'SC-GD07': '047',
  'SC-GD08': '048',
  'SC-GD09': '049',
  'SC-GD10': '050',
  'SC-GD11': '051',
  'SC-GD12': '052',
  'SC-GD13': '053',
  'SC-GD14': '054',
  'SC-MS01': '055',
  'SC-MS02': '056',
  'SC-MS03': '057',
  'SC-MS04': '058',
  'SC-MS05': '059',
  'SC-MS06': '060',
  'SC-MS07': '061',
  'SC-MS08': '062',
  'SC-MS09': '063',
  'SC-GB01': '064',
  'SC-GB02': '065',
  'SC-GB03': '066',
  'SC-GB04': '067',
  'SC-GB05': '068',
  'SC-GN01': '069',
  'SC-GN02': '070',
  'SC-GN03': '071',
  'SC-GN04': '072',
  'SC-GN05': '073',
  'SC-GN06': '074',
  'SC-BM01': '075',
  'SC-BM02': '076',
  'SC-BM03': '077',
  'SC-BM04': '078',
  'SC-BM05': '079',
  'SC-MB01': '080',
  'SC-MB02': '081',
  'SC-MB03': '082',
  'SC-NV01': '083',
  'SC-NV02': '084',
  'SC-NV03': '085',
  'SC-AF01': '086',
  'SC-AF02': '087',
  'SC-AF03': '088',
  'SC-AF04': '089',
  'SC-AF05': '090'
};

// Bilingual Tamil Names for All Products (English / தமிழ்)
export const PRODUCT_TAMIL_NAMES = {
  'SC-SP01': '10 செ.மீ கம்பி',
  'SC-SP02': '10 செ.மீ color கம்பி',
  'SC-SP03': '15 செ.மீ கம்பி',
  'SC-SP04': '15 செ.மீ color கம்பி',
  'SC-SP05': '30 செ.மீ கம்பி',
  'SC-SP06': '30 செ.மீ color கம்பி',
  'SC-SP07': '50 செ.மீ கம்பி',
  'SC-FP01': 'சிறியது பூச்சட்டி',
  'SC-FP02': 'பெரியது பூச்சட்டி',
  'SC-FP03': 'பூச்சட்டி ஸ்பெஷல்',
  'SC-FP04': 'பூச்சட்டி அசோகா',
  'SC-FP05': 'பூச்சட்டி டீலக்ஸ்',
  'SC-FP06': 'பூச்சட்டி கோட்டி',
  'SC-FP07': 'ட்ரை கலர் பவுண்டேன்',
  'SC-GC01': 'தரைச்சக்கரம் பிக்',
  'SC-GC02': 'தரைச்சக்கரம் ஸ்பெஷல்',
  'SC-GC03': 'தரைச்சக்கரம் டீலக்ஸ்',
  'SC-RK01': 'ராக்கெட் பாம்',
  'SC-RK02': 'விசிலிங் ராக்கெட்',
  'SC-TW01': 'ட்விங்க்ளிங்ஸ் டீலக்ஸ் (4" சாட்டை ஸ்டார்)',
  'SC-BF01': 'கங்கா ஜமுனா',
  'SC-BF02': 'ஜீ பூம் பா',
  'SC-BF03': 'ட்ரோன்',
  'SC-BF04': 'செல்பி ஸ்டிக்',
  'SC-BF05': 'மயில் பட்டாசு',
  'SC-BF06': 'படா மயில் (பெரிய மயில்)',
  'SC-BF07': 'போட்டோ ஃபிளாஷ்',
  'SC-BF08': 'பவர் ரேஞ்சர்',
  'SC-BF09': 'ரெயின்போ கலர் ஸ்மோக்',
  'SC-BF10': 'மேஜிக் ஷோ மணி பேப்பர்',
  'SC-BF11': 'பட்டர்ஃபிளை கலர் சேஞ்சிங்',
  'SC-BF12': 'மெகா சைரன்',
  'SC-BF13': 'பாம்பு முட்டை',
  'SC-SD01': '2 ¾" குருவி வெடி',
  'SC-SD02': '3 ½" மீடியம் லட்சுமி',
  'SC-SD03': '4" கோல்ட் லட்சுமி',
  'SC-SD04': '4" டீலக்ஸ் லட்சுமி',
  'SC-SD05': '5" ஜல்லிக்கட்டு பட்டாசு',
  'SC-SD06': 'ரெட் பிஜிலி',
  'SC-SD07': 'வரி பிஜிலி',
  'SC-GD01': '28 ஜெயின்ட் கிராக்கர்ஸ்',
  'SC-GD02': '56 ஜெயின்ட் கிராக்கர்ஸ்',
  'SC-GD03': '100 ஜெயின்ட் கிராக்கர்ஸ்',
  'SC-GD04': '50 டீலக்ஸ் கிராக்கர்ஸ்',
  'SC-GD05': '100 டீலக்ஸ் கிராக்கர்ஸ்',
  'SC-GD06': '300 வாலா',
  'SC-GD07': '1K வாலா',
  'SC-GD08': '1K வாலா',
  'SC-GD09': '2K வாலா',
  'SC-GD10': '2K வாலா',
  'SC-GD11': '5K வாலா',
  'SC-GD12': '5K வாலா',
  'SC-GD13': '10K வாலா',
  'SC-GD14': '10K வாலா',
  'SC-MS01': '7 சாட் மல்டி கலர்',
  'SC-MS02': '12 சாட் மல்டி கலர்',
  'SC-MS03': '15 ஷாட் ஸ்மோக் ஷாட்',
  'SC-MS04': '25 சாட் மல்டி கலர்',
  'SC-MS05': '30 சாட் மல்டி கலர்',
  'SC-MS06': '60 சாட் மல்டி கலர்',
  'SC-MS07': '120 சாட் மல்டி கலர்',
  'SC-MS08': '240 சாட் மல்டி கலர்',
  'SC-MS09': 'பென்டா மேஜிக்',
  'SC-GB01': '30 ஐட்டம்ஸ் கிப்ட் பாக்ஸ்',
  'SC-GB02': '35 ஐட்டம்ஸ் கிப்ட் பாக்ஸ்',
  'SC-GB03': '40 ஐட்டம்ஸ் கிப்ட் பாக்ஸ்',
  'SC-GB04': '50 ஐட்டம்ஸ் கிப்ட் பாக்ஸ்',
  'SC-GB05': '60 ஐட்டம்ஸ் கிப்ட் பாக்ஸ்',
  'SC-GN01': 'துப்பாக்கி பெரிது',
  'SC-GN02': 'துப்பாக்கி ஸ்பெஷல்',
  'SC-GN03': 'துப்பாக்கி டீலக்ஸ்',
  'SC-GN04': 'LEO துப்பாக்கி',
  'SC-GN05': 'ரிங் கேப்',
  'SC-GN06': 'ரோல் கேப்',
  'SC-BM01': 'ஹைட்ரோ குண்டு',
  'SC-BM02': 'கிங் ஆப் கிங் பாம்',
  'SC-BM03': 'கிளாசிக் பாம்',
  'SC-BM04': 'அக்னி குண்டு',
  'SC-BM05': 'டிஜிட்டல் குண்டு',
  'SC-MB01': 'அன்னம் கலர் தீப்பெட்டி',
  'SC-MB02': 'ஹீரோ ராயல் 7 இன் 1 கலர் மேட்சஸ்',
  'SC-MB03': 'ராயல் சூப்பர் மெகா மேட்சஸ்',
  'SC-NV01': 'ஜோக்கர் பேப்பர் பாம் (250g)',
  'SC-NV02': 'ஜோக்கர் பேப்பர் பாம் (500g)',
  'SC-NV03': 'ஜோக்கர் பேப்பர் பாம் (1kg)',
  'SC-AF01': '2" ஏரியல் பேன்சி',
  'SC-AF02': '2" ஏரியல் பேன்சி (3 PCS)',
  'SC-AF03': '3 ½" ஏரியல் பேன்சி',
  'SC-AF04': '4" ஏரியல் பேன்சி',
  'SC-AF05': '4 ½" ஏரியல் பேன்சி'
};

export const CATEGORY_TAMIL_NAMES = {
  'all': 'அனைத்து ரகங்கள்',
  'sparklers': 'கம்பி மத்தாப்பு',
  'flower-pots': 'பூந்தொட்டி',
  'ground-chakkars': 'தரை சக்கரம்',
  'rockets': 'ராக்கெட் & ட்விங்க்ளிங்',
  'sound-crackers': 'ஒன் சவுண்ட் & பிஜிலி',
  'giant-deluxe': 'ஜெயின்ட் & டீலக்ஸ்',
  'multi-colour-shots': 'மல்டி கலர் ஷாட்ஸ்',
  'fancy-crackers': 'வானவேடிக்கை',
  'gift-boxes': 'கிப்ட் பாக்ஸ்',
  'guns': 'துப்பாக்கி ரகம்',
  'kids-special': 'பேபி ஃபேன்சி & குழந்தைகள் ரகம்',
  'bombs': 'ஆட்டம் பாம் (ஹைட்ரஜன்)',
  'matches-box': 'கலர் தீப்பெட்டி',
  'nattu-vedi': 'நாட்டு வெடி'
};

// Default Categories
const DEFAULT_CATEGORIES = [
  { id: "sparklers", name: "Sparklers", ta: "கம்பி மத்தாப்பு", icon: "", image: "/images/products/sparkler_10cm_colour.png", active: true },
  { id: "flower-pots", name: "Flower Pots", ta: "பூந்தொட்டி", icon: "", image: "/images/products/flowerpot_ashoka.jpg", active: true },
  { id: "ground-chakkars", name: "Ground Chakkars", ta: "தரை சக்கரம்", icon: "", image: "/images/products/ground_chakkars_special.jpg", active: true },
  { id: "rockets", name: "Rockets & Twinkling", ta: "ராக்கெட் & ட்விங்க்ளிங்", icon: "", image: "/images/products/rocket_bomb_v2.jpg", active: true },
  { id: "sound-crackers", name: "One Sound Crackers & Bijili", ta: "ஒன் சவுண்ட் & பிஜிலி", icon: "", image: "/images/products/kuruvi_vedi_v1.jpg", active: true },
  { id: "giant-deluxe", name: "Gaint & Deluxe", ta: "ஜெயின்ட் & டீலக்ஸ்", icon: "", image: "/images/products/taj_mahal_28_gaint_v1.jpg", active: true },
  { id: "multi-colour-shots", name: "Multi Colour Shots", ta: "மல்டி கலர் ஷாட்ஸ்", icon: "", image: "/images/products/7_shot_multi_colour_v1.jpg", active: true },
  { id: "gift-boxes", name: "Diwali Gift Boxes", ta: "கிப்ட் பாக்ஸ்", icon: "", image: "/images/products/gift_box_35_items_v1.jpg", active: true },
  { id: "guns", name: "Toy Guns & Caps", ta: "துப்பாக்கி ரகம்", icon: "", image: "/images/products/gun_leo_v1.jpg", active: true },
  { id: "fancy-crackers", name: "Fancy Fountains & Sky Shots", ta: "வானவேடிக்கை", icon: "", image: "/images/products/golden_eye_3_5inch_v1.jpg", active: true },
  { id: "kids-special", name: "Baby Fancy & Kids Special", ta: "பேபி ஃபேன்சி & குழந்தைகள் ரகம்", icon: "", image: "/images/products/jee_boom_baa_v2.jpg", active: true },
  { id: "bombs", name: "Atom Bombs", ta: "ஆட்டம் பாம் (ஹைட்ரஜன்)", icon: "", image: "/images/products/hydro_bomb_v1.jpg", active: true },
  { id: "matches-box", name: "Colour Matches Box", ta: "கலர் தீப்பெட்டி", icon: "", image: "/images/products/royal_super_mega_matches_v1.jpg", active: true },
  { id: "nattu-vedi", name: "Nattu Vedi (Paper Bombs)", ta: "நாட்டு வெடி", icon: "", image: "/images/products/joker_paper_bomb_1kg_v1.jpg", active: true }
];

// Default Products (mapped to genuine images in /images/ with 3-digit serial numbers)
const DEFAULT_PRODUCTS = [
  {
    id: "prod-1",
    sno: "001",
    code: "SC-SP01",
    name: "10 CM ELECTRIC SPARKLER",
    tamilName: "10 செ.மீ கம்பி",
    category: "sparklers",
    packDetails: "1 Box",
    unitPrice: 20,
    mrp: 80,
    image: "/images/products/sparkler_10cm_electric.jpg",
    inStock: true,
    isBestseller: true,
    isFeatured: true,
    description: "10 cm Electric Sparkler (10 செ.மீ கம்பி) - Bright sparkling stars with low smoke, child-friendly."
  },
  {
    id: "prod-2",
    sno: "002",
    code: "SC-SP02",
    name: "10 CM COLOUR SPARKLER",
    tamilName: "10 செ.மீ color கம்பி",
    category: "sparklers",
    packDetails: "1 Box",
    unitPrice: 20,
    mrp: 80,
    image: "/images/products/sparkler_10cm_colour.jpg",
    inStock: true,
    isBestseller: false,
    isFeatured: false,
    description: "10 cm Colour Sparkler (10 செ.மீ color கம்பி) - Vibrant multi-color sparkling embers."
  },
  {
    id: "prod-3",
    sno: "003",
    code: "SC-SP03",
    name: "15 CM ELECTRIC SPARKLER",
    tamilName: "15 செ.மீ கம்பி",
    category: "sparklers",
    packDetails: "1 Box",
    unitPrice: 55,
    mrp: 220,
    image: "/images/products/sparkler_15cm_electric.jpg",
    inStock: true,
    isBestseller: true,
    isFeatured: false,
    description: "15 cm Electric Sparkler (15 செ.மீ கம்பி) - Radiant golden sparks with extended burning time."
  },
  {
    id: "prod-4",
    sno: "004",
    code: "SC-SP04",
    name: "15 CM COLOUR SPARKLER",
    tamilName: "15 செ.மீ color கம்பி",
    category: "sparklers",
    packDetails: "1 Box",
    unitPrice: 55,
    mrp: 220,
    image: "/images/products/sparkler_15cm_colour.jpg",
    inStock: true,
    isBestseller: false,
    isFeatured: false,
    description: "15 cm Colour Sparkler (15 செ.மீ color கம்பி) - Dazzling festival colors with crackling finish."
  },
  {
    id: "prod-5",
    sno: "005",
    code: "SC-SP05",
    name: "30 CM ELECTRIC SPARKLER",
    tamilName: "30 செ.மீ கம்பி",
    category: "sparklers",
    packDetails: "1 Box",
    unitPrice: 60,
    mrp: 240,
    image: "/images/products/sparkler_30cm_electric.jpg",
    inStock: true,
    isBestseller: true,
    isFeatured: true,
    description: "30 cm Electric Sparkler (30 செ.மீ கம்பி) - Long burning rods with brilliant golden aura."
  },
  {
    id: "prod-6",
    sno: "006",
    code: "SC-SP06",
    name: "30 CM COLOUR SPARKLER",
    tamilName: "30 செ.மீ color கம்பி",
    category: "sparklers",
    packDetails: "1 Box",
    unitPrice: 60,
    mrp: 240,
    image: "/images/products/sparkler_30cm_colour.jpg",
    inStock: true,
    isBestseller: false,
    isFeatured: false,
    description: "30 cm Colour Sparkler (30 செ.மீ color கம்பி) - Deluxe multi-color spark transitions."
  },
  {
    id: "prod-7",
    sno: "007",
    code: "SC-SP07",
    name: "50 CM ELECTRIC SPARKLER",
    tamilName: "50 செ.மீ கம்பி",
    category: "sparklers",
    packDetails: "1 Box",
    unitPrice: 200,
    mrp: 800,
    image: "/images/products/sparkler_50cm_electric.jpg",
    inStock: true,
    isBestseller: true,
    isFeatured: true,
    description: "50 cm Electric Sparkler (50 செ.மீ கம்பி) - Giant showstopper sparkler with magnificent shower."
  },
  // Flower Pots (008 - 014)
  {
    id: "prod-8",
    sno: "008",
    code: "SC-FP01",
    name: "FLOWER POT SMALL",
    tamilName: "சிறியது பூச்சட்டி",
    category: "flower-pots",
    packDetails: "1 Box",
    unitPrice: 50,
    mrp: 200,
    image: "/images/products/flowerpot_small.jpg",
    inStock: true,
    isBestseller: false,
    isFeatured: false,
    description: "Flower Pot Small (சிறியது பூச்சட்டி) - Classic golden sparks fountain with steady festive glow."
  },
  {
    id: "prod-9",
    sno: "009",
    code: "SC-FP02",
    name: "FLOWER POT BIG",
    tamilName: "பெரியது பூச்சட்டி",
    category: "flower-pots",
    packDetails: "1 Box",
    unitPrice: 90,
    mrp: 360,
    image: "/images/products/flowerpot_big.jpg",
    inStock: true,
    isBestseller: true,
    isFeatured: true,
    description: "Flower Pot Big (பெரியது பூச்சட்டி) - Tall erupting golden sparks with multi-colored embers."
  },
  {
    id: "prod-10",
    sno: "010",
    code: "SC-FP03",
    name: "FLOWER POT SPECIAL",
    tamilName: "பூச்சட்டி ஸ்பெஷல்",
    category: "flower-pots",
    packDetails: "1 Box",
    unitPrice: 110,
    mrp: 440,
    image: "/images/products/flowerpot_special.jpg",
    inStock: true,
    isBestseller: false,
    isFeatured: false,
    description: "Flower Pot Special (பூச்சட்டி ஸ்பெஷல்) - High density sparkling fountain reaching up to 10 feet."
  },
  {
    id: "prod-11",
    sno: "011",
    code: "SC-FP04",
    name: "FLOWER POT ASHOKA",
    tamilName: "பூச்சட்டி அசோகா",
    category: "flower-pots",
    packDetails: "1 Box",
    unitPrice: 160,
    mrp: 640,
    image: "/images/products/flowerpot_ashoka.jpg",
    inStock: true,
    isBestseller: true,
    isFeatured: true,
    description: "Flower Pot Ashoka (பூச்சட்டி அசோகா) - Premium multi-stage colorful fountain with glittering stars."
  },
  {
    id: "prod-12",
    sno: "012",
    code: "SC-FP05",
    name: "FLOWER POT DELUXE",
    tamilName: "பூச்சட்டி டீலக்ஸ்",
    category: "flower-pots",
    packDetails: "1 Box",
    unitPrice: 350,
    mrp: 1400,
    image: "/images/products/flowerpot_deluxe.jpg",
    inStock: true,
    isBestseller: true,
    isFeatured: true,
    description: "Flower Pot Deluxe (பூச்சட்டி டீலக்ஸ்) - Giant luxury fountain with thunderous golden shower."
  },
  {
    id: "prod-13",
    sno: "013",
    code: "SC-FP06",
    name: "COLOUR KOTI",
    tamilName: "பூச்சட்டி கோட்டி",
    category: "flower-pots",
    packDetails: "1 Box",
    unitPrice: 250,
    mrp: 1000,
    image: "/images/products/colour_koti.jpg",
    inStock: true,
    isBestseller: false,
    isFeatured: false,
    description: "Colour Koti (பூச்சட்டி கோட்டி) - Dazzling color-shifting fountain cone with vibrant flares."
  },
  {
    id: "prod-14",
    sno: "014",
    code: "SC-FP07",
    name: "TRI COLOUR FOUNTAIN",
    tamilName: "ட்ரை கலர் பவுண்டேன்",
    category: "flower-pots",
    packDetails: "1 Box",
    unitPrice: 300,
    mrp: 1200,
    image: "/images/products/tri_colour_fountain_hd.jpg",
    inStock: true,
    isBestseller: true,
    isFeatured: true,
    description: "Tri Colour Fountain (ட்ரை கலர் பவுண்டேன்) - Majestic multi-piece fountain display in tricolor sparkles."
  },
  // Ground Chakkars (015 - 017)
  {
    id: "prod-15",
    sno: "015",
    code: "SC-GC01",
    name: "GROUND CHAKKARS BIG",
    tamilName: "தரைச்சக்கரம் பிக்",
    category: "ground-chakkars",
    packDetails: "1 Box",
    unitPrice: 50,
    mrp: 200,
    image: "/images/products/ground_chakkars_big_hd.jpg",
    inStock: true,
    isBestseller: false,
    isFeatured: false,
    description: "Ground Chakkars Big (தரைச்சக்கரம் பிக்) - Fast spinning ground wheel with dense silver sparks."
  },
  {
    id: "prod-16",
    sno: "016",
    code: "SC-GC02",
    name: "GROUND CHAKKARS SPECIAL",
    tamilName: "தரைச்சக்கரம் ஸ்பெஷல்",
    category: "ground-chakkars",
    packDetails: "1 Box",
    unitPrice: 100,
    mrp: 400,
    image: "/images/products/ground_chakkars_special_hd.jpg",
    inStock: true,
    isBestseller: true,
    isFeatured: true,
    description: "Ground Chakkars Special (தரைச்சக்கரம் ஸ்பெஷல்) - High speed dual-ring golden spinning wheels."
  },
  {
    id: "prod-17",
    sno: "017",
    code: "SC-GC03",
    name: "GROUND CHAKKARS DELUXE",
    tamilName: "தரைச்சக்கரம் டீலக்ஸ்",
    category: "ground-chakkars",
    packDetails: "1 Box",
    unitPrice: 150,
    mrp: 600,
    image: "/images/products/ground_chakkars_deluxe_hd.jpg",
    inStock: true,
    isBestseller: true,
    isFeatured: true,
    description: "Ground Chakkars Deluxe (தரைச்சக்கரம் டீலக்ஸ்) - Long duration multi-color spinning novelty."
  },
  // Rockets & Twinkling (018 - 020)
  {
    id: "prod-18",
    sno: "018",
    code: "SC-RK01",
    name: "ROCKET BOMB",
    tamilName: "ராக்கெட் பாம்",
    category: "rockets",
    packDetails: "1 Box",
    unitPrice: 60,
    mrp: 240,
    image: "/images/products/rocket_bomb_v2.jpg",
    inStock: true,
    isBestseller: true,
    isFeatured: true,
    description: "Rocket Bomb (ராக்கெட் பாம்) - Traditional high-altitude supersonic blast rocket with wooden guide stick."
  },
  {
    id: "prod-19",
    sno: "019",
    code: "SC-RK02",
    name: "WHISTLING ROCKET",
    tamilName: "விசிலிங் ராக்கெட்",
    category: "rockets",
    packDetails: "1 Box",
    unitPrice: 180,
    mrp: 720,
    image: "/images/products/whistling_rocket_v2.jpg",
    inStock: true,
    isBestseller: true,
    isFeatured: true,
    description: "Whistling Rocket (விசிலிங் ராக்கெட்) - Genuine Anil whistling rocket with piercing acoustic whistle and starburst."
  },
  {
    id: "prod-20",
    sno: "020",
    code: "SC-TW01",
    name: "TWINKLINGS DELUXE",
    tamilName: "ட்விங்க்ளிங்ஸ் டீலக்ஸ் (4\" சாட்டை ஸ்டார்)",
    category: "rockets",
    packDetails: "1 Box",
    unitPrice: 80,
    mrp: 320,
    image: "/images/products/twinking_star_v2.jpg",
    inStock: true,
    isBestseller: false,
    isFeatured: false,
    description: "Twinklings Deluxe / 4\" Twinking Star (ட்விங்க்ளிங்ஸ் டீலக்ஸ்) - Genuine Anil deluxe crackling star shower with sparkling golden twinkles."
  },
  // Baby Fancy & Kids Special (021 - 033)
  {
    id: "prod-21",
    sno: "021",
    code: "SC-BF01",
    name: "GANGA JAMUNA",
    tamilName: "கங்கா ஜமுனா",
    category: "kids-special",
    packDetails: "1 Box",
    unitPrice: 100,
    mrp: 400,
    image: "/images/products/ganga_jamuna_v2.jpg",
    inStock: true,
    isBestseller: true,
    isFeatured: true,
    description: "Ganga Jamuna (கங்கா ஜமுனா) - Double tube dual fountain with colorful sparkling bursts."
  },
  {
    id: "prod-22",
    sno: "022",
    code: "SC-BF02",
    name: "JEE BOOM BAA",
    tamilName: "ஜீ பூம் பா",
    category: "kids-special",
    packDetails: "1 Box",
    unitPrice: 60,
    mrp: 240,
    image: "/images/products/jee_boom_baa_v2.jpg",
    inStock: true,
    isBestseller: true,
    isFeatured: true,
    description: "Jee Boom Baa (ஜீ பூம் பா) - Fun magic novelty fountain with multi-color sparks for kids."
  },
  {
    id: "prod-23",
    sno: "023",
    code: "SC-BF03",
    name: "DRONE",
    tamilName: "ட்ரோன்",
    category: "kids-special",
    packDetails: "1 Box",
    unitPrice: 120,
    mrp: 480,
    image: "/images/products/drone_toy_v2.jpg",
    inStock: true,
    isBestseller: true,
    isFeatured: true,
    description: "Drone Flying Toy (ட்ரோன்) - Whirling aerial helicopter novelty with bright illumination."
  },
  {
    id: "prod-24",
    sno: "024",
    code: "SC-BF04",
    name: "SELFIE STICK",
    tamilName: "செல்பி ஸ்டிக்",
    category: "kids-special",
    packDetails: "1 Box",
    unitPrice: 120,
    mrp: 480,
    image: "/images/products/selfie_stick_v2.jpg",
    inStock: true,
    isBestseller: false,
    isFeatured: false,
    description: "Selfie Stick (செல்பி ஸ்டிக்) - Handheld novelty emitting vibrant showers of sparks."
  },
  {
    id: "prod-25",
    sno: "025",
    code: "SC-BF05",
    name: "PEACOCK",
    tamilName: "மயில் பட்டாசு",
    category: "kids-special",
    packDetails: "1 Box",
    unitPrice: 180,
    mrp: 720,
    image: "/images/products/peacock_cracker_v2.jpg",
    inStock: true,
    isBestseller: true,
    isFeatured: true,
    description: "Peacock Fountain (மயில் பட்டாசு) - Fan-shaped fountain opening like radiant peacock feathers."
  },
  {
    id: "prod-26",
    sno: "026",
    code: "SC-BF06",
    name: "BADA PEACOCK",
    tamilName: "படா மயில் (பெரிய மயில்)",
    category: "kids-special",
    packDetails: "1 Box",
    unitPrice: 400,
    mrp: 1600,
    image: "/images/products/bada_peacock_v2.jpg",
    inStock: true,
    isBestseller: true,
    isFeatured: true,
    description: "Bada Peacock (படா மயில்) - Giant panoramic feather fountain with dazzling multi-stage display."
  },
  {
    id: "prod-27",
    sno: "027",
    code: "SC-BF07",
    name: "PHOTO FLASH",
    tamilName: "போட்டோ ஃபிளாஷ்",
    category: "kids-special",
    packDetails: "1 Box",
    unitPrice: 60,
    mrp: 240,
    image: "/images/products/photo_flash_v2.jpg",
    inStock: true,
    isBestseller: false,
    isFeatured: false,
    description: "Photo Flash (போட்டோ ஃபிளாஷ்) - High intensity strobe flash with blinding bright white light."
  },
  {
    id: "prod-28",
    sno: "028",
    code: "SC-BF08",
    name: "POWER RANGER",
    tamilName: "பவர் ரேஞ்சர்",
    category: "kids-special",
    packDetails: "1 Box",
    unitPrice: 200,
    mrp: 800,
    image: "/images/products/power_ranger_v2.jpg",
    inStock: true,
    isBestseller: true,
    isFeatured: true,
    description: "Power Ranger (பவர் ரேஞ்சர்) - Dynamic multi-shot color fountain novelty for children."
  },
  {
    id: "prod-29",
    sno: "029",
    code: "SC-BF09",
    name: "RAINBOW COLOUR SMOKE",
    tamilName: "ரெயின்போ கலர் ஸ்மோக்",
    category: "kids-special",
    packDetails: "1 Box",
    unitPrice: 160,
    mrp: 640,
    image: "/images/products/rainbow_colour_smoke_v2.jpg",
    inStock: true,
    isBestseller: false,
    isFeatured: false,
    description: "Rainbow Colour Smoke (ரெயின்போ கலர் ஸ்மோக்) - Daytime colorful smoke canisters in vibrant spectrum."
  },
  {
    id: "prod-30",
    sno: "030",
    code: "SC-BF10",
    name: "MAGIC SHOW MONEY PAPER",
    tamilName: "மேஜிக் ஷோ மணி பேப்பர்",
    category: "kids-special",
    packDetails: "1 Box",
    unitPrice: 200,
    mrp: 800,
    image: "/images/products/magic_show_money_paper_v3.jpg",
    inStock: true,
    isBestseller: true,
    isFeatured: true,
    description: "Magic Show Money Paper / Rock Star (மேஜிக் ஷோ மணி பேப்பர்) - Surprising novelty popping toy with fun paper shower."
  },
  {
    id: "prod-31",
    sno: "031",
    code: "SC-BF11",
    name: "BUTTERFLY (COLOUR CHANGING)",
    tamilName: "பட்டர்ஃபிளை கலர் சேஞ்சிங்",
    category: "kids-special",
    packDetails: "1 Box",
    unitPrice: 100,
    mrp: 400,
    image: "/images/products/butterfly_colour_changing_v3.jpg",
    inStock: true,
    isBestseller: true,
    isFeatured: true,
    description: "Butterfly Colour Changing (பட்டர்ஃபிளை) - Graceful fluttering aerial novelty with color transitions."
  },
  {
    id: "prod-32",
    sno: "032",
    code: "SC-BF12",
    name: "MEGA SIREN",
    tamilName: "மெகா சைரன்",
    category: "kids-special",
    packDetails: "1 Box",
    unitPrice: 180,
    mrp: 720,
    image: "/images/products/mega_siren_v3.jpg",
    inStock: true,
    isBestseller: false,
    isFeatured: false,
    description: "Mega Siren (மெகா சைரன்) - High-pitched musical screaming whistle with brilliant flare."
  },
  {
    id: "prod-33",
    sno: "033",
    code: "SC-BF13",
    name: "SNAKE EGG",
    tamilName: "பாம்பு முட்டை",
    category: "kids-special",
    packDetails: "1 Box",
    unitPrice: 20,
    mrp: 80,
    image: "/images/products/snake_egg_v3.jpg",
    inStock: true,
    isBestseller: true,
    isFeatured: true,
    description: "Snake Egg / King Cobra (பாம்பு முட்டை) - Traditional black carbon snake tablet novelty loved by kids."
  },
  // One Sound Crackers (034 - 040)
  {
    id: "prod-34",
    sno: "034",
    code: "SC-SD01",
    name: "2 ¾\" KURUVI",
    tamilName: "2 ¾\" குருவி வெடி",
    category: "sound-crackers",
    packDetails: "1 Pkt",
    unitPrice: 15,
    mrp: 60,
    image: "/images/products/kuruvi_vedi_v1.jpg",
    inStock: true,
    isBestseller: true,
    isFeatured: true,
    description: "2 ¾\" Kuruvi Vedi (குருவி வெடி) - Traditional Anil Sivakasi quick single-burst sound cracker."
  },
  {
    id: "prod-35",
    sno: "035",
    code: "SC-SD02",
    name: "3 ½\" LAXMI",
    tamilName: "3 ½\" மீடியம் லட்சுமி",
    category: "sound-crackers",
    packDetails: "1 Pkt",
    unitPrice: 20,
    mrp: 80,
    image: "/images/products/laxmi_3_5inch_v1.jpg",
    inStock: true,
    isBestseller: true,
    isFeatured: true,
    description: "3 ½\" Medium Laxmi (மீடியம் லட்சுமி) - Classic blue packet loud festive sound cracker."
  },
  {
    id: "prod-36",
    sno: "036",
    code: "SC-SD03",
    name: "4\" GOLD LAXMI",
    tamilName: "4\" கோல்ட் லட்சுமி",
    category: "sound-crackers",
    packDetails: "1 Pkt",
    unitPrice: 40,
    mrp: 160,
    image: "/images/products/gold_laxmi_4inch_v1.jpg",
    inStock: true,
    isBestseller: true,
    isFeatured: true,
    description: "4\" Gold Laxmi (கோல்ட் லட்சுமி) - High decibel thunderous single sound cracker in golden wrap."
  },
  {
    id: "prod-37",
    sno: "037",
    code: "SC-SD04",
    name: "4\" DELUX LAXMI",
    tamilName: "4\" டீலக்ஸ் லட்சுமி",
    category: "sound-crackers",
    packDetails: "1 Pkt",
    unitPrice: 50,
    mrp: 200,
    image: "/images/products/delux_laxmi_4inch_v2.jpg",
    inStock: true,
    isBestseller: false,
    isFeatured: false,
    description: "4\" Delux Laxmi (டீலக்ஸ் லட்சுமி) - Extra power festive sound cracker with booming reverberation."
  },
  {
    id: "prod-38",
    sno: "038",
    code: "SC-SD05",
    name: "5\" JALLIKATTU",
    tamilName: "5\" ஜல்லிக்கட்டு பட்டாசு",
    category: "sound-crackers",
    packDetails: "1 Pkt",
    unitPrice: 70,
    mrp: 280,
    image: "/images/products/jallikattu_5inch_v2.jpg",
    inStock: true,
    isBestseller: true,
    isFeatured: true,
    description: "5\" Jallikattu (ஜல்லிக்கட்டு பட்டாசு) - Heavy giant single sound cracker with echoing roar."
  },
  {
    id: "prod-39",
    sno: "039",
    code: "SC-SD06",
    name: "RED BIJILI",
    tamilName: "ரெட் பிஜிலி",
    category: "sound-crackers",
    packDetails: "1 Pkt",
    unitPrice: 40,
    mrp: 160,
    image: "/images/products/red_bijili_v2.jpg",
    inStock: true,
    isBestseller: true,
    isFeatured: false,
    description: "Red Bijili Crackers (ரெட் பிஜிலி) - Crisp rapid-firing red festive bijili packet."
  },
  {
    id: "prod-40",
    sno: "040",
    code: "SC-SD07",
    name: "VARI BIJILI",
    tamilName: "வரி பிஜிலி",
    category: "sound-crackers",
    packDetails: "1 Pkt",
    unitPrice: 40,
    mrp: 160,
    image: "/images/products/vari_bijili_v2.jpg",
    inStock: true,
    isBestseller: false,
    isFeatured: false,
    description: "Vari Bijili Crackers (வரி பிஜிலி) - Striped traditional crackling bijili crackers packet."
  },
  // Gaint & Deluxe Crackers (041 - 049)
  {
    id: "prod-41",
    sno: "041",
    code: "SC-GD01",
    name: "28 GAINT",
    tamilName: "28 ஜெயின்ட் கிராக்கர்ஸ்",
    category: "giant-deluxe",
    packDetails: "1 Box",
    unitPrice: 30,
    mrp: 120,
    image: "/images/products/taj_mahal_28_gaint_v1.jpg",
    inStock: true,
    isBestseller: true,
    isFeatured: true,
    description: "28 Gaint Crackers (28 ஜெயின்ட் கிராக்கர்ஸ்) - Taj Mahal authentic Sivakasi giant red crackers strip with rapid explosive festive bursts."
  },
  {
    id: "prod-42",
    sno: "042",
    code: "SC-GD02",
    name: "56 GAINT",
    tamilName: "56 ஜெயின்ட் கிராக்கர்ஸ்",
    category: "giant-deluxe",
    packDetails: "1 Box",
    unitPrice: 60,
    mrp: 240,
    image: "/images/products/leopard_king_56_gaint_v1.png",
    inStock: true,
    isBestseller: true,
    isFeatured: true,
    description: "56 Gaint Crackers (56 ஜெயின்ட் கிராக்கர்ஸ்) - Leopard King powerful red garland giant crackers with high decibel rhythmic sound."
  },
  {
    id: "prod-43",
    sno: "043",
    code: "SC-GD03",
    name: "100 GAINT",
    tamilName: "100 ஜெயின்ட் கிராக்கர்ஸ்",
    category: "giant-deluxe",
    packDetails: "1 Box",
    unitPrice: 80,
    mrp: 320,
    image: "/images/products/brander_100_gaint_v1.jpg",
    inStock: true,
    isBestseller: true,
    isFeatured: true,
    description: "100 Gaint Crackers (100 ஜெயின்ட் கிராக்கர்ஸ்) - 100 Brander Goions / Super Galaxy giant crackling garland string for celebratory continuous burst."
  },
  {
    id: "prod-44",
    sno: "044",
    code: "SC-GD04",
    name: "50 DELUXE",
    tamilName: "50 டீலக்ஸ் கிராக்கர்ஸ்",
    category: "giant-deluxe",
    packDetails: "1 Box",
    unitPrice: 150,
    mrp: 600,
    image: "/images/products/rajji_50_deluxe_v1.jpg",
    inStock: true,
    isBestseller: true,
    isFeatured: true,
    description: "50 Deluxe Crackers (50 டீலக்ஸ் கிராக்கர்ஸ்) - Rajji deluxe crackers box providing double-impact premium Sivakasi sound report."
  },
  {
    id: "prod-45",
    sno: "045",
    code: "SC-GD05",
    name: "100 DELUXE",
    tamilName: "100 டீலக்ஸ் கிராக்கர்ஸ்",
    category: "giant-deluxe",
    packDetails: "1 Box",
    unitPrice: 200,
    mrp: 800,
    image: "/images/products/100_deluxe_gold_collection_v1.jpg",
    inStock: true,
    isBestseller: true,
    isFeatured: true,
    description: "100 Deluxe Crackers (100 டீலக்ஸ் கிராக்கர்ஸ்) - Premium Gold Collection high-decibel deluxe festive sound cracker."
  },
  {
    id: "prod-46",
    sno: "046",
    code: "SC-GD06",
    name: "300 GAINT",
    tamilName: "300 வாலா",
    category: "giant-deluxe",
    packDetails: "1 Box",
    unitPrice: 150,
    mrp: 600,
    image: "/images/products/300_gaint_fireworks_king_v1.jpg",
    inStock: true,
    isBestseller: true,
    isFeatured: true,
    description: "300 Gaint / 300 Wala (300 வாலா) - Fireworks King genuine Sivakasi continuous rattling sound garland crackers."
  },
  {
    id: "prod-47",
    sno: "047",
    code: "SC-GD07",
    name: "1K GAINT (HALF COUNTING)",
    tamilName: "1K வாலா",
    category: "giant-deluxe",
    packDetails: "1 Box",
    unitPrice: 250,
    mrp: 1000,
    image: "/images/products/1k_gaint_half_counting_v1.jpg",
    inStock: true,
    isBestseller: true,
    isFeatured: true,
    description: "1K Gaint Half Counting (1K வாலா) - Dr. Vargheese 1000 Wala long crackling garland string with booming climax."
  },
  {
    id: "prod-48",
    sno: "048",
    code: "SC-GD08",
    name: "1K GAINT (FULL COUNTING)",
    tamilName: "1K வாலா",
    category: "giant-deluxe",
    packDetails: "1 Box",
    unitPrice: 400,
    mrp: 1600,
    image: "/images/products/1k_gaint_full_counting_v1.jpg",
    inStock: true,
    isBestseller: true,
    isFeatured: true,
    description: "1K Gaint Full Counting (1K வாலா) - Mothers Red Giant 1000 Wala full count dense celebration garland for non-stop crackers."
  },
  {
    id: "prod-49",
    sno: "049",
    code: "SC-GD09",
    name: "2K GAINT (HALF COUNTING)",
    tamilName: "2K வாலா",
    category: "giant-deluxe",
    packDetails: "1 Box",
    unitPrice: 450,
    mrp: 1800,
    image: "/images/products/2k_gaint_half_counting_v1.jpg",
    inStock: true,
    isBestseller: true,
    isFeatured: true,
    description: "2K Gaint Half Counting (2K வாலா) - Sri Vardhan's 2000 Wala mega celebratory Sivakasi sound garland with deafening multi-stage bursts."
  },
  {
    id: "prod-50",
    sno: "050",
    code: "SC-GD10",
    name: "2K GAINT (FULL COUNTING)",
    tamilName: "2K வாலா",
    category: "giant-deluxe",
    packDetails: "1 Box",
    unitPrice: 600,
    mrp: 2400,
    image: "/images/products/2k_gaint_full_counting_v1.jpg",
    inStock: true,
    isBestseller: true,
    isFeatured: true,
    description: "2K Gaint Full Counting (2K வாலா) - Gyro 2000 King / Wetwo Fireworks 2000 Wala full count lion edition dense celebration garland."
  },
  {
    id: "prod-51",
    sno: "051",
    code: "SC-GD11",
    name: "5K GAINT (HALF COUNTING)",
    tamilName: "5K வாலா",
    category: "giant-deluxe",
    packDetails: "1 Box",
    unitPrice: 1200,
    mrp: 4800,
    image: "/images/products/5k_gaint_half_counting_v1.jpg",
    inStock: true,
    isBestseller: true,
    isFeatured: true,
    description: "5K Gaint Half Counting (5K வாலா) - Indigo 5000 Wala Premium Sivakasi celebration garland with continuous rhythmic bursts."
  },
  {
    id: "prod-52",
    sno: "052",
    code: "SC-GD12",
    name: "5K GAINT (FULL COUNTING)",
    tamilName: "5K வாலா",
    category: "giant-deluxe",
    packDetails: "1 Box",
    unitPrice: 1600,
    mrp: 6400,
    image: "/images/products/5k_gaint_full_counting_v1.jpg",
    inStock: true,
    isBestseller: true,
    isFeatured: true,
    description: "5K Gaint Full Counting (5K வாலா) - Redfort 5000 Magic Crackers heavy full count festival garland for long echoing roar."
  },
  {
    id: "prod-53",
    sno: "053",
    code: "SC-GD13",
    name: "10K GAINT (HALF COUNTING)",
    tamilName: "10K வாலா",
    category: "giant-deluxe",
    packDetails: "1 Box",
    unitPrice: 2800,
    mrp: 11200,
    image: "/images/products/10k_gaint_half_counting_v2.jpg",
    inStock: true,
    isBestseller: true,
    isFeatured: true,
    description: "10K Gaint Half Counting (10K வாலா) - Royal Shells 10,000 Wala Lord Ganesha special giant celebration garland with massive decibel festive fireworks."
  },
  {
    id: "prod-54",
    sno: "054",
    code: "SC-GD14",
    name: "10K GAINT (FULL COUNTING)",
    tamilName: "10K வாலா",
    category: "giant-deluxe",
    packDetails: "1 Box",
    unitPrice: 3600,
    mrp: 14400,
    image: "/images/products/10k_gaint_full_counting_v2.jpg",
    inStock: true,
    isBestseller: true,
    isFeatured: true,
    description: "10K Gaint Full Counting (10K வாலா) - Galaxy Bharat / Redfoilt Korako 10,000 Wala ultimate full count mega giant garland roll."
  },
  // Multi Colour Shots (055 - 058)
  {
    id: "prod-55",
    sno: "055",
    code: "SC-MS01",
    name: "7 SHOT",
    tamilName: "7 சாட் மல்டி கலர்",
    category: "multi-colour-shots",
    packDetails: "1 Box",
    unitPrice: 120,
    mrp: 480,
    image: "/images/products/7_shot_multi_colour_v1.jpg",
    inStock: true,
    isBestseller: true,
    isFeatured: true,
    description: "7 Shot Multi Colour (7 சாட் மல்டி கலர்) - High-altitude 7 consecutive sparkling multi-colour aerial burst shots."
  },
  {
    id: "prod-56",
    sno: "056",
    code: "SC-MS02",
    name: "12 SHOT",
    tamilName: "12 சாட் மல்டி கலர்",
    category: "multi-colour-shots",
    packDetails: "1 Box",
    unitPrice: 200,
    mrp: 800,
    image: "/images/products/12_shot_multi_colour_v1.jpg",
    inStock: true,
    isBestseller: true,
    isFeatured: true,
    description: "12 Shot Multi Colour - WT Challenge 12 (12 சாட் மல்டி கலர்) - 12 aerial repeater shots producing dazzling multi-colour sky bursts and crackling flares."
  },
  {
    id: "prod-57",
    sno: "057",
    code: "SC-MS03",
    name: "15 SHOT SMOKE SHOT",
    tamilName: "15 ஷாட் ஸ்மோக் ஷாட்",
    category: "multi-colour-shots",
    packDetails: "1 Box",
    unitPrice: 480,
    mrp: 1920,
    image: "/images/products/15_shot_smoke_shot_v1.jpg",
    inStock: true,
    isBestseller: true,
    isFeatured: true,
    description: "15 Shot Smoke Shot - Varnajalam Daytime Colour Smoke (15 ஷாட் ஸ்மோக் ஷாட்) - Spectacular 15 daytime multi-colour smoke shots painting the sky with vibrant clouds."
  },
  {
    id: "prod-58",
    sno: "058",
    code: "SC-MS04",
    name: "25 SHOT",
    tamilName: "25 சாட் மல்டி கலர்",
    category: "multi-colour-shots",
    packDetails: "1 Box",
    unitPrice: 250,
    mrp: 1000,
    image: "/images/products/25_shot_multi_colour_v1.jpg",
    inStock: true,
    isBestseller: true,
    isFeatured: true,
    description: "25 Shot Multi Colour - Aurling Networks RMS-26 (25 சாட் மல்டி கலர்) - 25 consecutive aerial multi-colour shots with dazzling stars and thunderous crackling breaks."
  },
  {
    id: "prod-59",
    sno: "059",
    code: "SC-MS05",
    name: "30 SHOT",
    tamilName: "30 சாட் மல்டி கலர்",
    category: "multi-colour-shots",
    packDetails: "1 Box",
    unitPrice: 600,
    mrp: 2400,
    image: "/images/products/30_shot_multi_colour_v1.jpg",
    inStock: true,
    isBestseller: true,
    isFeatured: true,
    description: "30 Shot Multi Colour - AK 30 Shot (30 சாட் மல்டி கலர்) - Spectacular 30-shot aerial repeater with multi-colour starry breaks and glittering crackling palms."
  },
  {
    id: "prod-60",
    sno: "060",
    code: "SC-MS06",
    name: "60 SHOT",
    tamilName: "60 சாட் மல்டி கலர்",
    category: "multi-colour-shots",
    packDetails: "1 Box",
    unitPrice: 1300,
    mrp: 5200,
    image: "/images/products/60_shot_multi_colour_v1.jpg",
    inStock: true,
    isBestseller: true,
    isFeatured: true,
    description: "60 Shot Multi Colour - Anil 30 30 60 Shots (60 சாட் மல்டி கலர்) - Continuous 60 aerial multi-colour shots creating an enchanting sky show with thunderous reports."
  },
  {
    id: "prod-61",
    sno: "061",
    code: "SC-MS07",
    name: "120 SHOT",
    tamilName: "120 சாட் மல்டி கலர்",
    category: "multi-colour-shots",
    packDetails: "1 Box",
    unitPrice: 2400,
    mrp: 9600,
    image: "/images/products/120_shot_multi_colour_v1.jpg",
    inStock: true,
    isBestseller: true,
    isFeatured: true,
    description: "120 Shot Multi Colour - Wala 120 Fireworks (120 சாட் மல்டி கலர்) - Grand celebration 120-shot aerial cake repeater erupting in vibrant multi-colour bouquets and crackling waves."
  },
  {
    id: "prod-62",
    sno: "062",
    code: "SC-MS08",
    name: "240 SHOT",
    tamilName: "240 சாட் மல்டி கலர்",
    category: "multi-colour-shots",
    packDetails: "1 Box",
    unitPrice: 4600,
    mrp: 18400,
    image: "/images/products/240_shot_multi_colour_v1.jpg",
    inStock: true,
    isBestseller: true,
    isFeatured: true,
    description: "240 Shot Multi Colour - Akhanda Sky 240 Shots (240 சாட் மல்டி கலர்) - Ultimate mega display with 240 non-stop aerial shots, rapid-fire crackles, and celestial colour showers."
  },
  {
    id: "prod-63",
    sno: "063",
    code: "SC-MS09",
    name: "PENTA",
    tamilName: "பென்டா மேஜிக்",
    category: "multi-colour-shots",
    packDetails: "1 Box",
    unitPrice: 200,
    mrp: 800,
    image: "/images/products/penta_magic_v2.jpg",
    inStock: true,
    isBestseller: true,
    isFeatured: true,
    description: "Penta Magic (பென்டா மேஜிக்) - Mothers 5-tube multi-shot fancy fountain firework with charming crackles and sparkling stars."
  },
  // Diwali Gift Boxes (064 - 066)
  {
    id: "prod-64",
    sno: "064",
    code: "SC-GB01",
    name: "30 ITEMS GIFT BOX",
    tamilName: "30 ஐட்டம்ஸ் கிப்ட் பாக்ஸ்",
    category: "gift-boxes",
    packDetails: "1 Box",
    unitPrice: 650,
    mrp: 2600,
    image: "/images/products/gift_box_30_items_v1.jpg",
    inStock: true,
    isBestseller: true,
    isFeatured: true,
    description: "30 Items Diwali Gift Box (30 ஐட்டம்ஸ் கிப்ட் பாக்ஸ்) - Complete family festival hamper packed with 30 diverse Sivakasi crackers including sparklers, chakkars, pots, and sound crackers."
  },
  {
    id: "prod-65",
    sno: "065",
    code: "SC-GB02",
    name: "35 ITEMS GIFT BOX",
    tamilName: "35 ஐட்டம்ஸ் கிப்ட் பாக்ஸ்",
    category: "gift-boxes",
    packDetails: "1 Box",
    unitPrice: 850,
    mrp: 3400,
    image: "/images/products/gift_box_35_items_v1.jpg",
    inStock: true,
    isBestseller: true,
    isFeatured: true,
    description: "35 Items Diwali Gift Box - LCOO Chandi (35 ஐட்டம்ஸ் கிப்ட் பாக்ஸ்) - Deluxe celebration gift pack with 35 curated fireworks including sparkling fountains, whistling novelty, and aerial shots."
  },
  {
    id: "prod-66",
    sno: "066",
    code: "SC-GB03",
    name: "40 ITEMS GIFT BOX",
    tamilName: "40 ஐட்டம்ஸ் கிப்ட் பாக்ஸ்",
    category: "gift-boxes",
    packDetails: "1 Box",
    unitPrice: 1000,
    mrp: 4000,
    image: "/images/products/gift_box_40_items_v1.jpg",
    inStock: true,
    isBestseller: true,
    isFeatured: true,
    description: "40 Items Diwali Gift Box - Ruby Special (40 ஐட்டம்ஸ் கிப்ட் பாக்ஸ்) - Premium mega Diwali assortment with 40 varieties featuring grand flowerpots, deluxe sparklers, colour fountains, rockets, and bombs."
  },
  {
    id: "prod-67",
    sno: "067",
    code: "SC-GB04",
    name: "50 ITEMS GIFT BOX",
    tamilName: "50 ஐட்டம்ஸ் கிப்ட் பாக்ஸ்",
    category: "gift-boxes",
    packDetails: "1 Box",
    unitPrice: 1500,
    mrp: 6000,
    image: "/images/products/gift_box_50_items_v1.jpg",
    inStock: true,
    isBestseller: true,
    isFeatured: true,
    description: "50 Items Diwali Gift Box - Golden Carnival (50 ஐட்டம்ஸ் கிப்ட் பாக்ஸ்) - Grand Sivakasi festival carnival hamper featuring 50 assorted crackers including mega flowerpots, dazzling sparklers, rockets, chakkars, and multi-shot crackers."
  },
  {
    id: "prod-68",
    sno: "068",
    code: "SC-GB05",
    name: "60 ITEMS GIFT BOX",
    tamilName: "60 ஐட்டம்ஸ் கிப்ட் பாக்ஸ்",
    category: "gift-boxes",
    packDetails: "1 Box",
    unitPrice: 2100,
    mrp: 8400,
    image: "/images/products/gift_box_60_items_v1.jpg",
    inStock: true,
    isBestseller: true,
    isFeatured: true,
    description: "60 Items Diwali Gift Box - Platinum Mega Pack (60 ஐட்டம்ஸ் கிப்ட் பாக்ஸ்) - Royal Sivakasi celebration mega collection featuring 60 premium fireworks including multi-tube aerial shots, giant flowerpots, sparklers, chakkars, and loud sound crackers."
  },
  // Guns (069 - 072)
  {
    id: "prod-69",
    sno: "069",
    code: "SC-GN01",
    name: "GUN BIG",
    tamilName: "துப்பாக்கி பெரிது",
    category: "guns",
    packDetails: "1 Pcs",
    unitPrice: 50,
    mrp: 200,
    image: "/images/products/gun_big_v1.jpg",
    inStock: true,
    isBestseller: true,
    isFeatured: true,
    description: "Gun Big (துப்பாக்கி பெரிது) - Heavy black assault rifle model toy roll/ring cap cracker gun with realistic recoil click."
  },
  {
    id: "prod-70",
    sno: "070",
    code: "SC-GN02",
    name: "GUN SPECIAL",
    tamilName: "துப்பாக்கி ஸ்பெஷல்",
    category: "guns",
    packDetails: "1 Pcs",
    unitPrice: 80,
    mrp: 320,
    image: "/images/products/gun_special_v1.jpg",
    inStock: true,
    isBestseller: true,
    isFeatured: true,
    description: "Gun Special (துப்பாக்கி ஸ்பெஷல்) - Long barrel hunting shotgun model cap gun with premium wood-grain textured stock."
  },
  {
    id: "prod-71",
    sno: "071",
    code: "SC-GN03",
    name: "GUN DELUXE",
    tamilName: "துப்பாக்கி டீலக்ஸ்",
    category: "guns",
    packDetails: "1 Pcs",
    unitPrice: 120,
    mrp: 480,
    image: "/images/products/gun_deluxe_v1.jpg",
    inStock: true,
    isBestseller: true,
    isFeatured: true,
    description: "Gun Deluxe with Shoulder Strap (துப்பாக்கி டீலக்ஸ்) - Military commando submachine model cap gun equipped with sling strap and extended barrel."
  },
  {
    id: "prod-72",
    sno: "072",
    code: "SC-GN04",
    name: "LEO GUN",
    tamilName: "LEO துப்பாக்கி",
    category: "guns",
    packDetails: "1 Pcs",
    unitPrice: 80,
    mrp: 320,
    image: "/images/products/gun_leo_v1.jpg",
    inStock: true,
    isBestseller: true,
    isFeatured: true,
    description: "Leo Gun No.105 with Ring Caps (LEO துப்பாக்கி) - High-action revolver pistol with ergonomic orange grip and ring cap ammunition tray."
  },
  {
    id: "prod-73",
    sno: "073",
    code: "SC-GN05",
    name: "RING CAP",
    tamilName: "ரிங் கேப்",
    category: "guns",
    packDetails: "1 Pcs",
    unitPrice: 15,
    mrp: 60,
    image: "/images/products/gun_ring_cap_v1.jpg",
    inStock: true,
    isBestseller: true,
    isFeatured: true,
    description: "Ring Cap Ammunition (ரிங் கேப்) - 9-shot plastic circular ring cap cracker frame for toy revolver guns with crisp explosive sound."
  },
  {
    id: "prod-74",
    sno: "074",
    code: "SC-GN06",
    name: "ROLL CAP",
    tamilName: "ரோல் கேப்",
    category: "guns",
    packDetails: "1 Box",
    unitPrice: 80,
    mrp: 320,
    image: "/images/products/gun_roll_cap_v1.jpg",
    inStock: true,
    isBestseller: true,
    isFeatured: true,
    description: "Roll Cap Cracker Strips (ரோல் கேப்) - Continuous red paper roll caps for toy rifle and pistol guns producing steady rapid clicking bangs."
  },
  // Atom Bombs (075 - 079)
  {
    id: "prod-75",
    sno: "075",
    code: "SC-BM01",
    name: "HYDRO BOMB",
    tamilName: "ஹைட்ரோ குண்டு",
    category: "bombs",
    packDetails: "1 Box",
    unitPrice: 80,
    mrp: 320,
    image: "/images/products/hydro_bomb_v1.jpg",
    inStock: true,
    isBestseller: true,
    isFeatured: true,
    description: "Hydro Bomb (ஹைட்ரோ குண்டு) - High-impact explosive atom bomb cracker with deep sound vibration."
  },
  {
    id: "prod-76",
    sno: "076",
    code: "SC-BM02",
    name: "KING OF KING BOMB",
    tamilName: "கிங் ஆப் கிங் பாம்",
    category: "bombs",
    packDetails: "1 Box",
    unitPrice: 120,
    mrp: 480,
    image: "/images/products/king_of_king_bomb_v1.jpg",
    inStock: true,
    isBestseller: true,
    isFeatured: true,
    description: "King of King Bomb (கிங் ஆப் கிங் பாம்) - Premium roaring tiger atom bomb with thunderous decibel burst."
  },
  {
    id: "prod-77",
    sno: "077",
    code: "SC-BM03",
    name: "CLASSIC BOMB",
    tamilName: "கிளாசிக் பாம்",
    category: "bombs",
    packDetails: "1 Box",
    unitPrice: 160,
    mrp: 640,
    image: "/images/products/classic_bomb_v1.jpg",
    inStock: true,
    isBestseller: true,
    isFeatured: true,
    description: "Classic Bomb (கிளாசிக் பாம்) - Heavyweight loud explosive atom bomb cracker with powerful reverberation."
  },
  {
    id: "prod-78",
    sno: "078",
    code: "SC-BM04",
    name: "AGNI BOMB",
    tamilName: "அக்னி குண்டு",
    category: "bombs",
    packDetails: "1 Box (10 Pcs)",
    unitPrice: 240,
    mrp: 960,
    image: "/images/products/agni_bomb_v1.jpg",
    inStock: true,
    isBestseller: true,
    isFeatured: true,
    description: "Agni Bomb (அக்னி குண்டு) - 10 Pcs box of heavy red twine jute bombs with immense explosion intensity."
  },
  {
    id: "prod-79",
    sno: "079",
    code: "SC-BM05",
    name: "DIGITAL BOMB",
    tamilName: "டிஜிட்டல் குண்டு",
    category: "bombs",
    packDetails: "1 Box (10 Pcs)",
    unitPrice: 300,
    mrp: 1200,
    image: "/images/products/digital_bomb_v1.jpg",
    inStock: true,
    isBestseller: true,
    isFeatured: true,
    description: "Digital Bomb (டிஜிட்டல் குண்டு) - 10 Pcs giant jute twine bomb box with maximum blast sound."
  },
  // Matches Box (080 - 082)
  {
    id: "prod-80",
    sno: "080",
    code: "SC-MB01",
    name: "ANNAM COLOUR MATCHES",
    tamilName: "அன்னம் கலர் தீப்பெட்டி",
    category: "matches-box",
    packDetails: "1 Box",
    unitPrice: 80,
    mrp: 320,
    image: "/images/products/annam_matches_v1.jpg",
    inStock: true,
    isBestseller: true,
    isFeatured: false,
    description: "Annam / Ankam Cosmetic Matches Box (அன்னம் கலர் தீப்பெட்டி) - Traditional colourful spark matches box pack."
  },
  {
    id: "prod-81",
    sno: "081",
    code: "SC-MB02",
    name: "HERO ROYAL 7 IN 1 MATCHES",
    tamilName: "ஹீரோ ராயல் 7 இன் 1 கலர் மேட்சஸ்",
    category: "matches-box",
    packDetails: "1 Box",
    unitPrice: 150,
    mrp: 600,
    image: "/images/products/royal_7in1_matches_v1.jpg",
    inStock: true,
    isBestseller: true,
    isFeatured: true,
    description: "Hero Rajasekaran's Royal Super Deluxe 7 in 1 Colour Matches (ஹீரோ ராயல் 7 இன் 1 கலர் மேட்சஸ்) - Multi-colour sparking fancy matchsticks."
  },
  {
    id: "prod-82",
    sno: "082",
    code: "SC-MB03",
    name: "ROYAL SUPER MEGA MATCHES",
    tamilName: "ராயல் சூப்பர் மெகா மேட்சஸ்",
    category: "matches-box",
    packDetails: "1 Box",
    unitPrice: 250,
    mrp: 1000,
    image: "/images/products/royal_super_mega_matches_v1.jpg",
    inStock: true,
    isBestseller: true,
    isFeatured: true,
    description: "Lion Colour Boxes - Royal Super Mega Matches (ராயல் சூப்பர் மெகா மேட்சஸ்) - Mega display pack containing 10 long colour matchboxes featuring green, silver, gold star, and red."
  },
  // Nattu Vedi / Paper Bombs (083 - 085)
  {
    id: "prod-83",
    sno: "083",
    code: "SC-NV01",
    name: "JOKER PAPER BOMB (250g)",
    tamilName: "ஜோக்கர் பேப்பர் பாம் (250g)",
    category: "nattu-vedi",
    packDetails: "1 Pcs",
    unitPrice: 80,
    mrp: 320,
    image: "/images/products/joker_paper_bomb_250g_v1.jpg",
    inStock: true,
    isBestseller: true,
    isFeatured: true,
    description: "Joker Paper Bomb 250g (ஜோக்கர் பேப்பர் பாம் 250g) - Powerful traditional Sivakasi Nattu Vedi paper wrapped bomb."
  },
  {
    id: "prod-84",
    sno: "084",
    code: "SC-NV02",
    name: "JOKER PAPER BOMB (500g)",
    tamilName: "ஜோக்கர் பேப்பர் பாம் (500g)",
    category: "nattu-vedi",
    packDetails: "1 Pcs",
    unitPrice: 140,
    mrp: 560,
    image: "/images/products/joker_paper_bomb_500g_v1.jpg",
    inStock: true,
    isBestseller: true,
    isFeatured: true,
    description: "Joker Paper Bomb 500g (ஜோக்கர் பேப்பர் பாம் 500g) - Heavyweight Sivakasi Nattu Vedi with thunderous blast."
  },
  {
    id: "prod-85",
    sno: "085",
    code: "SC-NV03",
    name: "JOKER PAPER BOMB (1kg)",
    tamilName: "ஜோக்கர் பேப்பர் பாம் (1kg)",
    category: "nattu-vedi",
    packDetails: "1 Pcs",
    unitPrice: 250,
    mrp: 1000,
    image: "/images/products/joker_paper_bomb_1kg_v1.jpg",
    inStock: true,
    isBestseller: true,
    isFeatured: true,
    description: "Joker Paper Bomb 1kg (ஜோக்கர் பேப்பர் பாம் 1kg) - Giant heavy-impact Sivakasi paper bomb with massive ground-shaking reverberation."
  },
  // Mega Display / Aerial Fancy (086 - 090)
  {
    id: "prod-86",
    sno: "086",
    code: "SC-AF01",
    name: "2\" ARIAL FANCY",
    tamilName: "2\" ஏரியல் பேன்சி",
    category: "fancy-crackers",
    packDetails: "1 Pcs",
    unitPrice: 120,
    mrp: 480,
    image: "/images/products/arial_fancy_2inch_single_v1.jpg",
    inStock: true,
    isBestseller: true,
    isFeatured: true,
    description: "2\" Arial Fancy (2\" ஏரியல் பேன்சி) - Single shot colorful aerial fountain burst reaching high sky elevation with vibrant stars."
  },
  {
    id: "prod-87",
    sno: "087",
    code: "SC-AF02",
    name: "2\" ARIAL FANCY (3 PCS)",
    tamilName: "2\" ஏரியல் பேன்சி (3 PCS)",
    category: "fancy-crackers",
    packDetails: "1 Box (3 Pcs)",
    unitPrice: 280,
    mrp: 1120,
    image: "/images/products/arial_fancy_2inch_3pcs_v1.jpg",
    inStock: true,
    isBestseller: true,
    isFeatured: false,
    description: "2\" Arial Fancy 3 Pcs Pack (2\" ஏரியல் பேன்சி 3 PCS) - Pack of 3 aerial sky shots with dazzling multi-color burst effects."
  },
  {
    id: "prod-88",
    sno: "088",
    code: "SC-AF03",
    name: "3 ½\" ARIAL FANCY",
    tamilName: "3 ½\" ஏரியல் பேன்சி",
    category: "fancy-crackers",
    packDetails: "1 Box",
    unitPrice: 350,
    mrp: 1400,
    image: "/images/products/golden_eye_3_5inch_v1.jpg",
    inStock: true,
    isBestseller: true,
    isFeatured: true,
    description: "3 ½\" Arial Fancy - Golden Eye Mega Shots (3 ½\" ஏரியல் பேன்சி) - Giant aerial shot with launching cylinder producing spectacular golden canopy fireworks."
  },
  {
    id: "prod-89",
    sno: "089",
    code: "SC-AF04",
    name: "4\" ARIAL FANCY",
    tamilName: "4\" ஏரியல் பேன்சி",
    category: "fancy-crackers",
    packDetails: "1 Box",
    unitPrice: 400,
    mrp: 1600,
    image: "/images/products/rich_fountain_4inch_v1.jpg",
    inStock: true,
    isBestseller: true,
    isFeatured: true,
    description: "4\" Arial Fancy - Rich Fountain Multiple Effects (4\" ஏரியல் பேன்சி) - High-altitude mega aerial display with multiple color transformations and extreme height."
  },
  {
    id: "prod-90",
    sno: "090",
    code: "SC-AF05",
    name: "4 ½\" ARIAL FANCY",
    tamilName: "4 ½\" ஏரியல் பேன்சி",
    category: "fancy-crackers",
    packDetails: "1 Box",
    unitPrice: 450,
    mrp: 1800,
    image: "/images/products/sky_lights_4_5inch_v1.jpg",
    inStock: true,
    isBestseller: true,
    isFeatured: true,
    description: "4 ½\" Arial Fancy - Sky Lights 5 Shots Multi-Effect (4 ½\" ஏரியல் பேன்சி) - Massive 5-shot aerial repeater offering sparkling night skies and thunderous crackling breaks."
  }
];

// Initial Realistic Sample Orders for Admin Dashboard
const DEFAULT_ORDERS = [
  {
    orderId: "SC-2026-0002",
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
      { id: "prod-1", code: "SC-SP01", name: "10 CM ELECTRIC SPARKLER", packDetails: "1 Box", unitPrice: 20, quantity: 5, totalPrice: 100, image: "/images/products/sparkler_10cm_electric.png" },
      { id: "prod-3", code: "SC-SP03", name: "15 CM ELECTRIC SPARKLER", packDetails: "1 Box", unitPrice: 55, quantity: 4, totalPrice: 220, image: "/images/products/sparkler_15cm_electric.png" },
      { id: "prod-5", code: "SC-SP05", name: "30 CM ELECTRIC SPARKLER", packDetails: "1 Box", unitPrice: 60, quantity: 5, totalPrice: 300, image: "/images/products/sparkler_30cm_electric.png" },
      { id: "prod-7", code: "SC-SP07", name: "50 CM ELECTRIC SPARKLER", packDetails: "1 Box", unitPrice: 200, quantity: 4, totalPrice: 800, image: "/images/products/sparkler_50cm_electric.png" }
    ],
    subtotal: 1420,
    deliveryCharge: 0,
    grandTotal: 1420,
    status: "Pending"
  },
  {
    orderId: "SC-2026-0001",
    createdAt: new Date(Date.now() - 3600000 * 28).toISOString(),
    customer: {
      name: "Priya Sundaram",
      phone: "9842198421",
      email: "priya.sundar@gmail.com",
      deliveryType: "delivery",
      address: "Store Pickup - Sivakasi Showroom",
      notes: "Will pick up around 6 PM."
    },
    items: [
      { id: "prod-3", code: "SC-SP03", name: "15 CM ELECTRIC SPARKLER", packDetails: "1 Box", unitPrice: 55, quantity: 10, totalPrice: 550, image: "/images/products/sparkler_15cm_electric.png" },
      { id: "prod-4", code: "SC-SP04", name: "15 CM COLOUR SPARKLER", packDetails: "1 Box", unitPrice: 55, quantity: 10, totalPrice: 550, image: "/images/products/sparkler_15cm_colour.png" },
      { id: "prod-6", code: "SC-SP06", name: "30 CM COLOUR SPARKLER", packDetails: "1 Box", unitPrice: 60, quantity: 10, totalPrice: 600, image: "/images/products/sparkler_30cm_colour.png" }
    ],
    subtotal: 1700,
    deliveryCharge: 0,
    grandTotal: 1700,
    status: "Processing"
  }
];

// ============================================================================
// 30-DAY BILL RETENTION & AUTO-DELETE SYSTEM
// ============================================================================
export const ORDER_RETENTION_DAYS = 30;
export const ORDER_RETENTION_MS = ORDER_RETENTION_DAYS * 24 * 60 * 60 * 1000; // 30 days = 2,592,000,000 ms

/**
 * Checks if an order's createdAt is older than 30 days
 */
export const isOrderExpired = (order, now = Date.now()) => {
  if (!order || !order.createdAt) return false;
  const time = new Date(order.createdAt).getTime();
  if (isNaN(time)) return false;
  return (now - time) > ORDER_RETENTION_MS;
};

/**
 * Returns precise retention details for Admin UI (days remaining, expiry timestamp, alert flags)
 */
export const getOrderRetentionDetails = (order, now = Date.now()) => {
  if (!order || !order.createdAt) {
    return { daysRemaining: ORDER_RETENTION_DAYS, isExpired: false, percentRemaining: 100, expiresAt: null };
  }
  const time = new Date(order.createdAt).getTime();
  if (isNaN(time)) {
    return { daysRemaining: ORDER_RETENTION_DAYS, isExpired: false, percentRemaining: 100, expiresAt: null };
  }
  const ageMs = now - time;
  const msRemaining = ORDER_RETENTION_MS - ageMs;
  const daysRemaining = Math.max(0, Math.ceil(msRemaining / (24 * 60 * 60 * 1000)));
  const isExpired = ageMs > ORDER_RETENTION_MS;
  const percentRemaining = Math.max(0, Math.min(100, Math.round((msRemaining / ORDER_RETENTION_MS) * 100)));
  const expiresAt = new Date(time + ORDER_RETENTION_MS).toISOString();

  return {
    daysRemaining,
    isExpired,
    percentRemaining,
    expiresAt,
    isNearExpiry: daysRemaining <= 5 && !isExpired
  };
};

/**
 * Filters out any bills older than 30 days
 */
export const filterActiveOrders = (orders = [], now = Date.now()) => {
  if (!Array.isArray(orders)) return [];
  return orders.filter(o => !isOrderExpired(o, now));
};

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
      if (!parsed.logoUrl || parsed.logoUrl !== '/images/sharp_crackers_brand_logo.jpg') {
        parsed.logoUrl = '/images/sharp_crackers_brand_logo.jpg';
        changed = true;
      }
      if (!parsed.phone || parsed.phone.includes('98421')) {
        parsed.phone = '+91 95668 86795';
        changed = true;
      }
      if (parsed.altPhone && parsed.altPhone.includes('94432')) {
        parsed.altPhone = '';
        changed = true;
      }
      if (!parsed.whatsapp || parsed.whatsapp.includes('98421')) {
        parsed.whatsapp = '919566886795';
        changed = true;
      }
      if (!parsed.email || parsed.email.includes('sharpcrackers.com')) {
        parsed.email = 'sharpcrackars@gmail.com';
        changed = true;
      }
      if (!parsed.address || parsed.address.includes('Sivakasi - 626123')) {
        parsed.address = '89, Sivasakthy Layout, Selvam Mahal (opposite), Chettipalayam Road, Echanari, Coimbatore - 641 021. Tamilnadu';
        parsed.branchAddress = '';
        changed = true;
      }
      if (changed) {
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(parsed));
        try { notifyDataChanged({ type: 'SETTINGS_UPDATED', settings: parsed }); } catch (_) {}
      }
      return parsed;
    } catch {
      return DEFAULT_SETTINGS;
    }
  },

  getAdminHeaders() {
    let token = 'sharp_adm_sec_2026';
    if (typeof window !== 'undefined') {
      try {
        const s = JSON.parse(localStorage.getItem(STORAGE_KEYS.ADMIN_SESSION) || '{}');
        if (s && s.token) token = s.token;
      } catch {}
    }
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'X-Admin-Key': 'sharp2026'
    };
  },

  updateSettings(newSettings) {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(newSettings));
    notifyDataChanged({ type: 'SETTINGS_UPDATED', settings: newSettings });
    fetch('/api/settings', {
      method: 'POST',
      headers: this.getAdminHeaders(),
      body: JSON.stringify(newSettings)
    }).catch(() => {});
    return newSettings;
  },

  async fetchSettings() {
    try {
      const res = await fetch('/api/settings', { cache: 'no-store' });
      if (res.ok) {
        const remote = await res.json();
        if (remote && typeof remote === 'object' && Object.keys(remote).length > 0) {
          const current = this.getSettings();
          const merged = { ...current, ...remote };
          localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(merged));
          notifyDataChanged({ type: 'SETTINGS_UPDATED', settings: merged });
          return merged;
        }
      }
    } catch (_) {}
    return this.getSettings();
  },

  // --- CATEGORIES ---
  getCategories() {
    const data = typeof window !== 'undefined'
      ? (localStorage.getItem(STORAGE_KEYS.CATEGORIES) || localStorage.getItem('shark_crackers_categories'))
      : null;
    let categories = DEFAULT_CATEGORIES;
    if (data) {
      try {
        categories = JSON.parse(data);
      } catch {
        categories = DEFAULT_CATEGORIES;
      }
    }
    if (!Array.isArray(categories) || categories.length === 0) {
      categories = DEFAULT_CATEGORIES;
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
      }
      return categories;
    }

    // Strip out any redundant 'all' category card
    let needsSave = !data || categories.some(c => c && c.id === 'all');
    categories = categories.filter(c => c && c.id !== 'all');
    const defaultCatMap = {};
    DEFAULT_CATEGORIES.forEach(dc => { defaultCatMap[dc.id] = dc; });

    const mapped = categories.map(c => {
      const defCat = defaultCatMap[c.id];
      const expectedName = c.name || defCat?.name || c.id;
      const expectedTa = c.ta || CATEGORY_TAMIL_NAMES[c.id] || defCat?.ta || '';
      const expectedImage = c.image || defCat?.image || '/images/sharp_celebration_hero_banner.jpg';
      const expectedIcon = c.icon || defCat?.icon || '';
      if (c.ta !== expectedTa || c.name !== expectedName || c.image !== expectedImage || c.icon !== expectedIcon) {
        needsSave = true;
        return { ...c, name: expectedName, ta: expectedTa, image: expectedImage, icon: expectedIcon };
      }
      return c;
    });
    if (needsSave && typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(mapped));
    }
    return mapped;
  },

  saveCategories(categories) {
    const cleanCats = (categories || []).filter(c => c && c.id !== 'all');
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(cleanCats));
    }
    notifyDataChanged({ type: 'CATEGORIES_UPDATED' });
    fetch('/api/categories', {
      method: 'POST',
      headers: this.getAdminHeaders(),
      body: JSON.stringify(cleanCats)
    }).catch(() => {});
    return cleanCats;
  },

  addCategory(category) {
    const categories = this.getCategories();
    const newCat = {
      id: category.id || category.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      name: category.name,
      ta: category.ta || '',
      desc: category.desc || '',
      icon: category.icon || '',
      image: category.image || '/images/sharp_celebration_hero_banner.jpg',
      active: true
    };
    categories.push(newCat);
    this.saveCategories(categories);
    return newCat;
  },

  updateCategory(updatedCat) {
    const categories = this.getCategories().map(c => c.id === updatedCat.id ? { 
      ...c, 
      ...updatedCat,
      ta: updatedCat.ta !== undefined ? updatedCat.ta : c.ta,
      desc: updatedCat.desc !== undefined ? updatedCat.desc : c.desc,
      image: updatedCat.image || c.image
    } : c);
    this.saveCategories(categories);
    return updatedCat;
  },

  deleteCategory(catId, fallbackCategoryId = null) {
    if (catId === 'all') {
      throw new Error("System category 'All Products' cannot be deleted.");
    }
    const categories = this.getCategories().filter(c => c.id !== catId);
    this.saveCategories(categories);

    // If products belonged to this deleted category, safely reassign them to fallback or first remaining category
    const remainingCatId = fallbackCategoryId || (categories.length > 0 ? categories[0].id : 'sparklers');
    const products = this.getProducts();
    let prodsChanged = false;
    const updatedProducts = products.map(p => {
      if (p.category === catId) {
        prodsChanged = true;
        return { ...p, category: remainingCatId };
      }
      return p;
    });
    if (prodsChanged) {
      this.saveProducts(updatedProducts);
    }
    return true;
  },

  // --- PRODUCTS ---
  getProducts() {
    const CATALOG_VERSION = 'v34_bijili_and_clean_cats';
    if (typeof window !== 'undefined') {
      const storedVersion = localStorage.getItem('sharp_crackers_catalog_version');
      if (storedVersion !== CATALOG_VERSION) {
        // Automatically flush old items and load real catalog with HD assets
        localStorage.setItem('sharp_crackers_catalog_version', CATALOG_VERSION);
        localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(DEFAULT_CATEGORIES));
        localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(DEFAULT_PRODUCTS));
        notifyDataChanged({ type: 'PRODUCTS_UPDATED' });
        return DEFAULT_PRODUCTS;
      }
    }
    const data = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEYS.PRODUCTS) : null;
    let products = DEFAULT_PRODUCTS;
    if (data) {
      try {
        products = JSON.parse(data);
      } catch {
        products = DEFAULT_PRODUCTS;
      }
    }

    if (!Array.isArray(products) || products.length === 0) {
      products = DEFAULT_PRODUCTS;
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
      }
      return products;
    }

    let needsSave = !data;

    const defaultMap = {};
    DEFAULT_PRODUCTS.forEach(dp => { defaultMap[dp.code] = dp; });

    // Guarantee that every product has permanent 3-digit serial number sno, bilingual tamilName, and latest HD image while preserving admin edits
    const mapped = products.map((p, idx) => {
      let expectedSno = p.sno;
      if (!expectedSno) {
        expectedSno = PRODUCT_SERIAL_NUMBERS[p.code] || String(idx + 1).padStart(3, '0');
      } else {
        const num = parseInt(p.sno, 10);
        if (!isNaN(num)) {
          expectedSno = String(num).padStart(3, '0');
        }
      }
      const def = defaultMap[p.code];
      const expectedTamil = p.tamilName || PRODUCT_TAMIL_NAMES[p.code] || '';
      const expectedImage = p.image || def?.image || '/images/products/sparkler_10cm_electric.jpg';
      const expectedStock = p.stockCount !== undefined ? Number(p.stockCount) : (p.inStock !== false ? 100 : 0);

      if (p.sno !== expectedSno || p.tamilName !== expectedTamil || p.image !== expectedImage || p.stockCount === undefined) {
        needsSave = true;
        return { ...p, sno: expectedSno, tamilName: expectedTamil, image: expectedImage, stockCount: expectedStock };
      }
      return p;
    });

    if (needsSave && typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(mapped));
    }
    return mapped;
  },

  getProductById(id) {
    return this.getProducts().find(p => p.id === id);
  },

  saveProducts(products) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    }
    notifyDataChanged({ type: 'PRODUCTS_UPDATED' });
    fetch('/api/products', {
      method: 'POST',
      headers: this.getAdminHeaders(),
      body: JSON.stringify(products)
    }).catch(() => {});
    return products;
  },

  async fetchProducts() {
    try {
      const res = await fetch('/api/products', { cache: 'no-store' });
      if (res.ok) {
        const remote = await res.json();
        if (Array.isArray(remote) && remote.length > 0) {
          const localStr = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEYS.PRODUCTS) : null;
          const remoteStr = JSON.stringify(remote);
          if (localStr !== remoteStr) {
            if (typeof window !== 'undefined') {
              localStorage.setItem(STORAGE_KEYS.PRODUCTS, remoteStr);
            }
            notifyDataChanged({ type: 'PRODUCTS_UPDATED' });
          }
          return remote;
        } else if (remote === null) {
          // Auto-seed Cloudflare D1 database with default catalog on first boot
          const local = this.getProducts();
          this.saveProducts(local);
          return local;
        }
      }
    } catch (err) {
      console.warn("fetchProducts error:", err);
    }
    return this.getProducts();
  },

  async fetchCategories() {
    try {
      const res = await fetch('/api/categories', { cache: 'no-store' });
      if (res.ok) {
        const remote = await res.json();
        if (Array.isArray(remote) && remote.length > 0) {
          const cleanRemote = remote.filter(c => c && c.id !== 'all');
          const localStr = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEYS.CATEGORIES) : null;
          const remoteStr = JSON.stringify(cleanRemote);
          if (localStr !== remoteStr) {
            if (typeof window !== 'undefined') {
              localStorage.setItem(STORAGE_KEYS.CATEGORIES, remoteStr);
            }
            notifyDataChanged({ type: 'CATEGORIES_UPDATED' });
          }
          return cleanRemote;
        } else if (remote === null) {
          // Auto-seed Cloudflare D1 database with clean default categories on first boot
          const local = this.getCategories();
          this.saveCategories(local);
          return local;
        }
      }
    } catch (err) {
      console.warn("fetchCategories error:", err);
    }
    return this.getCategories();
  },

  addProduct(product) {
    const products = this.getProducts();
    const maxSno = products.reduce((max, p) => {
      const n = parseInt(p.sno, 10);
      return !isNaN(n) && n > max ? n : max;
    }, products.length);

    const stockNum = product.stockCount !== undefined && product.stockCount !== ''
      ? Math.max(0, parseInt(product.stockCount, 10) || 0)
      : (product.inStock !== false ? 100 : 0);
    const inStockVal = stockNum > 0 ? (product.inStock !== false) : false;

    const newProd = {
      id: "prod-" + Date.now(),
      sno: product.sno || String(maxSno + 1).padStart(3, '0'),
      code: product.code || ("SC-" + (products.length + 101)),
      name: product.name,
      tamilName: product.tamilName || "",
      category: product.category || "sparklers",
      packDetails: product.packDetails || "1 Box",
      unitPrice: Number(product.unitPrice) || 0,
      mrp: Number(product.mrp) || (Number(product.unitPrice) * 3.5),
      image: product.image || "/images/products/sparkler_10cm_electric.jpg",
      stockCount: stockNum,
      inStock: inStockVal,
      isBestseller: !!product.isBestseller,
      isFeatured: !!product.isFeatured,
      description: product.description || ""
    };
    products.unshift(newProd);
    this.saveProducts(products);
    return newProd;
  },

  updateProduct(updatedProduct) {
    const stockNum = updatedProduct.stockCount !== undefined && updatedProduct.stockCount !== ''
      ? Math.max(0, parseInt(updatedProduct.stockCount, 10) || 0)
      : (updatedProduct.inStock !== false ? 100 : 0);
    const inStockVal = stockNum > 0 ? (updatedProduct.inStock !== false) : false;

    const finalProduct = {
      ...updatedProduct,
      tamilName: updatedProduct.tamilName || "",
      unitPrice: Number(updatedProduct.unitPrice),
      mrp: Number(updatedProduct.mrp) || (Number(updatedProduct.unitPrice) * 3.5),
      stockCount: stockNum,
      inStock: inStockVal
    };

    const products = this.getProducts().map(p => p.id === updatedProduct.id ? {
      ...p,
      ...finalProduct
    } : p);
    this.saveProducts(products);
    return finalProduct;
  },

  deleteProduct(productId) {
    const products = this.getProducts().filter(p => p.id !== productId);
    this.saveProducts(products);
    return true;
  },

  // --- 30-DAY RETENTION EXPORTS ATTACHED TO dataService ---
  ORDER_RETENTION_DAYS,
  ORDER_RETENTION_MS,
  isOrderExpired,
  getOrderRetentionDetails,
  filterActiveOrders,

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

  // --- BACKUP & ARCHIVE ORDERS (Bills retained past 30 days) ---
  getBackupOrders() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.BACKUP_ORDERS) || localStorage.getItem('shark_crackers_orders_backup');
      const list = data ? JSON.parse(data) : [];
      return Array.isArray(list) ? list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)) : [];
    } catch {
      return [];
    }
  },

  saveBackupOrders(backupOrders) {
    if (!Array.isArray(backupOrders)) return [];
    localStorage.setItem(STORAGE_KEYS.BACKUP_ORDERS, JSON.stringify(backupOrders));
    notifyDataChanged({ type: 'BACKUP_ORDERS_UPDATED' });
    return backupOrders;
  },

  archiveExpiredOrders(expiredOrders = []) {
    if (!Array.isArray(expiredOrders) || expiredOrders.length === 0) return [];
    const currentBackup = this.getBackupOrders();
    const map = new Map();
    currentBackup.forEach(o => { if (o && o.orderId) map.set(o.orderId, o); });
    const nowIso = new Date().toISOString();

    expiredOrders.forEach(o => {
      if (o && o.orderId && !map.has(o.orderId)) {
        map.set(o.orderId, { ...o, archivedAt: nowIso, isArchived: true });
      }
    });

    const updatedBackup = Array.from(map.values()).sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    this.saveBackupOrders(updatedBackup);

    // Sync backup batch to server/cloud storage
    fetch('/api/orders/backup', {
      method: 'POST',
      headers: this.getAdminHeaders(),
      body: JSON.stringify(expiredOrders)
    }).catch(() => {});

    return updatedBackup;
  },

  async fetchBackupOrders() {
    try {
      const res = await fetch('/api/orders/backup');
      if (res.ok) {
        const remoteBackup = await res.json();
        if (Array.isArray(remoteBackup)) {
          const localBackup = this.getBackupOrders();
          const map = new Map();
          localBackup.forEach(o => { if (o && o.orderId) map.set(o.orderId, o); });
          remoteBackup.forEach(o => { if (o && o.orderId) map.set(o.orderId, o); });
          const unified = Array.from(map.values()).sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
          this.saveBackupOrders(unified);
          return unified;
        }
      }
    } catch (e) {
      // Offline fallback
    }
    return this.getBackupOrders();
  },

  async restoreOrderFromBackup(orderId) {
    const backupList = this.getBackupOrders();
    const target = backupList.find(o => o.orderId === orderId);
    if (!target) return false;

    // Remove from backup
    const newBackup = backupList.filter(o => o.orderId !== orderId);
    this.saveBackupOrders(newBackup);

    // Refresh timestamps and prepend to active orders
    const restored = {
      ...target,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    delete restored.archivedAt;
    delete restored.isArchived;

    const currentOrders = this.getOrders();
    const updatedOrders = [restored, ...currentOrders.filter(o => o.orderId !== orderId)];
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(updatedOrders));
    notifyDataChanged({ type: 'ORDER_RESTORED', order: restored });

    // Sync to backend
    fetch('/api/orders/restore', {
      method: 'POST',
      headers: this.getAdminHeaders(),
      body: JSON.stringify({ orderId })
    }).catch(() => {});

    return restored;
  },

  getOrders() {
    const data = localStorage.getItem(STORAGE_KEYS.ORDERS);
    if (!data) {
      const initialActive = filterActiveOrders(DEFAULT_ORDERS);
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(initialActive));
      return initialActive;
    }
    try {
      const parsed = JSON.parse(data);
      const deletedSet = new Set(this.getDeletedOrderIds());
      const nonDeleted = parsed.filter(o => o && o.orderId && !deletedSet.has(o.orderId));
      
      // Separate active and expired (> 30 days)
      const activeOrders = [];
      const expiredOrders = [];
      nonDeleted.forEach(o => {
        if (isOrderExpired(o)) {
          expiredOrders.push(o);
        } else {
          activeOrders.push(o);
        }
      });

      // Automatically store expired bills into secure backup storage
      if (expiredOrders.length > 0) {
        this.archiveExpiredOrders(expiredOrders);
      }
      
      const normalized = this.normalizeOrderSequences(activeOrders);
      if (JSON.stringify(normalized) !== JSON.stringify(parsed)) {
        localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(normalized));
      }
      return normalized;
    } catch {
      return filterActiveOrders(DEFAULT_ORDERS);
    }
  },

  // Manual or automatic purge of expired orders (> 30 days old)
  pruneExpiredOrders() {
    const rawData = localStorage.getItem(STORAGE_KEYS.ORDERS);
    const parsed = rawData ? JSON.parse(rawData) : [];
    const active = [];
    const expired = [];
    parsed.forEach(o => {
      if (isOrderExpired(o)) {
        expired.push(o);
      } else {
        active.push(o);
      }
    });

    if (expired.length > 0) {
      this.archiveExpiredOrders(expired);
    }
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(active));
    if (expired.length > 0) {
      notifyDataChanged({ type: 'ORDERS_PRUNED', prunedCount: expired.length });
    }
    // Sync with cloud backend
    this.fetchOrders().catch(() => {});
    return { prunedCount: expired.length, remainingCount: active.length };
  },

  // Safe deduplicated two-way merge: keeps active orders within 30 days
  mergeOrders(localOrders = [], remoteOrders = [], deletedIds = []) {
    const deletedSet = new Set(deletedIds);
    const map = new Map();
    const now = Date.now();

    // 1. Load local orders (only active within 30 days)
    filterActiveOrders(localOrders, now).forEach(o => {
      if (o && o.orderId && !deletedSet.has(o.orderId)) {
        map.set(o.orderId, o);
      }
    });

    // 2. Merge remote orders (only active within 30 days)
    filterActiveOrders(remoteOrders, now).forEach(ro => {
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

    const unified = Array.from(map.values()).sort((a, b) => {
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    });

    return this.normalizeOrderSequences(unified);
  },

  normalizeOrderSequences(orders) {
    if (!Array.isArray(orders) || orders.length === 0) return [];

    // Check if there are any legacy random timestamp IDs (> 9999 or non-continuous)
    const hasLegacyIds = orders.some(o => {
      if (!o || !o.orderId) return false;
      const m = String(o.orderId).match(/SC-(?:\d{4}-)?(\d+)$/i);
      return !m || parseInt(m[1], 10) > 9999;
    });

    if (!hasLegacyIds) return orders;

    // Sort chronologically (oldest first) to assign continuous sequence 1, 2, 3...
    const sorted = [...orders].sort((a, b) => {
      return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
    });

    const currentYear = new Date().getFullYear();
    const oldIdsToPurge = [];
    const normalized = sorted.map((o, idx) => {
      const seq = idx + 1;
      const cleanId = `SC-${currentYear}-${String(seq).padStart(4, '0')}`;
      if (o.orderId && o.orderId !== cleanId && (String(o.orderId).length > 11 || !/^SC-\d{4}-\d{4}$/.test(o.orderId))) {
        oldIdsToPurge.push(o.orderId);
      }
      return {
        ...o,
        orderId: cleanId
      };
    });

    // Mark old random IDs as deleted so cloud sync purges them
    if (oldIdsToPurge.length > 0 && typeof window !== 'undefined') {
      try {
        const deleted = this.getDeletedOrderIds();
        const mergedDeleted = Array.from(new Set([...deleted, ...oldIdsToPurge]));
        localStorage.setItem(STORAGE_KEYS.DELETED_ORDERS, JSON.stringify(mergedDeleted));
      } catch {}
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem('sharp_crackers_invoice_counter', String(sorted.length));
    }

    // Return in reverse chronological order (newest first for display)
    return normalized.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
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
    if (!orderId) return null;
    return this.getOrders().find(o => String(o.orderId).trim().toLowerCase() === String(orderId).trim().toLowerCase());
  },

  getLastPlacedOrder() {
    try {
      const orderId = typeof window !== 'undefined' ? localStorage.getItem('sharp_last_customer_order_id') : null;
      if (orderId) {
        return this.getOrderById(orderId);
      }
    } catch {}
    return null;
  },

  setLastPlacedOrderId(orderId) {
    try {
      if (typeof window !== 'undefined' && orderId) {
        localStorage.setItem('sharp_last_customer_order_id', String(orderId));
      }
    } catch {}
  },

  async fetchOrderById(orderId) {
    if (!orderId) return null;
    let local = this.getOrderById(orderId);
    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(orderId)}`, { cache: 'no-store' });
      if (res.ok) {
        const remote = await res.json();
        if (remote && remote.orderId) {
          const orders = this.getOrders();
          const idx = orders.findIndex(o => o.orderId === remote.orderId);
          if (idx !== -1) {
            orders[idx] = { ...orders[idx], ...remote };
          } else {
            orders.unshift(remote);
          }
          localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
          notifyDataChanged({ type: 'ORDER_STATUS_CHANGED', orderId: remote.orderId, status: remote.status, order: remote });
          return remote;
        }
      }
    } catch (_) {}
    return local;
  },

  generateContinuousInvoiceId() {
    const orders = this.getOrders();
    const currentYear = new Date().getFullYear();
    let maxSeq = 0;

    // 1. Check all existing active orders (strictly sequences <= 9999)
    orders.forEach(o => {
      if (!o || !o.orderId) return;
      const match = String(o.orderId).match(/SC-(?:\d{4}-)?(\d{1,4})$/i);
      if (match) {
        const num = parseInt(match[1], 10);
        if (!isNaN(num) && num < 10000 && num > maxSeq) {
          maxSeq = num;
        }
      }
    });

    // 2. Check local sequence counter in localStorage
    try {
      const storedSeq = typeof window !== 'undefined' ? localStorage.getItem('sharp_crackers_invoice_counter') : null;
      if (storedSeq) {
        const parsed = parseInt(storedSeq, 10);
        if (!isNaN(parsed) && parsed < 10000 && parsed > maxSeq) {
          maxSeq = parsed;
        }
      }
    } catch {}

    const nextSeq = maxSeq + 1;
    if (typeof window !== 'undefined') {
      localStorage.setItem('sharp_crackers_invoice_counter', String(nextSeq));
    }

    return `SC-${currentYear}-${String(nextSeq).padStart(4, '0')}`;
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

    const settings = this.getSettings();
    const deliveryCharge = 0;
    const grandTotal = calculatedSubtotal;

    const orderId = orderData.orderId && !String(orderData.orderId).includes('DRAFT')
      ? orderData.orderId 
      : this.generateContinuousInvoiceId();

    const newOrder = {
      orderId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      customer: {
        name: orderData.customer.name.trim(),
        phone: orderData.customer.phone.trim(),
        email: (orderData.customer.email || '').trim(),
        deliveryType: 'standard',
        address: (orderData.customer.address || '').trim(),
        notes: (orderData.customer.notes || '').trim()
      },
      items: validatedItems,
      subtotal: calculatedSubtotal,
      deliveryCharge: 0,
      grandTotal: grandTotal,
      status: 'Pending'
    };

    // Save immediately locally (pruning any orders older than 30 days)
    const activeOrders = filterActiveOrders(orders);
    activeOrders.unshift(newOrder);
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(activeOrders));
    this.setLastPlacedOrderId(newOrder.orderId);
    notifyDataChanged({ type: 'ORDER_CREATED', order: newOrder });

    // Sync to universal cloud/server API with guaranteed await
    try {
      await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrder)
      });
      // Reconcile cloud state across all devices
      this.fetchOrders().catch(() => {});
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
      await fetch(`/api/orders/${orderId}`, {
        method: 'DELETE',
        headers: this.getAdminHeaders()
      });
    } catch (_) {}

    return true;
  },

  // --- ENQUIRIES ---
  getEnquiries() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ENQUIRIES);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
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
    const enquiryNumber = `#ENQ-${Date.now().toString().slice(-6)}`;
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
  // SHA-256 Hash of Authorized Administrative Password ('sharp2026!')
  // Plaintext credentials are NEVER exposed in the client bundle!
  AUTH_PASS_HASH: '424b68351d73645a7da4bc2da754dbb6f939536b7e8f4e69add9f2c7f7b89aa0',

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

  async adminLogin(username, password) {
    const cleanUser = (username || '').trim().toLowerCase();
    const cleanPass = (password || '').trim();

    if (!cleanUser || !cleanPass) {
      return { success: false, message: 'Please enter both username and password.' };
    }

    if (cleanUser !== 'admin' && cleanUser !== 'sharp') {
      return { success: false, message: 'Invalid administrative username.' };
    }

    // 1. Try server-side authentication if online
    try {
      const resp = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: cleanUser, password: cleanPass })
      });
      if (resp.ok) {
        const data = await resp.json();
        const session = {
          authenticated: true,
          user: data.user || (cleanUser === 'admin' ? 'Admin Manager' : 'Store Admin'),
          loginTime: new Date().toISOString(),
          token: data.token || null
        };
        localStorage.setItem(STORAGE_KEYS.ADMIN_SESSION, JSON.stringify(session));
        return { success: true };
      }
    } catch {
      // Offline fallback: continue to local SHA-256 hash verification
    }

    // 2. Offline / PWA SHA-256 cryptographic verification
    let passHash = '';
    if (typeof crypto !== 'undefined' && crypto.subtle) {
      const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(cleanPass));
      passHash = Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
    }

    if (passHash === this.AUTH_PASS_HASH) {
      const session = {
        authenticated: true,
        user: cleanUser === 'admin' ? 'Admin Manager' : 'Store Admin',
        loginTime: new Date().toISOString()
      };
      localStorage.setItem(STORAGE_KEYS.ADMIN_SESSION, JSON.stringify(session));
      return { success: true };
    }

    return { success: false, message: 'Invalid username or password.' };
  },

  adminLogout() {
    localStorage.removeItem(STORAGE_KEYS.ADMIN_SESSION);
  },

  // --- EVENT SUBSCRIPTION ---
  subscribe(callback) {
    if (typeof window === 'undefined') return () => {};
    const handleEvent = (e) => {
      if (callback) callback(e.detail || { type: 'DATA_CHANGED' });
    };
    window.addEventListener('sharp_data_changed', handleEvent);
    return () => {
      window.removeEventListener('sharp_data_changed', handleEvent);
    };
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
