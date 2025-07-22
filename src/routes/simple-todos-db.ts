import { Router, Request, Response, NextFunction } from 'express';
import { AppDataSource } from '@/config/database';
import { Todo } from '@/entities/Todo';
import { asyncHandler } from '@/utils/asyncHandler';
import { AppError } from '@/middleware/errorHandler';
import { logger } from '@/utils/logger';

const router = Router();

/**
 * @route GET /todos
 * @description Get all todos with simple pagination
 */
router.get('/', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const todoRepository = AppDataSource.getRepository(Todo);
  
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const skip = (page - 1) * limit;

  const [items, total] = await todoRepository.findAndCount({
    relations: ['subTasks', 'user'],
    skip,
    take: limit,
    order: { createdAt: 'DESC' }
  });

  logger.info('Todos fetched successfully', { count: items.length, total, page });

  res.json({
    items,
    total,
    page,
    limit,
    hasMore: skip + items.length < total
  });
}));

/**
 * @route GET /todos/:id
 * @description Get a specific todo by ID
 */
router.get('/:id', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const todoRepository = AppDataSource.getRepository(Todo);
  
  const todo = await todoRepository.findOne({
    where: { id: req.params.id },
    relations: ['subTasks', 'user']
  });
  
  if (!todo) {
    throw new AppError('Todo not found', 404);
  }

  logger.info('Todo fetched successfully', { todoId: req.params.id });
  res.json(todo);
}));

/**
 * @route POST /todos
 * @description Create a new todo
 */
router.post('/', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const todoRepository = AppDataSource.getRepository(Todo);

  // Basic validation
  if (!req.body.title || req.body.title.trim().length === 0) {
    throw new AppError('Title is required', 400);
  }

  const todoData: Partial<Todo> = {
    title: req.body.title,
    description: req.body.description,
    status: req.body.status || 'pending',
    priority: req.body.priority || 'medium',
    tags: req.body.tags,
    userId: req.body.userId
  };

  if (req.body.dueDate) {
    todoData.dueDate = new Date(req.body.dueDate);
  }

  const todo = todoRepository.create(todoData);
  const savedTodo = await todoRepository.save(todo);

  // Fetch with relations
  const result = await todoRepository.findOne({
    where: { id: savedTodo.id },
    relations: ['subTasks', 'user']
  });

  logger.info('Todo created successfully', { todoId: result?.id });
  res.status(201).json(result);
}));

/**
 * @route PUT /todos/:id
 * @description Replace entire todo
 */
router.put('/:id', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const todoRepository = AppDataSource.getRepository(Todo);

  // Check if todo exists
  const existingTodo = await todoRepository.findOne({
    where: { id: req.params.id }
  });

  if (!existingTodo) {
    throw new AppError('Todo not found', 404);
  }

  // Basic validation
  if (!req.body.title || req.body.title.trim().length === 0) {
    throw new AppError('Title is required', 400);
  }

  const updateData: Partial<Todo> = {
    title: req.body.title,
    description: req.body.description,
    status: req.body.status || 'pending',
    priority: req.body.priority || 'medium',
    tags: req.body.tags,
    userId: req.body.userId
  };

  if (req.body.dueDate) {
    updateData.dueDate = new Date(req.body.dueDate);
  }

  await todoRepository.update(req.params.id, updateData);

  // Fetch updated todo with relations
  const updatedTodo = await todoRepository.findOne({
    where: { id: req.params.id },
    relations: ['subTasks', 'user']
  });

  logger.info('Todo updated successfully', { todoId: req.params.id });
  res.json(updatedTodo);
}));

/**
 * @route PATCH /todos/:id
 * @description Partially update todo
 */
router.patch('/:id', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const todoRepository = AppDataSource.getRepository(Todo);

  // Check if todo exists
  const existingTodo = await todoRepository.findOne({
    where: { id: req.params.id }
  });

  if (!existingTodo) {
    throw new AppError('Todo not found', 404);
  }

  // Validate title if provided
  if (req.body.title !== undefined && req.body.title.trim().length === 0) {
    throw new AppError('Title cannot be empty', 400);
  }

  const updateData: Partial<Todo> = {};
  
  if (req.body.title !== undefined) updateData.title = req.body.title;
  if (req.body.description !== undefined) updateData.description = req.body.description;
  if (req.body.status !== undefined) updateData.status = req.body.status;
  if (req.body.priority !== undefined) updateData.priority = req.body.priority;
  if (req.body.dueDate !== undefined && req.body.dueDate) updateData.dueDate = new Date(req.body.dueDate);
  if (req.body.tags !== undefined) updateData.tags = req.body.tags;
  if (req.body.userId !== undefined) updateData.userId = req.body.userId;

  await todoRepository.update(req.params.id, updateData);

  // Fetch updated todo with relations
  const updatedTodo = await todoRepository.findOne({
    where: { id: req.params.id },
    relations: ['subTasks', 'user']
  });

  logger.info('Todo patched successfully', { todoId: req.params.id });
  res.json(updatedTodo);
}));

/**
 * @route DELETE /todos/:id
 * @description Delete a todo
 */
router.delete('/:id', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const todoRepository = AppDataSource.getRepository(Todo);

  // Check if todo exists
  const existingTodo = await todoRepository.findOne({
    where: { id: req.params.id }
  });

  if (!existingTodo) {
    throw new AppError('Todo not found', 404);
  }

  await todoRepository.delete(req.params.id);

  logger.info('Todo deleted successfully', { todoId: req.params.id });
  res.status(204).send();
}));

export default router;