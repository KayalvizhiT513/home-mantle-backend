import { Router } from 'express';
import { MaintenanceController } from '../controllers/maintenanceController.js';
import { validateMaintenanceTask, validateMaintenanceTaskUpdate } from '../middleware/validation.js';
const router = Router();
const maintenanceController = new MaintenanceController();
// GET /api/maintenance - Get all maintenance tasks
router.get('/', maintenanceController.getAll);
// POST /api/maintenance - Create new maintenance task
router.post('/', validateMaintenanceTask, maintenanceController.create);
// GET /api/maintenance/:id - Get maintenance task by ID
router.get('/:id', maintenanceController.getById);
// PUT /api/maintenance/:id - Update maintenance task
router.put('/:id', validateMaintenanceTaskUpdate, maintenanceController.update);
// DELETE /api/maintenance/:id - Delete maintenance task
router.delete('/:id', maintenanceController.delete);
export default router;
