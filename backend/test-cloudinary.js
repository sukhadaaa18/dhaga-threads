const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');
dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

async function test() {
    try {
        const result = await cloudinary.api.ping();
        console.log('Cloudinary Ping SUCCESS:', result);
    } catch (error) {
        console.error('Cloudinary Connection FAILED:', error);
    }
}
test();
