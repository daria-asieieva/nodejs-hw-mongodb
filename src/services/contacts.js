import { ContactsCollections } from '../db/models/Contact.js';

export const getAllContacts = async () => {
  return await ContactsCollections.find();
};

export const getContactById = async (contactId) => {
  return await ContactsCollections.findById(contactId);
};

export const createContact = async (contactData) => {
  return await ContactsCollections.create(contactData);
};

export const updateContact = async (contactId, contactData) => {
  return await ContactsCollections.findByIdAndUpdate(
    contactId,
    contactData,
    { new: true }
  );
};

export const deleteContact = async (contactId) => {
  return await ContactsCollections.findByIdAndDelete(contactId);
};