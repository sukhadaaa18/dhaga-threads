const axios = require('axios');
const id = '69ef36e4d17fd6b78fe10ea3';

async function checkProduct() {
    try {
        console.log(`Checking Product ID: ${id}`);
        const res = await axios.get(`http://localhost:5000/api/products/${id}`);
        console.log('Status:', res.status);
        console.log('Product:', res.data.name);

        console.log(`\nChecking Reservations for ID: ${id}`);
        const res2 = await axios.get(`http://localhost:5000/api/reservations/product/${id}`);
        console.log('Status:', res2.status);
        console.log('Reservations Count:', res2.data.length);
        
        console.log('\nTest completed successfully.');
    } catch (error) {
        console.error('ERROR:', error.message);
        if (error.response) {
            console.error('Data:', error.response.data);
            console.error('Status:', error.response.status);
        }
    }
}

checkProduct();
