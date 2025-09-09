import { Router } from 'express';
import { ApplianceController } from '../controllers/applianceController.js';
import { validateAppliance, validateApplianceUpdate } from '../middleware/validation.js';
const router = Router();
const applianceController = new ApplianceController();
// GET /api/appliances - Get all appliances with filtering
router.get('/', applianceController.getAll);
// POST /api/appliances - Create new appliance
router.post('/', validateAppliance, applianceController.create);
// GET /api/appliances/:id - Get appliance by ID
router.get('/:id', applianceController.getById);
// PUT /api/appliances/:id - Update appliance
router.put('/:id', validateApplianceUpdate, applianceController.update);
// DELETE /api/appliances/:id - Delete appliance
router.delete('/:id', applianceController.delete);
// GET /api/appliances/:id/maintenance - Get maintenance tasks for appliance
router.get('/:id/maintenance', applianceController.getMaintenanceTasks);
// GET /api/appliances/:id/contacts - Get service contacts for appliance
router.get('/:id/contacts', applianceController.getServiceContacts);
export default router;
