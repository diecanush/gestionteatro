import express from 'express';
import cors from 'cors';
import path from 'path';
import sequelize from './config/database.js';
import './models/index.js'; // Import associations

import workshopRoutes from './routes/workshops.js';
import showRoutes from './routes/shows.js';
import snackbarRoutes from './routes/snackbar.js';
import kitchenRoutes from './routes/kitchen.js';
import salesRoutes from './routes/sales.js';
import comboRoutes from './routes/combos.js';
import workshopAttendanceRoutes from './routes/workshopAttendance.js';
import workshopPaymentsRoutes from './routes/workshopPayments.js';

const app = express();

app.use(cors());
app.use(express.json());

// API routes
app.use('/api/workshops', workshopRoutes);
app.use('/api/workshops/:workshopId/attendance', workshopAttendanceRoutes);
app.use('/api/workshops/:workshopId/payments', workshopPaymentsRoutes);
app.use('/api/shows', showRoutes);
app.use('/api/snackbar', snackbarRoutes);
app.use('/api/kitchen', kitchenRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/combos', comboRoutes);

// Serve static files from the React app build
const __dirname = path.dirname(new URL(import.meta.url).pathname);
app.use(express.static(path.join(__dirname, '../dist')));

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

const PORT = process.env.PORT || 8080;

sequelize.sync({ alter: true }).then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
  });
});
