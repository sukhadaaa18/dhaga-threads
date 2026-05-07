const axios = require('axios');

async function checkBackend() {
    try {
        console.log('Checking Backend status...');
        const res = await axios.get('http://localhost:5000/');
        console.log('Status:', res.status);
        console.log('Response:', res.data);

        console.log('\nChecking API products...');
        const productsRes = await axios.get('http://localhost:5000/api/products');
        console.log('Status:', productsRes.status);
        console.log('Count:', productsRes.data.length);
        
        console.log('\nBackend seems OK.');
    } catch (error) {
        console.error('BACKEND ERROR:', error.message);
        if (error.response) {
            console.error('Data:', error.response.data);
            console.error('Status:', error.response.status);
        }
    }
}

checkBackend();
