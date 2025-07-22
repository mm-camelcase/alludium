import 'reflect-metadata';
import { AppDataSource } from '@/config/database';
import { Todo } from '@/entities/Todo';
import { User } from '@/entities/User';
import { SubTask } from '@/entities/SubTask';
import { logger } from '@/utils/logger';

async function seedDatabase() {
  try {
    // Initialize database connection
    await AppDataSource.initialize();
    logger.info('Database connection established for seeding');

    // Create repositories
    const userRepository = AppDataSource.getRepository(User);
    const todoRepository = AppDataSource.getRepository(Todo);
    const subTaskRepository = AppDataSource.getRepository(SubTask);

    // Check if data already exists
    const existingTodos = await todoRepository.count();
    if (existingTodos > 0) {
      logger.info('Database already has data. Skipping seed.');
      await AppDataSource.destroy();
      return;
    }

    // Create a test user
    const user = userRepository.create({
      email: 'demo@example.com',
      passwordHash: '$2b$12$dummy.hash.for.demo.user', // This would normally be a real bcrypt hash
      firstName: 'Demo',
      lastName: 'User'
    });
    const savedUser = await userRepository.save(user);

    // Create sample todos
    const todo1 = todoRepository.create({
      title: 'Complete project documentation',
      description: 'Write comprehensive API documentation including examples',
      status: 'in-progress',
      priority: 'high',
      dueDate: new Date('2024-12-31T23:59:59Z'),
      tags: ['work', 'documentation', 'api'],
      userId: savedUser.id
    });

    const todo2 = todoRepository.create({
      title: 'Review code changes',
      description: 'Review pending pull requests and provide feedback',
      status: 'pending',
      priority: 'medium',
      tags: ['review', 'code'],
      userId: savedUser.id
    });

    const todo3 = todoRepository.create({
      title: 'Update deployment pipeline',
      description: 'Configure CI/CD pipeline for automated deployments',
      status: 'pending',
      priority: 'high',
      dueDate: new Date('2024-12-15T23:59:59Z'),
      tags: ['devops', 'automation'],
      userId: savedUser.id
    });

    const savedTodos = await todoRepository.save([todo1, todo2, todo3]);

    // Create sample subtasks
    const subTask1 = subTaskRepository.create({
      title: 'Write API reference',
      description: 'Document all endpoints with request/response examples',
      status: 'completed',
      todoId: savedTodos[0].id
    });

    const subTask2 = subTaskRepository.create({
      title: 'Create usage examples',
      description: 'Add practical code examples for common use cases',
      status: 'in-progress',
      todoId: savedTodos[0].id
    });

    const subTask3 = subTaskRepository.create({
      title: 'Set up automated tests',
      description: 'Configure Jest and supertest for API testing',
      status: 'pending',
      todoId: savedTodos[2].id
    });

    await subTaskRepository.save([subTask1, subTask2, subTask3]);

    logger.info('Database seeded successfully', {
      users: 1,
      todos: savedTodos.length,
      subtasks: 3
    });

    await AppDataSource.destroy();
  } catch (error) {
    logger.error('Error seeding database', { error });
    await AppDataSource.destroy();
    process.exit(1);
  }
}

// Run seed if called directly
if (require.main === module) {
  seedDatabase()
    .then(() => {
      logger.info('Seeding completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Seeding failed', { error });
      process.exit(1);
    });
}

export { seedDatabase };