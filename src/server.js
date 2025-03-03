import express from 'express';
import cors from 'cors';
import { pinoHttp } from 'pino-http';
import { getEnvVar } from './utils/getEnvVar.js';
import { getAllContacts, getContactById } from './services/contacts.js';

const PORT = Number(getEnvVar('PORT', '3000'));

const setUpServer = () => {
  const app = express();

  app.use(express.json());
  app.use(cors());
  app.use(
    pinoHttp({
      transport: {
        target: 'pino-pretty',
      },
    }),
  );

  app.get('/', (req, res) => {
    res.json({
      message: 'Hello Mentor',
    });
  });

  app.get('/contacts', async (req, res) => {
    const contacts = await getAllContacts();
    res.status(200).json({
      status: 200,
      message: 'Successfully found contacts',
      data: contacts,
    });
  });

  app.get('/contacts/:contactId', async (req, res) => {
    try {
      const { contactId } = req.params;
      console.log('Received contactId:', contactId);

      const contact = await getContactById(contactId);

      if (!contact) {
        return res.status(404).json({
          status: 404,
          message: 'Contact not found',
        });
      }

      res.status(200).json({
        status: 200,
        message: `Successfully found contact with id ${contactId}`,
        data: contact,
      });
    } catch (error) {
      console.log(error);
    }
  });

  app.get('*', (req, res) => {
    res.status(404).json({
      status: 404,
      message: 'Ops',
    });

    app.use((err, req, res, next) => {
      res.status(500).json({
        status: 500,
        message: 'Something went wrong',
        error: err.message,
      });
    });
  });
  app.listen(PORT, () => {
    console.log(` Server is running on port ${PORT}`);
  });
};

export default setUpServer;