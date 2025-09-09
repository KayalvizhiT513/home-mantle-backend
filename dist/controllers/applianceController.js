import { db } from '../config/database.js';
import { appliances, maintenanceTasks, serviceContacts } from '../models/schema.js';
import { eq, ilike, and } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { calculateWarrantyEndDate, formatDateForDB } from '../utils/warranty.js';
import { sendSuccess, sendCreated, sendNoContent } from '../utils/responses.js';
import { NotFoundError, DatabaseError } from '../middleware/errorHandler.js';
import { asyncHandler } from '../middleware/errorHandler.js';
export class ApplianceController {
    getAll = asyncHandler(async (req, res) => {
        const { category, search, limit = '50', offset = '0' } = req.query;
        const conditions = [];
        if (category && typeof category === 'string') {
            conditions.push(eq(appliances.category, category));
        }
        if (search && typeof search === 'string') {
            conditions.push(ilike(appliances.name, `%${search}%`));
        }
        let result;
        if (conditions.length > 0) {
            result = await db.select().from(appliances)
                .where(and(...conditions))
                .limit(parseInt(limit))
                .offset(parseInt(offset))
                .orderBy(appliances.createdAt);
        }
        else {
            result = await db.select().from(appliances)
                .limit(parseInt(limit))
                .offset(parseInt(offset))
                .orderBy(appliances.createdAt);
        }
        sendSuccess(res, result);
    });
    getById = asyncHandler(async (req, res) => {
        const { id } = req.params;
        const result = await db.select().from(appliances).where(eq(appliances.id, id));
        if (result.length === 0) {
            throw new NotFoundError('Appliance not found');
        }
        sendSuccess(res, result[0]);
    });
    create = asyncHandler(async (req, res) => {
        const applianceData = req.body;
        const id = uuidv4();
        // Calculate warranty end date
        const purchaseDate = formatDateForDB(applianceData.purchaseDate);
        const warrantyEndDate = calculateWarrantyEndDate(purchaseDate, applianceData.warrantyDuration);
        const newAppliance = {
            ...applianceData,
            id,
            purchaseDate,
            warrantyEndDate,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        try {
            const result = await db.insert(appliances).values(newAppliance).returning();
            sendCreated(res, result[0]);
        }
        catch (error) {
            throw new DatabaseError('Failed to create appliance');
        }
    });
    update = asyncHandler(async (req, res) => {
        const { id } = req.params;
        const updates = req.body;
        // Check if appliance exists
        const existing = await db.select().from(appliances).where(eq(appliances.id, id));
        if (existing.length === 0) {
            throw new NotFoundError('Appliance not found');
        }
        // Recalculate warranty end date if needed
        if (updates.purchaseDate || updates.warrantyDuration) {
            const purchaseDate = updates.purchaseDate
                ? formatDateForDB(updates.purchaseDate)
                : existing[0].purchaseDate;
            const warrantyDuration = updates.warrantyDuration || existing[0].warrantyDuration;
            updates.warrantyEndDate = calculateWarrantyEndDate(purchaseDate, warrantyDuration);
            if (updates.purchaseDate) {
                updates.purchaseDate = purchaseDate;
            }
        }
        updates.updatedAt = new Date();
        try {
            const result = await db.update(appliances)
                .set(updates)
                .where(eq(appliances.id, id))
                .returning();
            sendSuccess(res, result[0]);
        }
        catch (error) {
            throw new DatabaseError('Failed to update appliance');
        }
    });
    delete = asyncHandler(async (req, res) => {
        const { id } = req.params;
        try {
            const result = await db.delete(appliances).where(eq(appliances.id, id)).returning();
            if (result.length === 0) {
                throw new NotFoundError('Appliance not found');
            }
            sendNoContent(res);
        }
        catch (error) {
            if (error instanceof NotFoundError)
                throw error;
            throw new DatabaseError('Failed to delete appliance');
        }
    });
    getMaintenanceTasks = asyncHandler(async (req, res) => {
        const { id } = req.params;
        // Verify appliance exists
        const appliance = await db.select().from(appliances).where(eq(appliances.id, id));
        if (appliance.length === 0) {
            throw new NotFoundError('Appliance not found');
        }
        const result = await db.select()
            .from(maintenanceTasks)
            .where(eq(maintenanceTasks.applianceId, id))
            .orderBy(maintenanceTasks.date);
        sendSuccess(res, result);
    });
    getServiceContacts = asyncHandler(async (req, res) => {
        const { id } = req.params;
        // Verify appliance exists
        const appliance = await db.select().from(appliances).where(eq(appliances.id, id));
        if (appliance.length === 0) {
            throw new NotFoundError('Appliance not found');
        }
        const result = await db.select()
            .from(serviceContacts)
            .where(eq(serviceContacts.applianceId, id))
            .orderBy(serviceContacts.name);
        sendSuccess(res, result);
    });
}
