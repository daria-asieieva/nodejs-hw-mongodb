import { initMongoConnection } from './db/initMongoConnection.js';
import setUpServer from './server.js';

export const boostrap = async () => {
  await initMongoConnection();
  setUpServer();
};

boostrap();