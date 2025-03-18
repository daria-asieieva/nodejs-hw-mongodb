import { ContactsCollections } from '../db/models/Contact.js';

const VALID_CONTACT_TYPES = ['work', 'home', 'personal'];

export const getAllContacts = async (query = {}) => {
  const { 
    page = 1, 
    perPage = 10,
    sortBy = 'name',
    sortOrder = 'asc',
    type
  } = query;
  
  const skip = (page - 1) * perPage;
  const limit = parseInt(perPage);
  
  
  const filter = {};
  
  if (type && VALID_CONTACT_TYPES.includes(type)) {
    filter.contactType = type;
  }
  
  
  const sort = {};
  sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
  

  const contacts = await ContactsCollections.find(filter)
    .sort(sort)
    .skip(skip)
    .limit(limit);
  
  const totalItems = await ContactsCollections.countDocuments(filter);
  const totalPages = Math.ceil(totalItems / limit);
  
  return {
    data: contacts,
    page: parseInt(page),
    perPage: limit,
    totalItems,
    totalPages,
    hasPreviousPage: page > 1,
    hasNextPage: page < totalPages
  };
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