import express from 'express';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import { 
  getAllContacts, 
  getContactById, 
  createContact, 
  updateContact, 
  deleteContact 
} from '../controllers/contacts.js';
import { validateBody, isValidId } from '../middlewares/validation.js';
import { createContactSchema, updateContactSchema } from '../schemas/contacts.js';

const router = express.Router();

router.get('/', ctrlWrapper(getAllContacts));
router.get('/:contactId', isValidId, ctrlWrapper(getContactById));
router.post('/', validateBody(createContactSchema), ctrlWrapper(createContact));
router.patch('/:contactId', isValidId, validateBody(updateContactSchema), ctrlWrapper(updateContact));
router.delete('/:contactId', isValidId, ctrlWrapper(deleteContact));

export default router;