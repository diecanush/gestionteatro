import express from 'express';
import cors from 'cors';
import sequelize from './config/database.js';
import './models/index.js'; // Import associations
import workshopRoutes from './routes/workshops.js';
import showRoutes from './routes/shows.js';
import snackbarRoutes from './routes/snackbar.js';
import kitchenRoutes from './routes/kitchen.js';
import salesRoutes from './routes/sales.js'; // New import
import comboRoutes from './routes/combos.js';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/workshops', workshopRoutes);
app.use('/api/shows', showRoutes);
app.use('/api/snackbar', snackbarRoutes);
app.use('/api/kitchen', kitchenRoutes);
app.use('/api/sales', salesRoutes); // New route
app.use('/api/combos', comboRoutes);

const PORT = process.env.PORT || 8080;

sequelize.sync({ alter: true }).then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
  });
});
