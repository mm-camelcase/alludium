import { Router, Request, Response, NextFunction } from 'express';
import { TodoRepository, TodoFilters, TodoListOptions } from '@/repositories/TodoRepository';
import { Todo, TodoStatus, TodoPriority } from '@/entities/Todo';
import { AppError } from '@/middleware/errorHandler';
import { logger } from '@/utils/logger';

const router = Router();
const todoRepository = new TodoRepository();

/**
 * @route GET /todos
 * @description Get all todos with filtering, pagination, and sorting
 */
router.get('/', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {
      page = '1',
      limit = '20',
      sort = 'createdAt:desc',
      status,
      priority,
      userId,
      tags,
      dueAfter,
      dueBefore,
      search
    } = req.query;

    // Parse query parameters
    const filters: TodoFilters = {};
    
    if (status && typeof status === 'string') {
      filters.status = status as TodoStatus;
    }
    
    if (priority && typeof priority === 'string') {
      filters.priority = priority as TodoPriority;
    }
    
    if (userId && typeof userId === 'string') {
      filters.userId = userId;
    }
    
    if (tags && typeof tags === 'string') {
      filters.tags = tags.split(',').map(tag => tag.trim());
    }
    
    if (dueAfter && typeof dueAfter === 'string') {
      filters.dueAfter = new Date(dueAfter);
    }
    
    if (dueBefore && typeof dueBefore === 'string') {
      filters.dueBefore = new Date(dueBefore);
    }
    
    if (search && typeof search === 'string') {
      filters.search = search;
    }

    const options: TodoListOptions = {
      page: parseInt(page as string, 10),
      limit: parseInt(limit as string, 10),
      sort: sort as string,
      filters
    };

    const result = await todoRepository.findAll(options);

    logger.info('Todos fetched successfully', {
      count: result.items.length,
      total: result.total,
      page: result.page,
      filters
    });

    res.json(result);
  } catch (error) {
    logger.error('Error fetching todos', { error });
    next(new AppError('Failed to fetch todos', 500));
  }
});

/**
 * @route GET /todos/:id
 * @description Get a specific todo by ID
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const todo = await todoRepository.findById(id);
    
    if (!todo) {
      throw new AppError('Todo not found', 404);
    }

    logger.info('Todo fetched successfully', { todoId: id });

    return res.json(todo);
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    logger.error('Error fetching todo', { error, todoId: req.params.id });
    throw new AppError('Failed to fetch todo', 500);
  }
});

/**
 * @route POST /todos
 * @description Create a new todo
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const todoData: Partial<Todo> = req.body;

    // Basic validation
    if (!todoData.title || todoData.title.trim().length === 0) {
      throw new AppError('Title is required', 400);
    }

    // Set defaults
    if (!todoData.status) {
      todoData.status = 'pending';
    }
    
    if (!todoData.priority) {
      todoData.priority = 'medium';
    }

    const todo = await todoRepository.create(todoData);

    logger.info('Todo created successfully', { todoId: todo.id });

    return res.status(201).json(todo);
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    logger.error('Error creating todo', { error, body: req.body });
    throw new AppError('Failed to create todo', 500);
  }
});

/**
 * @route PUT /todos/:id
 * @description Replace entire todo
 */
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const todoData: Partial<Todo> = req.body;

    // Check if todo exists
    const existingTodo = await todoRepository.findById(id);
    if (!existingTodo) {
      throw new AppError('Todo not found', 404);
    }

    // Basic validation
    if (!todoData.title || todoData.title.trim().length === 0) {
      throw new AppError('Title is required', 400);
    }

    const updatedTodo = await todoRepository.update(id, todoData);

    logger.info('Todo updated successfully', { todoId: id });

    return res.json(updatedTodo);
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    logger.error('Error updating todo', { error, todoId: req.params.id, body: req.body });
    throw new AppError('Failed to update todo', 500);
  }
});

/**
 * @route PATCH /todos/:id
 * @description Partially update todo
 */
router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const todoData: Partial<Todo> = req.body;

    // Check if todo exists
    const existingTodo = await todoRepository.findById(id);
    if (!existingTodo) {
      throw new AppError('Todo not found', 404);
    }

    // Validate title if provided
    if (todoData.title !== undefined && todoData.title.trim().length === 0) {
      throw new AppError('Title cannot be empty', 400);
    }

    const updatedTodo = await todoRepository.update(id, todoData);

    logger.info('Todo patched successfully', { todoId: id });

    return res.json(updatedTodo);
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    logger.error('Error patching todo', { error, todoId: req.params.id, body: req.body });
    throw new AppError('Failed to patch todo', 500);
  }
});

/**
 * @route DELETE /todos/:id
 * @description Delete a todo
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if todo exists
    const existingTodo = await todoRepository.findById(id);
    if (!existingTodo) {
      throw new AppError('Todo not found', 404);
    }

    const deleted = await todoRepository.delete(id);
    
    if (!deleted) {
      throw new AppError('Failed to delete todo', 500);
    }

    logger.info('Todo deleted successfully', { todoId: id });

    return res.status(204).send();
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    logger.error('Error deleting todo', { error, todoId: req.params.id });
    throw new AppError('Failed to delete todo', 500);
  }
});

export default router;