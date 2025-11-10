import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import 'dotenv/config';
import statsRoutes from './routes/status.js';

// Import routes with debug
console.log('🔧 Importing routes...');
import authRoutes from './routes/auth.js';
console.log('✅ authRoutes imported:', typeof authRoutes);
import userRoutes from './routes/users.js';
console.log('✅ userRoutes imported:', typeof userRoutes);
import categoryRoutes from './routes/categories.js';
console.log('✅ categoryRoutes imported:', typeof categoryRoutes);
import itemRoutes from './routes/items.js';
console.log('✅ itemRoutes imported:', typeof itemRoutes);
import saleRoutes from './routes/sales.js';
console.log('✅ saleRoutes imported:', typeof saleRoutes);
import reportRoutes from './routes/reports.js';
console.log('✅ reportRoutes imported:', typeof reportRoutes);

// Import error middleware with debug
console.log('🔧 Importing error middleware...');
import errorHandler from './middleware/errorMiddleware.js';
console.log('✅ errorHandler imported:', typeof errorHandler);

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/sales', saleRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/stats', statsRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'API is working!' });
});

// Error handling middleware
console.log('🔧 Applying error handler...');
app.use(errorHandler);

// Connect to MongoDB and start server
mongoose.connect(process.env.MONGODB_URI)
.then(() => {
  console.log('✅ MongoDB Connected');
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
})
.catch(err => console.log('❌ MongoDB Connection Error:', err));