import { Router } from 'express';
import { ServiceContactController } from '../controllers/serviceContactController.ts';
import { validateServiceContact, validateServiceContactUpdate } from '../middleware/validation.ts';

const router = Router();
const serviceContactController = new ServiceContactController();

// GET /api/contacts - Get all service contacts
router.get('/', serviceContactController.getAll);

// POST /api/contacts - Create new service contact
router.post('/', validateServiceContact, serviceContactController.create);

// GET /api/contacts/:id - Get service contact by ID
router.get('/:id', serviceContactController.getById);

// PUT /api/contacts/:id - Update service contact
router.put('/:id', validateServiceContactUpdate, serviceContactController.update);

// DELETE /api/contacts/:id - Delete service contact
router.delete('/:id', serviceContactController.delete);

export default router;