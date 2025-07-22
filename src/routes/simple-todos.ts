import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

const todos = [
  {
    id: "123e4567-e89b-12d3-a456-426614174000",
    title: "Complete project documentation",
    description: "Write comprehensive API documentation including examples",
    status: "in-progress",
    priority: "high",
    dueDate: "2024-12-31T23:59:59Z",
    tags: ["work", "documentation", "api"],
    createdAt: "2024-01-01T10:00:00Z",
    updatedAt: "2024-01-01T10:30:00Z",
    userId: "456e7890-e12b-34d5-a678-901234567890",
    subTasks: [
      {
        id: "789e0123-e45b-67d8-a901-234567890123",
        title: "Write API reference",
        completed: true
      },
      {
        id: "012e3456-e78b-90d1-a234-567890123456",
        title: "Create usage examples",
        completed: false
      }
    ]
  },
  {
    id: "789e0123-e45b-67d8-a901-234567890124",
    title: "Review code changes",
    status: "pending",
    priority: "medium",
    tags: ["review"],
    createdAt: "2024-01-01T09:00:00Z",
    updatedAt: "2024-01-01T09:00:00Z",
    userId: "456e7890-e12b-34d5-a678-901234567890",
    subTasks: []
  }
];

router.get('/', (req, res) => {
  return res.json({
    items: todos,
    total: todos.length,
    page: 1,
    limit: 20,
    hasMore: false
  });
});

router.post('/', (req, res) => {
  const newTodo = {
    id: uuidv4(),
    title: req.body.title || 'New TODO',
    description: req.body.description || '',
    status: req.body.status || 'pending',
    priority: req.body.priority || 'medium',
    dueDate: req.body.dueDate || null,
    tags: req.body.tags || [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    userId: '456e7890-e12b-34d5-a678-901234567890',
    subTasks: req.body.subTasks || []
  };
  
  todos.push(newTodo);
  return res.status(201).json(newTodo);
});

router.get('/:id', (req, res) => {
  const todo = todos.find(t => t.id === req.params.id);
  if (!todo) {
    return res.status(404).json({ message: 'TODO not found' });
  }
  return res.json(todo);
});

router.put('/:id', (req, res) => {
  const todoIndex = todos.findIndex(t => t.id === req.params.id);
  if (todoIndex === -1) {
    return res.status(404).json({ message: 'TODO not found' });
  }
  
  const updatedTodo = {
    ...todos[todoIndex],
    ...req.body,
    id: req.params.id,
    updatedAt: new Date().toISOString()
  };
  
  todos[todoIndex] = updatedTodo;
  return res.json(updatedTodo);
});

router.patch('/:id', (req, res) => {
  const todoIndex = todos.findIndex(t => t.id === req.params.id);
  if (todoIndex === -1) {
    return res.status(404).json({ message: 'TODO not found' });
  }
  
  const updatedTodo = {
    ...todos[todoIndex],
    ...req.body,
    id: req.params.id,
    updatedAt: new Date().toISOString()
  };
  
  todos[todoIndex] = updatedTodo;
  return res.json(updatedTodo);
});

router.delete('/:id', (req, res) => {
  const todoIndex = todos.findIndex(t => t.id === req.params.id);
  if (todoIndex === -1) {
    return res.status(404).json({ message: 'TODO not found' });
  }
  
  todos.splice(todoIndex, 1);
  return res.status(204).send();
});

export default router;