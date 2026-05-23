import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';
import { logger } from './middleware/logger.js';
import { prisma } from './config/db.js';
import bcrypt from 'bcryptjs';

import authRoutes from './modules/auth/auth.routes.js';
import productRoutes from './modules/products/products.routes.js';
import artisanRoutes from './modules/artisans/artisans.routes.js';
import orderRoutes from './modules/orders/orders.routes.js';
import reviewRoutes from './modules/reviews/reviews.routes.js';
import adminRoutes from './modules/admin/admin.routes.js';

const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.get('/', (_req, res) => {
  res.json({ app: 'Binaa API', version: '2.0.0', status: 'running' });
});

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/artisans', artisanRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/commandes', orderRoutes); // Alias for mobile compatibility
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);

app.use(errorHandler);

async function seedAdmin() {
  const adminEmail = 'admin@binaa.dz';
  try {
    const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('Algeria123456789', 12);
      await prisma.user.create({
        data: {
          email: adminEmail,
          password: hashedPassword,
          role: 'ADMIN',
          fullName: 'Administrateur',
          phone: '0000000000',
          commune: 'Oran', // Oran is a valid commune
        }
      });
      logger.info('System', 'Admin user seeded');
    }
  } catch (error) {
    logger.error('System', 'Failed to seed admin user', error);
  }
}

seedAdmin().then(() => {
  app.listen(env.PORT, '0.0.0.0', () => {
    logger.info('Server', `Listening on port ${env.PORT}`);
  });
});
