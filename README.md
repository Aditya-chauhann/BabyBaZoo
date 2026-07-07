# 🍼 BabyBaZoo

<div align="center">
  <p>A full-stack premium e-commerce platform built for high-performance baby product dropshipping.</p>
</div>

---

## ✨ Features

- **Modern & Premium UI:** Built with Next.js and Tailwind CSS featuring a beautiful glassmorphism design, smooth micro-interactions (Framer Motion), and responsive layouts.
- **Automated Dropshipping:** Fully integrated with the **CJ Dropshipping API** for real-time product fetching, automated order syncing, and seamless fulfillment.
- **Complete Checkout Flow:** Secure cart management with dual payment options: Cash on Delivery (COD) and Razorpay integration.
- **Robust Authentication:** Secure JWT-based user authentication, including email-based OTPs for password resets and account deletion.
- **User Dashboard:** Comprehensive user profiles to manage saved addresses, view order history, and track wishlist items.
- **High Performance:** Backend API built with Node.js/Express, utilizing Redis caching to serve products blazingly fast.

## 🛠️ Technology Stack

### Frontend
- **Framework:** Next.js 15 (App Router)
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **Icons:** Lucide React
- **Language:** TypeScript

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB (with Mongoose)
- **Caching:** Redis
- **Authentication:** JSON Web Tokens (JWT) & Nodemailer for OTPs
- **Payment Gateway:** Razorpay
- **Dropshipping API:** CJ Dropshipping

## 🚀 Getting Started

### Prerequisites
Make sure you have the following installed:
- [Node.js](https://nodejs.org/) (v18+)
- [MongoDB](https://www.mongodb.com/)
- [Redis](https://redis.io/)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Aditya-chauhann/BabyBaZoo.git
   cd BabyBaZoo
   ```

2. **Setup the Backend:**
   ```bash
   cd backend
   npm install
   ```
   Create a `.env` file in the `backend` directory with the following variables:
   ```env
   PORT=3001
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   SMTP_HOST=your_smtp_host
   SMTP_PORT=587
   SMTP_USER=your_smtp_email
   SMTP_PASS=your_smtp_password
   CJ_API_KEY=your_cj_dropshipping_api_key
   CJ_EMAIL=your_cj_email
   CJ_PASSWORD=your_cj_password
   RAZORPAY_KEY_ID=your_razorpay_key
   RAZORPAY_KEY_SECRET=your_razorpay_secret
   REDIS_URL=redis://localhost:6379
   ```
   Start the backend development server:
   ```bash
   npm run dev
   ```

3. **Setup the Frontend:**
   ```bash
   cd ../frontend
   npm install
   ```
   Create a `.env.local` file in the `frontend` directory:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3001/api
   ```
   Start the frontend development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result!

## 📦 API Integrations

- **CJ Dropshipping:** Automatically pulls products from specific baby categories (toys, clothing, care). Dynamically parses CJ's complex data structures (like stringified image arrays) to seamlessly display on the frontend. Automatically submits created orders directly to CJ's platform using verified variant IDs (`vid`).
- **Razorpay:** Generates secure orders via the backend and authenticates signatures before confirming payments.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the issues page.

## 📝 License

This project is licensed under the MIT License.
