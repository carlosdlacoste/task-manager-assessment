import { Request, Response, NextFunction } from 'express';
import jwt from 'jwt-simple';

const SECRET_KEY = process.env.JWT_SECRET || 'super-secret-key-123';

// Extendemos los tipos de Express para poder guardar el userId en el req
export interface AuthenticatedRequest extends Request {
    userId?: string;
}

export const authMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Acceso denegado. No se proporcionó un token válido.' });
        return;
    }

    const token = authHeader.split(' ')[1];

    try {
        const payload = jwt.decode(token, SECRET_KEY);
        
        // El sub contiene el id del usuario que guardaste en el login
        if (!payload || !payload.sub) {
            res.status(401).json({ error: 'Token inválido o mal formado.' });
            return;
        }

        req.userId = payload.sub;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Token expirado o inválido.' });
    }
};