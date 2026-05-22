import { Router } from 'express';
import { getTasks, createTask, getTaskById, updateTask, deleteTask } from '../controllers/task.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// Aplicamos el middleware a todas las rutas de tareas de este archivo
router.use(authMiddleware);

router.get('/', getTasks);          // GET /api/tasks
router.post('/', createTask);        // POST /api/tasks
router.get('/:id', getTaskById);    // GET /api/tasks/:id
router.put('/:id', updateTask);      // PUT /api/tasks/:id
router.delete('/:id', deleteTask);   // DELETE /api/tasks/:id

export default router;