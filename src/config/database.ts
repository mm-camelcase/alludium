import { DataSource } from 'typeorm';
import { config } from './config';
import { Todo, SubTask, User } from '@/entities';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: config.DB_HOST,
  port: config.DB_PORT,
  username: config.DB_USER,
  password: config.DB_PASSWORD,
  database: config.DB_NAME,
  synchronize: config.NODE_ENV === 'development', // Auto-sync schema in development
  logging: config.NODE_ENV === 'development',
  entities: [Todo, SubTask, User],
  migrations: ['src/migrations/*.ts'],
  subscribers: ['src/subscribers/*.ts'],
  schema: 'todo_app', // Use custom schema
  ssl: config.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

export const initializeDatabase = async (): Promise<void> => {
  try {
    await AppDataSource.initialize();
    
    // Create schema if it doesn't exist
    if (config.NODE_ENV === 'development') {
      await AppDataSource.query('CREATE SCHEMA IF NOT EXISTS todo_app;');
    }
    
    console.log('✅ Database connection established');
  } catch (error) {
    console.error('❌ Error connecting to database:', error);
    throw error;
  }
};