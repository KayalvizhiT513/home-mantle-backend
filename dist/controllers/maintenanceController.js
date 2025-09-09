import { db } from '../config/database.js';
import { maintenanceTasks, appliances } from '../models/schema.js';
import { eq, and } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { formatDateForDB } from '../utils/warranty.js';
import { sendSuccess, sendCreated, sendNoContent } from '../utils/responses.js';
import { NotFoundError, DatabaseError } from '../middleware/errorHandler.js';
import { asyncHandler } from '../middleware/errorHandler.js';
export class MaintenanceController {
    getAll = asyncHandler(async (req, res) => {
        const { applianceId, completed, limit = '50', offset = '0' } = req.query;
        const conditions = [];
        if (applianceId && typeof applianceId === 'string') {
            conditions.push(eq(maintenanceTasks.applianceId, applianceId));
        }
        if (completed !== undefined) {
            conditions.push(eq(maintenanceTasks.completed, completed === 'true'));
        }
        let result;
        if (conditions.length > 0) {
            result = await db.select().from(maintenanceTasks)
                .where(and(...conditions))
                .limit(parseInt(limit))
                .offset(parseInt(offset))
                .orderBy(maintenanceTasks.date);
        }
        else {
            result = await db.select().from(maintenanceTasks)
                .limit(parseInt(limit))
                .offset(parseInt(offset))
                .orderBy(maintenanceTasks.date);
        }
        sendSuccess(res, result);
    });
    getById = asyncHandler(async (req, res) => {
        const { id } = req.params;
        const result = await db.select().from(maintenanceTasks).where(eq(maintenanceTasks.id, id));
        if (result.length === 0) {
            throw new NotFoundError('Maintenance task not found');
        }
        sendSuccess(res, result[0]);
    });
    create = asyncHandler(async (req, res) => {
        const taskData = req.body;
        const id = uuidv4();
        // Verify appliance exists
        const appliance = await db.select().from(appliances).where(eq(appliances.id, taskData.applianceId));
        if (appliance.length === 0) {
            throw new NotFoundError('Appliance not found');
        }
        const newTask = {
            ...taskData,
            id,
            date: formatDateForDB(taskData.date),
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        try {
            const result = await db.insert(maintenanceTasks).values(newTask).returning();
            sendCreated(res, result[0]);
        }
        catch (error) {
            throw new DatabaseError('Failed to create maintenance task');
        }
    });
    update = asyncHandler(async (req, res) => {
        const { id } = req.params;
        const updates = req.body;
        // Check if task exists
        const existing = await db.select().from(maintenanceTasks).where(eq(maintenanceTasks.id, id));
        if (existing.length === 0) {
            throw new NotFoundError('Maintenance task not found');
        }
        if (updates.date) {
            updates.date = formatDateForDB(updates.date);
        }
        updates.updatedAt = new Date();
        try {
            const result = await db.update(maintenanceTasks)
                .set(updates)
                .where(eq(maintenanceTasks.id, id))
                .returning();
            sendSuccess(res, result[0]);
        }
        catch (error) {
            throw new DatabaseError('Failed to update maintenance task');
        }
    });
    delete = asyncHandler(async (req, res) => {
        const { id } = req.params;
        try {
            const result = await db.delete(maintenanceTasks).where(eq(maintenanceTasks.id, id)).returning();
            if (result.length === 0) {
                throw new NotFoundError('Maintenance task not found');
            }
            sendNoContent(res);
        }
        catch (error) {
            if (error instanceof NotFoundError)
                throw error;
            throw new DatabaseError('Failed to delete maintenance task');
        }
    });
}
