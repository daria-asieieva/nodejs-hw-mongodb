import { ContactsCollections } from '../db/models/Contact.js';
import { uploadToCloudinary } from '../utils/cloudinaryConfig.js';
import fs from 'fs/promises';

const VALID_CONTACT_TYPES = ['work', 'home', 'personal'];

export const getAllContacts = async (query = {}, userId) => {
  const { 
    page = 1, 
    perPage = 10,
    sortBy = 'name',
    sortOrder = 'asc',
    type
  } = query;
  
  const skip = (page - 1) * perPage;
  const limit = parseInt(perPage);
  
  const filter = { userId };
  
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

export const getContactById = async (contactId, userId) => {
  return await ContactsCollections.findOne({ _id: contactId, userId });
};

export const createContact = async (contactData, photo, userId) => {
  let photoUrl = null;
  
  if (photo) {
    try {
      photoUrl = await uploadToCloudinary(photo.path);
      await fs.unlink(photo.path); 
    } catch (error) {
      console.error('Error uploading photo:', error);
      if (photo && photo.path) {
        try {
          await fs.unlink(photo.path); 
        } catch (unlinkError) {
          console.error('Error deleting temporary file:', unlinkError);
        }
      }
      throw error;
    }
  }
  
  return await ContactsCollections.create({ 
    ...contactData, 
    userId,
    photo: photoUrl
  });
};

export const updateContact = async (contactId, contactData, photo, userId) => {
  const contact = await ContactsCollections.findOne({ _id: contactId, userId });
  
  if (!contact) {
    if (photo && photo.path) {
      await fs.unlink(photo.path); 
    }
    return null;
  }
  
  let updatedData = { ...contactData };
  
  if (photo) {
    try {
      const photoUrl = await uploadToCloudinary(photo.path);
      await fs.unlink(photo.path); 
      updatedData.photo = photoUrl;
    } catch (error) {
      console.error('Error uploading photo:', error);
      if (photo && photo.path) {
        try {
          await fs.unlink(photo.path); 
        } catch (unlinkError) {
          console.error('Error deleting temporary file:', unlinkError);
        }
      }
      throw error;
    }
  }
  
  return await ContactsCollections.findOneAndUpdate(
    { _id: contactId, userId },
    updatedData,
    { new: true }
  );
};

export const deleteContact = async (contactId, userId) => {
  return await ContactsCollections.findOneAndDelete({ _id: contactId, userId });
};