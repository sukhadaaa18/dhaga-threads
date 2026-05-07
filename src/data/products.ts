import api from '@/lib/api';
import festive1 from "@/assets/product-festive-1.jpg";
import festive2 from "@/assets/product-festive-2.jpg";
import festive3 from "@/assets/product-festive-3.jpg";
import daily1 from "@/assets/product-daily-1.jpg";
import daily2 from "@/assets/product-daily-2.jpg";
import daily3 from "@/assets/product-daily-3.jpg";
import newArr1 from "@/assets/product-new-1.jpg";
import newArr2 from "@/assets/product-new-2.jpg";
import newArr3 from "@/assets/product-new-3.jpg";
import catAline from "@/assets/cat-dresses.png";
import catSleeveless from "@/assets/cat-sleeveless.jpg";
import catAlineSleeves from "@/assets/cat-aline-sleeves.jpg";
import catGharara from "@/assets/cat-gharara.jpg";
import catKurtis from "@/assets/cat-kurtis.jpg";
import catLehengas from "@/assets/cat-lehengas.jpg";

export type Category =
  | "dresses"
  | "sleeveless-a-line-kurtis"
  | "a-line-kurtis-with-sleeves"
  | "gharara"
  | "lehengas";

export const CATEGORY_META: Record<Category, { label: string; path: string; eyebrow: string; subtitle: string; image: string }> = {
  "dresses": {
    label: "Dresses",
    path: "/dresses",
    eyebrow: "The Dress Edit",
    subtitle: "Flowing silhouettes that grace every step — soft pleats, refined cuts, timeless ease.",
    image: catAline,
  },
  "sleeveless-a-line-kurtis": {
    label: "Sleeveless A-line Kurtis",
    path: "/sleeveless-a-line-kurtis",
    eyebrow: "Bare Shoulder Grace",
    subtitle: "Effortless sleeveless A-lines — quiet elegance for warm afternoons and softer evenings.",
    image: catSleeveless,
  },
  "a-line-kurtis-with-sleeves": {
    label: "A-line Kurtis with Sleeves",
    path: "/a-line-kurtis-with-sleeves",
    eyebrow: "Classic Sleeves",
    subtitle: "A-line silhouettes with delicate sleeves — refined, modest, eternally graceful.",
    image: catAlineSleeves,
  },
  gharara: {
    label: "Gharara",
    path: "/gharara",
    eyebrow: "Heritage Drape",
    subtitle: "Hand-crafted ghararas — wide flares, fine zardozi, woven for celebration.",
    image: catGharara,
  },
  lehengas: {
    label: "Lehengas",
    path: "/lehengas",
    eyebrow: "The Lehenga Atelier",
    subtitle: "Heirloom lehengas — hand-embroidered over weeks for the most cherished occasions.",
    image: catLehengas,
  },
};

export const CATEGORIES: Category[] = [
  "dresses",
  "sleeveless-a-line-kurtis",
  "a-line-kurtis-with-sleeves",
  "gharara",
  "lehengas",
];

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: Category;
  description: string;
  fabric: string;
  tag?: string;
  isNewProduct?: boolean;
  isOutOfStock?: boolean;
  isSale?: boolean;
  isFestive?: boolean;
  outOfStockSizes?: string[];
  stock?: number;
  reelVideo?: string;
}

export const products: Product[] = [
  {
    id: "gulaab",
    name: "Gulaab Blush Lehenga",
    price: 18900,
    originalPrice: 24900,
    image: festive1,
    category: "lehengas",
    description:
      "An heirloom blush lehenga draped in delicate zari, hand-embroidered over weeks by master artisans of Lucknow.",
    fabric: "Pure raw silk · Zardozi work",
    tag: "Festive",
  },
  {
    id: "saanjh",
    name: "Saanjh Sage A-line Kurti",
    price: 9450,
    image: festive2,
    category: "a-line-kurtis-with-sleeves",
    description:
      "A flowing sage A-line with fine silver chikankari sleeves — the quiet drama of an evening in bloom.",
    fabric: "Georgette · Silver chikankari",
    tag: "Bestseller",
  },
  {
    id: "noor",
    name: "Noor Ivory Gharara Set",
    price: 32500,
    originalPrice: 39000,
    image: festive3,
    category: "gharara",
    description:
      "Ivory and antique gold zardozi gharara — the kind of piece that becomes a memory the moment it's worn.",
    fabric: "Silk dupion · Pearl & zardozi",
    tag: "Couture",
  },
  {
    id: "rang",
    name: "Rang Peach Block Print Kurti",
    price: 2890,
    image: daily1,
    category: "dresses",
    description:
      "Soft cotton kurti with hand block-printed florals — easy elegance for every day.",
    fabric: "Hand-block printed cotton",
  },
  {
    id: "sham",
    name: "Sham Lavender A-line",
    price: 4150,
    image: daily2,
    category: "dresses",
    description:
      "A breezy lavender A-line kurti — minimal, modern, deeply Indian.",
    fabric: "Cotton viscose blend",
  },
  {
    id: "neel",
    name: "Neel Powder Blue Sleeveless A-line",
    price: 5390,
    originalPrice: 6990,
    image: daily3,
    category: "sleeveless-a-line-kurtis",
    description:
      "Fine Lucknowi chikankari on powder blue sleeveless A-line — a piece that feels like morning light.",
    fabric: "Mulmul cotton · Hand chikankari",
    tag: "Sale",
  },
  {
    id: "patta",
    name: "Patta Mint A-line Kurti",
    price: 14500,
    image: newArr1,
    category: "dresses",
    description:
      "A whisper-soft mint A-line with antique gold border, woven on traditional handlooms.",
    fabric: "Pure Banarasi silk",
    tag: "New",
    isNew: true,
  },
  {
    id: "rosa",
    name: "Rosa Dusty Rose Gharara",
    price: 11200,
    image: newArr2,
    category: "gharara",
    description:
      "A dusty rose gharara with delicate gota patti — celebration in every fold.",
    fabric: "Georgette · Gota patti",
    tag: "New",
    isNew: true,
  },
  {
    id: "kaira",
    name: "Kaira Champagne Lehenga",
    price: 21800,
    originalPrice: 27500,
    image: newArr3,
    category: "lehengas",
    description:
      "A champagne lehenga laced with pearls — for the softest spotlight in the room.",
    fabric: "Net · Pearl embellishment",
    tag: "New",
    isNew: true,
  },
];

export const getByCategory = (cat: Category) =>
  products.filter((p) => p.category === cat);

export const getNewArrivals = () => products.filter((p) => p.isNew);

export const getSale = () => products.filter((p) => p.originalPrice);

export const getProduct = (id: string) => products.find((p) => p.id === id);

export const formatINR = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);

export const formatDate = (date: string | Date) => {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";
  
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d);
};

export const fetchProducts = async (): Promise<Product[]> => {
  try {
    const { data } = await api.get('/products');
    return data;
  } catch (error) {
    console.error('Error fetching products:', error);
    return products; // Fallback to static data
  }
};
