import mongoose from 'mongoose';
import { getEnvVar } from '../utils/getEnvVar.js';


export const initMongoConnection = async () => {
  const user = getEnvVar('MONGODB_USER');
  const password = getEnvVar('MONGODB_PASSWORD');
  const url = getEnvVar('MONGODB_URL');
  const db = getEnvVar('MONGODB_DB');
  
  const connectionString = `mongodb+srv://${user}:${password}@${url}/${db}`;
  
  try {
    await mongoose.connect(connectionString);
    console.log('Mongo connection successfully established!');
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error.message);
    throw error;
  }
};