import { ContactsCollections } from '../db/models/Contact.js';

export const getAllContacts = async () => {
  return await ContactsCollections.find();
};

export const getContactById = async (contactId) => {
  return await ContactsCollections.findById(contactId);
};