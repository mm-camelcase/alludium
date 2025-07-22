import { Repository } from 'typeorm';
import { AppDataSource } from '@/config/database';
import { Todo, TodoStatus, TodoPriority } from '@/entities/Todo';

export interface TodoFilters {
  status?: TodoStatus;
  priority?: TodoPriority;
  userId?: string;
  tags?: string[];
  dueAfter?: Date;
  dueBefore?: Date;
  search?: string;
}

export interface TodoListOptions {
  page?: number;
  limit?: number;
  sort?: string;
  filters?: TodoFilters;
}

export class TodoRepository {
  private repository: Repository<Todo>;

  constructor() {
    this.repository = AppDataSource.getRepository(Todo);
  }

  async findAll(options: TodoListOptions = {}) {
    const {
      page = 1,
      limit = 20,
      sort = 'createdAt:desc',
      filters = {}
    } = options;

    const queryBuilder = this.repository.createQueryBuilder('todo')
      .leftJoinAndSelect('todo.subTasks', 'subTask')
      .leftJoinAndSelect('todo.user', 'user');

    // Apply filters
    if (filters.status) {
      queryBuilder.andWhere('todo.status = :status', { status: filters.status });
    }

    if (filters.priority) {
      queryBuilder.andWhere('todo.priority = :priority', { priority: filters.priority });
    }

    if (filters.userId) {
      queryBuilder.andWhere('todo.userId = :userId', { userId: filters.userId });
    }

    if (filters.tags && filters.tags.length > 0) {
      queryBuilder.andWhere('todo.tags && :tags', { tags: filters.tags });
    }

    if (filters.dueAfter) {
      queryBuilder.andWhere('todo.dueDate > :dueAfter', { dueAfter: filters.dueAfter });
    }

    if (filters.dueBefore) {
      queryBuilder.andWhere('todo.dueDate < :dueBefore', { dueBefore: filters.dueBefore });
    }

    if (filters.search) {
      queryBuilder.andWhere(
        '(todo.title ILIKE :search OR todo.description ILIKE :search)',
        { search: `%${filters.search}%` }
      );
    }

    // Apply sorting
    const [sortField, sortDirection] = sort.split(':');
    const direction = (sortDirection?.toUpperCase() === 'DESC') ? 'DESC' : 'ASC';
    
    if (sortField === 'title' || sortField === 'status' || sortField === 'priority' || 
        sortField === 'createdAt' || sortField === 'updatedAt' || sortField === 'dueDate') {
      queryBuilder.orderBy(`todo.${sortField}`, direction);
    } else {
      queryBuilder.orderBy('todo.createdAt', 'DESC');
    }

    // Apply pagination
    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);

    const [items, total] = await queryBuilder.getManyAndCount();

    return {
      items,
      total,
      page,
      limit,
      hasMore: offset + items.length < total
    };
  }

  async findById(id: string): Promise<Todo | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['subTasks', 'user']
    });
  }

  async create(todoData: Partial<Todo>): Promise<Todo> {
    const todo = this.repository.create(todoData);
    return this.repository.save(todo);
  }

  async update(id: string, todoData: Partial<Todo>): Promise<Todo | null> {
    await this.repository.update(id, todoData);
    return this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return result.affected !== 0;
  }

  async count(filters: TodoFilters = {}): Promise<number> {
    const queryBuilder = this.repository.createQueryBuilder('todo');

    if (filters.status) {
      queryBuilder.andWhere('todo.status = :status', { status: filters.status });
    }

    if (filters.userId) {
      queryBuilder.andWhere('todo.userId = :userId', { userId: filters.userId });
    }

    return queryBuilder.getCount();
  }
}