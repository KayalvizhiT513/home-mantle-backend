import { Request, Response } from 'express';
import { db } from '../config/database.ts';
import { appliances, maintenanceTasks, serviceContacts } from '../models/schema.ts';
import { eq, ilike, and } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { calculateWarrantyEndDate, formatDateForDB } from '../utils/warranty.ts';
import { sendSuccess, sendCreated, sendNoContent } from '../utils/responses.ts';
import { NotFoundError, DatabaseError } from '../middleware/errorHandler.ts';
import { asyncHandler } from '../middleware/errorHandler.ts';
import { AuthenticatedRequest } from '../middleware/auth.ts';

export class ApplianceController {
  getAll = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { category, search, limit = '50', offset = '0' } = req.query;
    const userId = req.user?.id;
    
    // Debug logging for user_id
    console.log('🔍 Backend - Fetching appliances');
    console.log('👤 User ID from request:', userId);
    console.log('👤 Full user object:', req.user);
    console.log('🔑 Has authentication headers:', !!req.headers.authorization);
    
    const conditions = [];
    
    // Add user filter for authenticated users - all appliances should be user-scoped
    if (userId) {
      conditions.push(eq(appliances.userId, userId));
      console.log('✅ Using user-scoped query for userId:', userId);
    } else {
      console.log('⚠️ No user ID - returning empty array');
      // If not authenticated, return empty array since all appliances require userId
      return sendSuccess(res, []);
    }
    
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
        .limit(parseInt(limit as string))
        .offset(parseInt(offset as string))
        .orderBy(appliances.createdAt);
    } else {
      result = await db.select().from(appliances)
        .limit(parseInt(limit as string))
        .offset(parseInt(offset as string))
        .orderBy(appliances.createdAt);
    }
    
    console.log('📦 Database query result:');
    console.log('  - Number of appliances found:', result.length);
    console.log('  - Appliances data:', result.map((a: any) => ({ id: a.id, name: a.name, userId: a.userId })));
    
    sendSuccess(res, result);
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    
    const result = await db.select().from(appliances).where(eq(appliances.id, id));
    
    if (result.length === 0) {
      throw new NotFoundError('Appliance not found');
    }
    
    sendSuccess(res, result[0]);
  });

  create = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const applianceData = req.body;
    const userId = req.user?.id;
    
    console.log('🔍 Backend - Creating appliance');
    console.log('👤 User ID for creation:', userId);
    console.log('🏠 Appliance data:', { name: applianceData.name, category: applianceData.category });
    
    // Enforce authentication - userId is required
    if (!userId) {
      console.log('❌ Creation failed - no user ID');
      return res.status(401).json({ 
        error: 'Authentication required', 
        message: 'You must be logged in to create an appliance' 
      });
    }
    
    const id = uuidv4();
    
    // Calculate warranty end date
    const purchaseDate = formatDateForDB(applianceData.purchaseDate);
    const warrantyEndDate = calculateWarrantyEndDate(purchaseDate, applianceData.warrantyDuration);
    
    const newAppliance = {
      ...applianceData,
      id,
      userId, // Always required now
      purchaseDate,
      warrantyEndDate,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    try {
      const result = await db.insert(appliances).values(newAppliance).returning();
      console.log('✅ Appliance created successfully:');
      console.log('  - ID:', result[0].id);
      console.log('  - Name:', result[0].name);
      console.log('  - User ID:', result[0].userId);
      sendCreated(res, result[0]);
    } catch (error) {
      console.error('Database error creating appliance:', error);
      console.error('Appliance data:', newAppliance);
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new DatabaseError(`Failed to create appliance: ${errorMessage}`);
    }
  });

  update = asyncHandler(async (req: Request, res: Response) => {
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
    } catch (error) {
      throw new DatabaseError('Failed to update appliance');
    }
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    
    try {
      const result = await db.delete(appliances).where(eq(appliances.id, id)).returning();
      
      if (result.length === 0) {
        throw new NotFoundError('Appliance not found');
      }
      
      sendNoContent(res);
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      throw new DatabaseError('Failed to delete appliance');
    }
  });

  getMaintenanceTasks = asyncHandler(async (req: Request, res: Response) => {
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

  getServiceContacts = asyncHandler(async (req: Request, res: Response) => {
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