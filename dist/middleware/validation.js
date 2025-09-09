import { z } from 'zod';
const applianceCategories = ['Kitchen', 'Laundry', 'HVAC', 'Electronics', 'Cleaning', 'Other'];
export const applianceSchema = z.object({
    name: z.string().min(1, 'Name is required').max(255, 'Name too long'),
    brand: z.string().max(255, 'Brand name too long').optional(),
    model: z.string().max(255, 'Model name too long').optional(),
    serialNumber: z.string().max(255, 'Serial number too long').optional(),
    purchaseDate: z.string().datetime().or(z.date()),
    warrantyDuration: z.number().int().min(1, 'Warranty duration must be at least 1 month').max(600, 'Warranty duration too long'),
    purchaseLocation: z.string().max(255, 'Purchase location too long').optional(),
    notes: z.string().max(2000, 'Notes too long').optional(),
    category: z.enum(applianceCategories),
});
export const applianceUpdateSchema = applianceSchema.partial();
export const maintenanceTaskSchema = z.object({
    applianceId: z.string().uuid('Invalid appliance ID'),
    taskName: z.string().min(1, 'Task name is required').max(255, 'Task name too long'),
    date: z.string().datetime().or(z.date()),
    frequency: z.enum(['once', 'monthly', 'quarterly', 'yearly']).optional(),
    serviceProvider: z.string().max(255, 'Service provider name too long').optional(),
    contactInfo: z.string().max(255, 'Contact info too long').optional(),
    notes: z.string().max(2000, 'Notes too long').optional(),
    completed: z.boolean().default(false),
});
export const maintenanceTaskUpdateSchema = maintenanceTaskSchema.omit({ applianceId: true }).partial();
export const serviceContactSchema = z.object({
    applianceId: z.string().uuid('Invalid appliance ID'),
    name: z.string().min(1, 'Name is required').max(255, 'Name too long'),
    phone: z.string().max(20, 'Phone number too long').optional(),
    email: z.string().email('Invalid email format').max(255, 'Email too long').optional(),
    role: z.string().min(1, 'Role is required').max(255, 'Role too long'),
});
export const serviceContactUpdateSchema = serviceContactSchema.omit({ applianceId: true }).partial();
export const validateAppliance = (req, res, next) => {
    try {
        const validatedData = applianceSchema.parse(req.body);
        req.body = validatedData;
        next();
    }
    catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                error: 'Validation failed',
                details: error.errors.map(err => ({
                    field: err.path.join('.'),
                    message: err.message
                }))
            });
        }
        next(error);
    }
};
export const validateApplianceUpdate = (req, res, next) => {
    try {
        const validatedData = applianceUpdateSchema.parse(req.body);
        req.body = validatedData;
        next();
    }
    catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                error: 'Validation failed',
                details: error.errors.map(err => ({
                    field: err.path.join('.'),
                    message: err.message
                }))
            });
        }
        next(error);
    }
};
export const validateMaintenanceTask = (req, res, next) => {
    try {
        const validatedData = maintenanceTaskSchema.parse(req.body);
        req.body = validatedData;
        next();
    }
    catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                error: 'Validation failed',
                details: error.errors.map(err => ({
                    field: err.path.join('.'),
                    message: err.message
                }))
            });
        }
        next(error);
    }
};
export const validateMaintenanceTaskUpdate = (req, res, next) => {
    try {
        const validatedData = maintenanceTaskUpdateSchema.parse(req.body);
        req.body = validatedData;
        next();
    }
    catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                error: 'Validation failed',
                details: error.errors.map(err => ({
                    field: err.path.join('.'),
                    message: err.message
                }))
            });
        }
        next(error);
    }
};
export const validateServiceContact = (req, res, next) => {
    try {
        const validatedData = serviceContactSchema.parse(req.body);
        req.body = validatedData;
        next();
    }
    catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                error: 'Validation failed',
                details: error.errors.map(err => ({
                    field: err.path.join('.'),
                    message: err.message
                }))
            });
        }
        next(error);
    }
};
export const validateServiceContactUpdate = (req, res, next) => {
    try {
        const validatedData = serviceContactUpdateSchema.parse(req.body);
        req.body = validatedData;
        next();
    }
    catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                error: 'Validation failed',
                details: error.errors.map(err => ({
                    field: err.path.join('.'),
                    message: err.message
                }))
            });
        }
        next(error);
    }
};
