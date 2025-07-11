import { NestFactory } from "@nestjs/core"
import { ValidationPipe, Logger } from "@nestjs/common"
import { AppModule } from "./app.module"
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const logger = new Logger('Bootstrap');

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  // Set global prefix
  app.setGlobalPrefix('api');

  // Enable CORS with specific origin and methods
  app.enableCors({
    origin: 'http://localhost:4200',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    allowedHeaders: 'Content-Type, Accept, Authorization',
  });

  // Log MongoDB connection
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/patient-management';
  logger.log(`Connecting to MongoDB: ${mongoUri.split('@')[1] || 'local database'}`);

  // Enable CORS for development
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:4200',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      forbidNonWhitelisted: false, // Temporarily disable to identify the issue
      validationError: {
        target: false,
        value: true
      }
    }),
  )

  // API prefix
  app.setGlobalPrefix("api")

  const server = await app.listen(process.env.PORT || 3000);
  const address = server.address();
  const port = typeof address === 'string' ? address : address?.port;
  
  logger.log(`🚀 Server running on http://localhost:${port}`);
  logger.log(`📚 API Documentation: http://localhost:${port}/api`);
  
  // Application is now running
}
bootstrap()
