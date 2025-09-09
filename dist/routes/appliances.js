import { Router } from 'express';
import { ApplianceController } from '../controllers/applianceController.js';
import { validateAppliance, validateApplianceUpdate } from '../middleware/validation.js';
import { authenticateUser } from '../middleware/auth.js';
const router = Router();
const applianceController = new ApplianceController();
// GET /api/appliances - Get all appliances with filtering (requires authentication)
router.get('/', authenticateUser, applianceController.getAll);
// POST /api/appliances - Create new appliance (requires authentication)
router.post('/', authenticateUser, validateAppliance, applianceController.create);
// GET /api/appliances/:id - Get appliance by ID (optional auth for now)
router.get('/:id', authenticateUser, applianceController.getById);
// PUT /api/appliances/:id - Update appliance (requires authentication)
router.put('/:id', authenticateUser, validateApplianceUpdate, applianceController.update);
// DELETE /api/appliances/:id - Delete appliance (requires authentication)
router.delete('/:id', authenticateUser, applianceController.delete);
// GET /api/appliances/:id/maintenance - Get maintenance tasks for appliance (optional auth)
router.get('/:id/maintenance', authenticateUser, applianceController.getMaintenanceTasks);
// GET /api/appliances/:id/contacts - Get service contacts for appliance (optional auth)
router.get('/:id/contacts', authenticateUser, applianceController.getServiceContacts);
export default router;
