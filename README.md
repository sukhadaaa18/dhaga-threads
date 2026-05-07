# 🧵 Dhaga — Threads of Elegance
**The Ultimate Premium Boutique E-commerce Platform**

Dhaga is a high-end, full-stack e-commerce application designed for luxury ethnic wear. It features a sophisticated store-visit reservation system, automated inventory management, and a premium editorial aesthetic.

---

## 🚀 Quick Start (New Device Setup)

If you have moved this project to a new device, follow these steps:

### 1. Prerequisites
Ensure you have **Node.js** installed on your system.

### 2. Backend Setup
1. Navigate to the `backend` folder.
2. Install dependencies:
   ```bash
   npm install
   ```
3. **CRITICAL**: Create a `.env` file in the `backend` folder and paste your secret keys:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_atlas_uri
   JWT_SECRET=your_secret_key
   CLOUDINARY_CLOUD_NAME=dhagaa
   CLOUDINARY_API_KEY=136713916598179
   CLOUDINARY_API_SECRET=vwqEWzZumd__THjU_vaMYTOdOxE
   RAZORPAY_KEY_ID=rzp_test_ShbSUZm1UTFndC
   RAZORPAY_KEY_SECRET=CUO3rzrobjX2SEJamZ8ARnB4
   ```
4. Start the engine:
   ```bash
   node server.js
   ```

### 3. Frontend Setup
1. Navigate to the root directory (where `package.json` is).
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the boutique:
   ```bash
   npm run dev
   ```

---

## 💎 Premium Features

- **Store Visit Reservations**: A unique 8-day booking system for physical boutique visits.
- **Smart Analytics**: Real-time business health tracking (Revenue, Average Order, Conversion).
- **Spreadsheet Mode**: Edit product names and prices directly in the Admin list.
- **Quick Multi-Upload**: Select many photos at once to populate your collection.
- **Cloud Wishlist**: User hearts are synced to their account and accessible on any device.
- **Luxury UX**: Size guides, "How it Works" sections, and premium glassmorphism UI.

---

## 🛠️ Tech Stack
- **Frontend**: React, Vite, Tailwind CSS, Framer Motion, Zustand.
- **Backend**: Node.js, Express, MongoDB Atlas.
- **Cloud Services**: Cloudinary (Images), Razorpay (Payments).

---

## 🔒 Security
- **Admin Role**: Only authorized accounts (like `sukhadadone12@gmail.com`) can access the Atelier.
- **JWT Protection**: All data exchanges are encrypted and token-protected.
- **Privacy First**: Wishlists and cart data are cleared upon logout for customer privacy.

---
*Created with ❤️ for Dhaga Boutique.*
