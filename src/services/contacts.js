import { Contact } from '../models/Contact.js';

const getAllContacts = async () => {
  return await Contact.find();
};

const getContactById = async (contactId) => {
  return await Contact.findById(contactId);
};

export const contactsService = {
  getAllContacts,
  getContactById
};