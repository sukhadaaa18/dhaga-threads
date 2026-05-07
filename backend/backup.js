const mongoose = require('mongoose');
const fs = require('fs');
const dotenv = require('dotenv');
const Product = require('./models/Product');
const dns = require('dns');

dns.setServers(['8.8.8.8']); // Force Google DNS for Atlas connectivity
dotenv.config();

const backup = async () => {
    try {
        console.log('Connecting to database for backup...');
        await mongoose.connect(process.env.MONGODB_URI);
        
        const products = await Product.find({});
        const backupData = JSON.stringify(products, null, 2);
        
        const filename = `products_backup_${new Date().toISOString().split('T')[0]}.json`;
        fs.writeFileSync(filename, backupData);
        
        console.log(`--- BACKUP SUCCESSFUL ---`);
        console.log(`Saved ${products.length} products to ${filename}`);
        process.exit();
    } catch (error) {
        console.error('Backup failed:', error);
        process.exit(1);
    }
};

backup();
