const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');
const Product = require('./models/Product');
const dns = require('dns');

dns.setServers(['8.8.8.8']); // Force Google DNS for Atlas connectivity
dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const restore = async () => {
    try {
        console.log('--- RECOVERY STARTED ---');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // 1. Fetch all existing products to avoid duplicates
        const existingProducts = await Product.find({});
        const existingUrls = new Set(existingProducts.map(p => p.image));

        // 2. Fetch all resources from Cloudinary folder 'dhaga_products'
        console.log('Fetching images from Cloudinary...');
        const result = await cloudinary.api.resources({
            type: 'upload',
            prefix: 'dhaga_products/',
            max_results: 500
        });

        console.log(`Found ${result.resources.length} images in Cloudinary.`);

        let restoredCount = 0;
        for (const resource of result.resources) {
            const url = resource.secure_url;

            if (!existingUrls.has(url)) {
                // Create a draft product
                const name = resource.public_id
                    .split('/')
                    .pop()
                    .replace(/[-_]/g, ' ')
                    .replace(/\d+/g, '') // Remove numbers
                    .trim() || 'Restored Piece';

                await Product.create({
                    name: name.charAt(0).toUpperCase() + name.slice(1),
                    price: 0,
                    category: 'dresses', // Default category
                    fabric: 'Silk',
                    description: 'Restored from cloud backup.',
                    image: url,
                    tag: 'Restored'
                });
                restoredCount++;
            }
        }

        console.log(`--- RECOVERY COMPLETE ---`);
        console.log(`Restored ${restoredCount} products.`);
        console.log('You can now edit their names and prices in the Admin panel.');
        process.exit();
    } catch (error) {
        console.error('Recovery failed:', error);
        process.exit(1);
    }
};

restore();
