import { db } from '../config/database.js';
import { users } from '../models/schema.js';
import { eq } from 'drizzle-orm';
import { sendSuccess } from '../utils/responses.js';
import { DatabaseError } from '../middleware/errorHandler.js';
import { asyncHandler } from '../middleware/errorHandler.js';
export class UserController {
    // Sync user from Supabase Auth to local users table
    syncUser = async (supabaseUser) => {
        try {
            // Check if user already exists in our database
            const existingUser = await db.select().from(users).where(eq(users.id, supabaseUser.id));
            if (existingUser.length === 0) {
                // User doesn't exist, create them
                console.log(`Creating new user in database: ${supabaseUser.email} (${supabaseUser.id})`);
                const newUser = {
                    id: supabaseUser.id,
                    email: supabaseUser.email,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                };
                await db.insert(users).values(newUser);
                console.log(`✅ User created successfully: ${supabaseUser.email}`);
            }
            else {
                // User exists, optionally update their email if it changed
                const existingUserData = existingUser[0];
                if (existingUserData.email !== supabaseUser.email) {
                    console.log(`Updating user email: ${existingUserData.email} -> ${supabaseUser.email}`);
                    await db.update(users)
                        .set({
                        email: supabaseUser.email,
                        updatedAt: new Date()
                    })
                        .where(eq(users.id, supabaseUser.id));
                    console.log(`✅ User email updated successfully`);
                }
            }
        }
        catch (error) {
            console.error('Error syncing user:', error);
            throw new DatabaseError(`Failed to sync user: ${error instanceof Error ? error.message : String(error)}`);
        }
    };
    // Get current user profile
    getProfile = asyncHandler(async (req, res) => {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'Authentication required' });
        }
        try {
            const user = await db.select().from(users).where(eq(users.id, userId));
            if (user.length === 0) {
                return res.status(404).json({ error: 'User not found' });
            }
            sendSuccess(res, user[0]);
        }
        catch (error) {
            throw new DatabaseError('Failed to get user profile');
        }
    });
    // Update user profile
    updateProfile = asyncHandler(async (req, res) => {
        const userId = req.user?.id;
        const updates = req.body;
        if (!userId) {
            return res.status(401).json({ error: 'Authentication required' });
        }
        try {
            // Only allow updating email for now
            const allowedUpdates = {
                email: updates.email,
                updatedAt: new Date()
            };
            const result = await db.update(users)
                .set(allowedUpdates)
                .where(eq(users.id, userId))
                .returning();
            if (result.length === 0) {
                return res.status(404).json({ error: 'User not found' });
            }
            sendSuccess(res, result[0]);
        }
        catch (error) {
            throw new DatabaseError('Failed to update user profile');
        }
    });
}
