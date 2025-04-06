import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { pinoHttp } from 'pino-http';
import swaggerUi from 'swagger-ui-express';
import fs from 'fs';
import { getEnvVar } from './utils/getEnvVar.js';
import contactsRouter from './routers/contacts.js';
import authRouter from './routers/auth.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { notFoundHandler } from './middlewares/notFoundHandler.js';

const PORT = Number(getEnvVar('PORT', '3000'));

const setUpServer = () => {
  const app = express();

  
  let swaggerDocument;
  try {
    
    const swaggerPath = new URL('../docs/swagger.json', import.meta.url);
    swaggerDocument = JSON.parse(fs.readFileSync(swaggerPath, 'utf8'));
  } catch (error) {
    console.log(error);
    console.log('Swagger JSON not found. API docs may not be available.');
    swaggerDocument = { info: { title: 'API Documentation', version: '1.0.0' } };
  }

  app.use(express.json());
  app.use(cookieParser());
  app.use(cors({
    origin: true,
    credentials: true,
  }));
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

  
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

  app.use('/auth', authRouter);
  app.use('/contacts', contactsRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  app.listen(PORT, () => {
    console.log(` Server is running on port ${PORT}`);
  });
};

export default setUpServer;