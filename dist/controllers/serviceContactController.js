import { db } from '../config/database.js';
import { serviceContacts, appliances } from '../models/schema.js';
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { sendSuccess, sendCreated, sendNoContent } from '../utils/responses.js';
import { NotFoundError, DatabaseError } from '../middleware/errorHandler.js';
import { asyncHandler } from '../middleware/errorHandler.js';
export class ServiceContactController {
    getAll = asyncHandler(async (req, res) => {
        const { applianceId, limit = '50', offset = '0' } = req.query;
        let result;
        if (applianceId && typeof applianceId === 'string') {
            result = await db.select().from(serviceContacts)
                .where(eq(serviceContacts.applianceId, applianceId))
                .limit(parseInt(limit))
                .offset(parseInt(offset))
                .orderBy(serviceContacts.name);
        }
        else {
            result = await db.select().from(serviceContacts)
                .limit(parseInt(limit))
                .offset(parseInt(offset))
                .orderBy(serviceContacts.name);
        }
        sendSuccess(res, result);
    });
    getById = asyncHandler(async (req, res) => {
        const { id } = req.params;
        const result = await db.select().from(serviceContacts).where(eq(serviceContacts.id, id));
        if (result.length === 0) {
            throw new NotFoundError('Service contact not found');
        }
        sendSuccess(res, result[0]);
    });
    create = asyncHandler(async (req, res) => {
        const contactData = req.body;
        const id = uuidv4();
        // Verify appliance exists
        const appliance = await db.select().from(appliances).where(eq(appliances.id, contactData.applianceId));
        if (appliance.length === 0) {
            throw new NotFoundError('Appliance not found');
        }
        const newContact = {
            ...contactData,
            id,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        try {
            const result = await db.insert(serviceContacts).values(newContact).returning();
            sendCreated(res, result[0]);
        }
        catch (error) {
            throw new DatabaseError('Failed to create service contact');
        }
    });
    update = asyncHandler(async (req, res) => {
        const { id } = req.params;
        const updates = req.body;
        // Check if contact exists
        const existing = await db.select().from(serviceContacts).where(eq(serviceContacts.id, id));
        if (existing.length === 0) {
            throw new NotFoundError('Service contact not found');
        }
        updates.updatedAt = new Date();
        try {
            const result = await db.update(serviceContacts)
                .set(updates)
                .where(eq(serviceContacts.id, id))
                .returning();
            sendSuccess(res, result[0]);
        }
        catch (error) {
            throw new DatabaseError('Failed to update service contact');
        }
    });
    delete = asyncHandler(async (req, res) => {
        const { id } = req.params;
        try {
            const result = await db.delete(serviceContacts).where(eq(serviceContacts.id, id)).returning();
            if (result.length === 0) {
                throw new NotFoundError('Service contact not found');
            }
            sendNoContent(res);
        }
        catch (error) {
            if (error instanceof NotFoundError)
                throw error;
            throw new DatabaseError('Failed to delete service contact');
        }
    });
}
