import { createClient } from '@supabase/supabase-js';
import { UserController } from '../controllers/userController.js';
import dotenv from 'dotenv';
dotenv.config();
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing required Supabase environment variables');
}
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});
// Create user controller instance for syncing
const userController = new UserController();
export async function authenticateUser(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'No token provided' });
        }
        const token = authHeader.substring(7);
        const { data: { user }, error } = await supabase.auth.getUser(token);
        if (error || !user) {
            return res.status(401).json({ error: 'Invalid token' });
        }
        // Sync user to local database
        await userController.syncUser({
            id: user.id,
            email: user.email || ''
        });
        req.user = {
            id: user.id,
            email: user.email || '',
        };
        next();
    }
    catch (error) {
        console.error('Authentication error:', error);
        return res.status(401).json({ error: 'Authentication failed' });
    }
}
export async function optionalAuth(req, next) {
    try {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            const { data: { user } } = await supabase.auth.getUser(token);
            if (user) {
                // Sync user to local database if authenticated
                await userController.syncUser({
                    id: user.id,
                    email: user.email || ''
                });
                req.user = {
                    id: user.id,
                    email: user.email || '',
                };
            }
        }
        next();
    }
    catch (error) {
        // Optional auth - continue even if there's an error
        next();
    }
}
