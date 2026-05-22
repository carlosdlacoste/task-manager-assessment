import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes';
import taskRoutes from './routes/task.routes';

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares globales básicos
app.use(cors());
app.use(express.json());

// Registro de las rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

// Ruta de prueba rápida para verificar que el servidor responda
app.get('/ping', (req, res) => {
  res.json({ message: 'pong' });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor backend corriendo en http://localhost:${PORT}`);
});