import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jwt-simple';
import prisma from '../db';
import { z } from 'zod';

const SECRET_KEY = process.env.JWT_SECRET || 'super-secret-key-123';

// Esquemas de validación con Zod
const registerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    name: z.string().min(2),
});

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string(),
});

export const register = async (req: Request, res: Response): Promise<void> => {
    try {
        const parsed = registerSchema.parse(req.body);

        const existingUser = await prisma.user.findUnique({ where: { email: parsed.email } });
        if (existingUser) {
        res.status(400).json({ error: 'El correo electrónico ya está registrado' });
        return;
        }

        const hashedPassword = await bcrypt.hash(parsed.password, 10);

        const user = await prisma.user.create({
        data: {
            email: parsed.email,
            password: hashedPassword,
            name: parsed.name,
        },
        });

        res.status(201).json({ message: 'Usuario registrado exitosamente', userId: user.id });
    } catch (error) {
        if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.issues });
        return;
        }
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const parsed = loginSchema.parse(req.body);

        const user = await prisma.user.findUnique({ where: { email: parsed.email } });
        if (!user) {
        res.status(401).json({ error: 'Credenciales inválidas' });
        return;
        }

        const isPasswordValid = await bcrypt.compare(parsed.password, user.password);
        if (!isPasswordValid) {
        res.status(401).json({ error: 'Credenciales inválidas' });
        return;
        }

        // Generamos el token JWT guardando el ID del usuario
        const payload = {
        sub: user.id,
        email: user.email,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24), // Expira en 24 horas
        };

        const token = jwt.encode(payload, SECRET_KEY);

        res.status(200).json({ token, user: { id: user.id, name: user.name, email: user.email } });
    } catch (error) {
        if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.issues });
        return;
        }
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};