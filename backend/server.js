import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import connectDB from './config/db.js';
import customerRoutes from './routes/customerRoutes.js';
import productRoutes from './routes/productRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/customers', customerRoutes);
app.use('/api/products', productRoutes);
app.use('/api/carts', cartRoutes);
app.use('/api/orders', orderRoutes);


app.get('/', (req, res) => res.status(200).json({ message: 'GearUp API running' }));


app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5001;

// When running tests we only want to export the app without connecting to DB or starting the listener.
if (process.env.NODE_ENV !== 'test') {

	(async () => {
		try {
			await connectDB();
			app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
		} catch (err) {
			console.error('Failed to start server:', err);
			process.exit(1);
		}
	})();
}

export default app;
