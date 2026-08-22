# 🏅 Aarambh Athletics Hub - Sports Registration & Payment Management Platform

A full-stack application for managing sports registrations, user authentication, and payment processing.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Deployment](#deployment)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
- [Database](#database)

---

## ✨ Features

### 🎯 Core Features
- **User Authentication**: Secure login/registration with JWT
- **User Roles**: Support for Admin and Student users
- **Payment Integration**: Integrated payment processing system
- **Athlete Management**: Register and manage athletes
- **Dashboard**: Admin and Student dashboards with statistics
- **Payment Tracking**: View payment status and history

### 🛡️ Security Features
- JWT-based authentication
- Password hashing with bcryptjs
- CORS protection
- Environment-based configuration

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19.2 with Vite
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **Routing**: React Router v7
- **Icons**: Lucide React, React Icons
- **Animations**: Framer Motion
- **Notifications**: React Toastify

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (jsonwebtoken)
- **Password Security**: bcryptjs
- **File Upload**: Multer
- **Task Scheduling**: node-cron
- **CORS**: Express CORS

### Database
- **MongoDB**: NoSQL database for storing user and payment data

---

## 📁 Project Structure

```
aarambh-athletics-hub/
├── backend/
│   ├── config/
│   │   └── db.js          # Database connection
│   ├── controllers/       # Request handlers
│   │   ├── athleteController.js
│   │   ├── authController.js
│   │   ├── paymentController.js
│   ├── middleware/
│   │   └── authMiddleware.js     # JWT verification
│   ├── models/           # MongoDB schemas
│   │   ├── User.js
│   │   ├── Payment.js
│   ├── routes/          # API routes
│   │   ├── athleteRoutes.js
│   │   ├── authRoutes.js
│   │   ├── paymentRoutes.js
│   ├── server.js        # Express app setup
│   ├── seed.js          # Database seeding
│   ├── package.json
│   └── .env             # Environment variables
│
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   │   ├── Navbar.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── PaymentTable.jsx
│   │   │   ├── StatusBadge.jsx
│   │   │   └── ...
│   │   ├── pages/          # Page components
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── StudentDashboard.jsx
│   │   │   ├── AdminPaymentPage.jsx
│   │   │   ├── StudentPaymentPage.jsx
│   │   │   └── ...
│   │   ├── services/
│   │   │   └── api.js       # Axios instance
│   │   ├── App.jsx          # Main app component
│   │   └── main.jsx         # React entry point
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── .env                 # Environment variables
│
├── QUICK_DEPLOYMENT.md      # Step-by-step deployment guide
├── DEPLOYMENT_GUIDE.md      # Detailed deployment info
└── README.md                # This file
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- MongoDB (local or MongoDB Atlas)
- Git

### Local Development

#### 1. Clone the Repository
```bash
git clone https://github.com/your-username/aarambh-athletics-hub.git
cd aarambh-athletics-hub
```

#### 2. Backend Setup
```bash
cd backend
npm install

# Create .env file
cp .env.example .env

# Edit .env with your configuration
# Add MongoDB URI, JWT secret, etc.

# Start development server
npm run dev
```

The backend will run on `http://localhost:8000`

#### 3. Frontend Setup
```bash
cd frontend
npm install

# Create .env file
cp .env.example .env

# Start development server
npm run dev
```

The frontend will run on `http://localhost:5173`

#### 4. Seed Database (Optional)
```bash
cd backend
npm run seed
```

This will populate the database with sample data.

---

## 🌐 Deployment

### 📤 Deploy to GitHub

1. **Create GitHub Repository**
   - Go to https://github.com/new
   - Create a public repository named `aarambh-athletics-hub`

2. **Push Code**
   ```bash
   cd c:\Users\arpit\Desktop\aarambh-athletics-hub
   git remote add origin https://github.com/your-username/aarambh-athletics-hub.git
   git branch -M main
   git push -u origin main
   ```

### 🚀 Deploy Backend (Render)

1. Visit https://render.com
2. Create new Web Service
3. Connect GitHub repository
4. Configure:
   - Name: `aarambh-athletics-hub-backend`
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `npm start`
5. Add environment variables
6. Deploy!

### 🎨 Deploy Frontend (Netlify)

1. Visit https://netlify.com
2. New site from Git → Select repository
3. Configure:
   - Base: `frontend`
   - Build: `npm run build`
   - Publish: `frontend/dist`
4. Add environment variables
5. Deploy!

**👉 See [QUICK_DEPLOYMENT.md](./QUICK_DEPLOYMENT.md) for detailed step-by-step instructions**

---

## 🔐 Environment Variables

### Backend (.env)
```
NODE_ENV=development
PORT=8000
MONGODB_URI=mongodb://localhost:27017/aarambh_athletics_hub
JWT_SECRET=your_secret_key_here
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:8000/api
```

---

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (requires token)

### Athletes
- `GET /api/athletes` - Get all athletes
- `POST /api/athletes` - Create athlete
- `GET /api/athletes/:id` - Get athlete by ID
- `PUT /api/athletes/:id` - Update athlete
- `DELETE /api/athletes/:id` - Delete athlete

### Payments
- `GET /api/payments` - Get all payments
- `POST /api/payments` - Create payment
- `GET /api/payments/:id` - Get payment by ID
- `PUT /api/payments/:id` - Update payment status
- `DELETE /api/payments/:id` - Delete payment

---

## 💾 Database

### MongoDB Collections

#### Users
```javascript
{
  _id: ObjectId,
  email: String,
  password: String (hashed),
  name: String,
  role: "student" | "admin",
  createdAt: Date
}
```

#### Payments
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  amount: Number,
  status: "pending" | "completed" | "failed",
  paymentMethod: String,
  transactionId: String,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 📝 Scripts

### Backend
- `npm start` - Start production server
- `npm run dev` - Start development with nodemon
- `npm run seed` - Seed database with sample data

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the ISC License.

---

## 📞 Support

For issues and questions:
1. Check [QUICK_DEPLOYMENT.md](./QUICK_DEPLOYMENT.md) for deployment help
2. Review [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed info
3. Check application logs on Render/Netlify dashboards

---

## 🎉 Live Demo

Once deployed:
- **Frontend**: https://aarambh-athletics-hub-*.netlify.app
- **Backend API**: https://aarambh-athletics-hub-backend.onrender.com
- **GitHub**: https://github.com/your-username/aarambh-athletics-hub

---

## 📚 Useful Resources

- [Express.js Documentation](https://expressjs.com)
- [MongoDB Documentation](https://docs.mongodb.com)
- [React Documentation](https://react.dev)
- [Vite Documentation](https://vite.dev)
- [Tailwind CSS](https://tailwindcss.com)

---

**Built with ❤️ by Arpit**
