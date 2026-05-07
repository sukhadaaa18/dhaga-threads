const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');
const dns = require('dns');

dns.setServers(['8.8.8.8']); // Force Google DNS
dotenv.config();

const products = [
    {
        name: "Gulaab Blush Lehenga",
        price: 18900,
        originalPrice: 24900,
        image: "https://images.unsplash.com/photo-1583391733956-6c78276477e2?q=80&w=1920",
        category: "lehengas",
        description: "An heirloom blush lehenga draped in delicate zari, hand-embroidered over weeks by master artisans of Lucknow.",
        fabric: "Pure raw silk · Zardozi work",
        tag: "Festive",
        isNewProduct: true
    },
    {
        name: "Saanjh Sage A-line Kurti",
        price: 9450,
        originalPrice: 12500,
        image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1920",
        category: "a-line-kurtis-with-sleeves",
        description: "A flowing sage A-line with fine silver chikankari sleeves — the quiet drama of an evening in bloom.",
        fabric: "Georgette · Silver chikankari",
        tag: "Bestseller"
    },
    {
        name: "Noor Ivory Gharara Set",
        price: 32500,
        originalPrice: 39000,
        image: "https://images.unsplash.com/photo-1594235412402-bbaa9c488730?q=80&w=1920",
        category: "gharara",
        description: "Ivory and antique gold zardozi gharara — the kind of piece that becomes a memory the moment it's worn.",
        fabric: "Silk dupion · Pearl & zardozi",
        tag: "Couture",
        isNewProduct: true
    },
    {
        name: "Lavender Bloom Lehenga",
        price: 22000,
        image: "https://images.unsplash.com/photo-1594235412402-bbaa9c488730?q=80&w=1920",
        category: "lehengas",
        description: "A breathtaking lavender lehenga with delicate embroidery.",
        fabric: "Silk georgette",
        tag: "New",
        isNewProduct: true
    },
    {
        name: "Mint Silk A-line",
        price: 8500,
        originalPrice: 11000,
        image: "https://images.unsplash.com/photo-1583391733956-6c78276477e2?q=80&w=1920",
        category: "a-line-kurtis",
        description: "A refreshing mint silk A-line kurti for sophisticated comfort.",
        fabric: "Banarasi Silk",
        tag: "Sale"
    }
];

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        // SAFETY: Deletion is disabled to protect manual uploads
        // await Product.deleteMany({}); 
        console.log('Seeding products... (Preserving existing data)');
        await Product.insertMany(products);
        console.log('Database Seeded Successfully');
        process.exit();
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

seedDB();
