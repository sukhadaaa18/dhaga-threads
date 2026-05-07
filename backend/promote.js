const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const dns = require('dns');

dns.setServers(['8.8.8.8']); // Force Google DNS for Atlas connectivity

dotenv.config();

const promoteUser = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const email = 'sukhadadone12@gmail.com';
        
        const user = await User.findOneAndUpdate(
            { email: email },
            { role: 'admin' },
            { new: true }
        );

        if (user) {
            console.log(`Success! ${email} is now an ADMIN.`);
        } else {
            console.log(`User ${email} not found. Please sign up on the website first!`);
        }
        
        process.exit();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

promoteUser();
