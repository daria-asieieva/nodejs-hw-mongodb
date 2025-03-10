import createError from 'http-errors';
import { 
  getAllContacts as getAllContactsService, 
  getContactById as getContactByIdService,
  createContact as createContactService,
  updateContact as updateContactService,
  deleteContact as deleteContactService 
} from '../services/contacts.js';

export const getAllContacts = async (req, res) => {
  const contacts = await getAllContactsService();
  res.status(200).json({
    status: 200,
    message: 'Successfully found contacts',
    data: contacts,
  });
};

export const getContactById = async (req, res) => {
  const { contactId } = req.params;
  console.log('Received contactId:', contactId);

  const contact = await getContactByIdService(contactId);

  if (!contact) {
    throw createError(404, "Contact not found");
  }

  res.status(200).json({
    status: 200,
    message: `Successfully found contact with id ${contactId}`,
    data: contact,
  });
};

export const createContact = async (req, res) => {
  const newContact = await createContactService(req.body);
  
  res.status(201).json({
    status: 201,
    message: "Successfully created a contact!",
    data: newContact
  });
};

export const updateContact = async (req, res) => {
  const { contactId } = req.params;
  const updatedContact = await updateContactService(contactId, req.body);
  
  if (!updatedContact) {
    throw createError(404, "Contact not found");
  }
  
  res.status(200).json({
    status: 200,
    message: "Successfully patched a contact!",
    data: updatedContact
  });
};

export const deleteContact = async (req, res) => {
  const { contactId } = req.params;
  const deletedContact = await deleteContactService(contactId);
  
  if (!deletedContact) {
    throw createError(404, "Contact not found");
  }
  
  res.status(204).send();
};