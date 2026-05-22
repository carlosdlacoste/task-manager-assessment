import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import prisma from '../db';
import { z } from 'zod';
import { Status } from '@prisma/client';

// Esquema de validación con Zod para crear/editar tareas
const taskSchema = z.object({
    title: z.string().min(1, 'El título es obligatorio'),
    description: z.string(),
    status: z.nativeEnum(Status).optional(),
    dueDate: z.string().datetime('Fecha inválida (debe ser ISO string)'),
});

// 1. OBTENER TODAS LAS TAREAS (Con filtro y paginación)
export const getTasks = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const userId = req.userId!;
        
        // Paginación de forma segura asegurando que sean strings limpios antes del parseInt
        const pageQuery = typeof req.query.page === 'string' ? req.query.page : '1';
        const limitQuery = typeof req.query.limit === 'string' ? req.query.limit : '10';
        
        const page = parseInt(pageQuery) || 1;
        const limit = parseInt(limitQuery) || 10;
        const skip = (page - 1) * limit;

        // Filtro por estado validando estrictamente que sea un string puro
        const statusQuery = typeof req.query.status === 'string' ? req.query.status : undefined;
        let statusFilter: Status | undefined;
        
        if (statusQuery) {
            const upperStatus = statusQuery.toUpperCase();
            if (upperStatus === 'PENDING' || upperStatus === 'DONE') {
                statusFilter = upperStatus as Status;
            }
        }

        // Construimos el objeto where obligando a que pertenezcan al usuario
        const whereClause: any = { userId };
        if (statusFilter) {
            whereClause.status = statusFilter;
        }

        // Ejecutamos en paralelo para ahorrar milisegundos
        const [tasks, totalTasks] = await Promise.all([
            prisma.task.findMany({
                where: whereClause,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            prisma.task.count({ where: whereClause }),
        ]);

        res.status(200).json({
            tasks,
            pagination: {
                page,
                limit,
                totalTasks,
                totalPages: Math.ceil(totalTasks / limit),
            },
        });
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener las tareas' });
    }
};

// 2. CREAR TAREA
export const createTask = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const userId = req.userId!;
        const parsed = taskSchema.parse(req.body);

        const newTask = await prisma.task.create({
            data: {
                title: parsed.title,
                description: parsed.description,
                status: parsed.status || Status.PENDING,
                dueDate: new Date(parsed.dueDate),
                userId,
            },
        });

        res.status(201).json(newTask);
    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ error: error.issues });
            return;
        }
        res.status(500).json({ error: 'Error al crear la tarea' });
    }
};

// 3. OBTENER UNA TAREA POR ID
export const getTaskById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const userId = req.userId!;
        // Forzamos a que el parámetro id sea tratado como string para que Prisma no llore
        const id = req.params.id as string;

        const task = await prisma.task.findFirst({
            where: { id, userId }, 
        });

        if (!task) {
            res.status(404).json({ error: 'Tarea no encontrada o no autorizada' });
            return;
        }

        res.status(200).json(task);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener la tarea' });
    }
};

// 4. ACTUALIZAR TAREA
export const updateTask = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const userId = req.userId!;
        const id = req.params.id as string;
        const parsed = taskSchema.partial().parse(req.body); 

        // Verificamos primero si existe y es del usuario
        const existingTask = await prisma.task.findFirst({ where: { id, userId } });
        if (!existingTask) {
            res.status(404).json({ error: 'Tarea no encontrada o no autorizada' });
            return;
        }

        const updatedTask = await prisma.task.update({
            where: { id },
            data: {
                ...parsed,
                dueDate: parsed.dueDate ? new Date(parsed.dueDate) : undefined,
            },
        });

        res.status(200).json(updatedTask);
    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ error: error.issues });
            return;
        }
        res.status(500).json({ error: 'Error al actualizar la tarea' });
    }
};

// 5. ELIMINAR TAREA
export const deleteTask = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const userId = req.userId!;
        const id = req.params.id as string;

        const existingTask = await prisma.task.findFirst({ where: { id, userId } });
        if (!existingTask) {
            res.status(404).json({ error: 'Tarea no encontrada o no autorizada' });
            return;
        }

        await prisma.task.delete({ where: { id } });

        res.status(200).json({ message: 'Tarea eliminada exitosamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar la tarea' });
    }
};