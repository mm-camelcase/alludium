# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **TODO Service API** built using contract-first development principles with Node.js, TypeScript, Express.js, and PostgreSQL. The project follows a phased implementation approach and uses Task Master AI for project management.

## Task Master AI Integration

**Import Task Master's development workflow commands and guidelines, treat as if import is in the main CLAUDE.md file.**
@./.taskmaster/CLAUDE.md

## Build & Development Commands

```bash
# Development
npm run dev                    # Start dev server with hot reload (nodemon + ts-node)
npm run build                  # Compile TypeScript to dist/
npm start                      # Run production server

# Docker
npm run docker:up              # Start all services (PostgreSQL + API)
npm run docker:down            # Stop all services
npm run docker:logs            # View container logs

# Code Quality
npm run lint                   # Run ESLint
npm run lint:fix              # Fix ESLint issues
npm test                       # Run Jest tests (when implemented)
npm run test:watch            # Run tests in watch mode
npm run test:coverage         # Generate coverage report

# Database
npm run db:seed               # Seed development data with demo TODOs and users
typeorm                       # TypeORM CLI commands
```

## Architecture & Key Patterns

### Contract-First Development
- **OpenAPI Specification** (`todo-service-api.yaml`) is the single source of truth
- Complete specification with all CRUD endpoints, schemas, and documentation
- Swagger UI available at `/docs` for interactive testing
- All endpoints implemented in `src/routes/simple-todos-db.ts` with PostgreSQL backend match the contract exactly

### Layered Architecture
```
src/
├── config/          # Environment configuration with Zod validation, TypeORM setup
├── entities/        # TypeORM entity definitions (Todo, User, SubTask)
├── middleware/      # Cross-cutting concerns (auth, logging, errors)
├── repositories/    # Data access layer with repository pattern
├── routes/          # Express route definitions with database integration
├── seeds/           # Database seeding scripts
├── utils/           # Shared utilities (logger, asyncHandler)
└── server.ts        # Application entry point with database initialization
```

### TypeScript Path Aliases
- Use `@/` prefix for absolute imports: `import { config } from '@/config/config'`
- Configured in `tsconfig.json` with `tsconfig-paths` for runtime resolution

### Environment Configuration
- **Zod-validated** configuration in `src/config/config.ts`
- Fails fast on invalid environment variables
- Type-safe `config` object available throughout the app

### Error Handling
- Global error handler in `src/middleware/errorHandler.ts`
- Custom `AppError` class for operational errors
- Environment-specific error responses (detailed in dev, sanitized in prod)

### Security Middleware Stack
1. **Helmet.js** - Security headers (currently disabled for development)
2. **CORS** - Manual implementation with permissive settings for development
3. **Rate Limiting** - IP-based limiting (currently disabled for development)
4. **Body Size Limits** - 10MB max for JSON/URL-encoded
5. **Global OPTIONS handler** - Handles preflight requests for CORS

### Logging Strategy
- Winston logger with structured JSON logging
- Request/response logging middleware
- File rotation for production logs
- Different log levels per environment

### Health Monitoring
- `/health` - Basic health check with service status
- `/health/ready` - Kubernetes readiness probe (checks startup time)
- `/health/live` - Kubernetes liveness probe (simple ping)

## Database Architecture (Completed)

### PostgreSQL Configuration
- Version 16 (Alpine) in Docker
- Custom schema: `todo_app` for isolation
- Extensions: `uuid-ossp`, `pg_trgm` (for search)
- Connection pooling via TypeORM DataSource
- Auto-sync enabled in development environment

### Implemented TypeORM Schema
```typescript
// Todo Entity (src/entities/Todo.ts)
@Entity('todos')
class Todo {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() title: string;
  @Column({ nullable: true }) description?: string;
  @Column({ enum: ['pending', 'in-progress', 'completed', 'deferred', 'cancelled'] }) status: TodoStatus;
  @Column({ enum: ['low', 'medium', 'high'] }) priority: TodoPriority;
  @Column({ nullable: true }) dueDate?: Date;
  @Column({ type: 'simple-array', nullable: true }) tags?: string[];
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
  @OneToMany(() => SubTask, subTask => subTask.todo, { cascade: true }) subTasks?: SubTask[];
  @ManyToOne(() => User, { nullable: true }) user?: User;
}

// SubTask Entity (src/entities/SubTask.ts)
@Entity('sub_tasks')
class SubTask {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() title: string;
  @Column({ nullable: true }) description?: string;
  @Column({ enum: ['pending', 'in-progress', 'completed'] }) status: SubTaskStatus;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
  @ManyToOne(() => Todo, todo => todo.subTasks, { onDelete: 'CASCADE' }) todo: Todo;
}

// User Entity (src/entities/User.ts) - For future authentication
@Entity('users')
class User {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ unique: true }) email: string;
  @Column() passwordHash: string;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
  @OneToMany(() => Todo, todo => todo.user) todos?: Todo[];
}
```

### TypeORM Features Used
- **Decorators**: `@Entity`, `@Column`, `@PrimaryGeneratedColumn`, `@CreateDateColumn`, `@UpdateDateColumn`
- **Relationships**: `@OneToMany`, `@ManyToOne`, `@JoinColumn` with cascade options
- **Enum Types**: Status and priority columns with type safety
- **UUID Generation**: Primary keys use PostgreSQL uuid generation
- **Automatic Timestamps**: Created/updated timestamps managed by TypeORM
- **Query Builder**: Complex filtering in TodoRepository with joins and pagination

### Performance Indexing Strategy
- Primary keys on all tables (UUID type)
- Foreign key indexes (auto-created by TypeORM)
- Composite index on (user_id, status, created_at) for filtered queries (planned)
- Text search index on title/description (using pg_trgm) (planned)

## Implementation Status

Current implementation follows these phases:

1. ✅ **Task 1**: Development Environment & Infrastructure Setup
   - Docker setup, TypeScript config, basic Express server, health checks

2. ✅ **Task 2**: OpenAPI Specification & Contract Definition
   - Complete OpenAPI 3.0.3 specification in `todo-service-api.yaml`
   - Comprehensive schemas for TodoItem, SubTask, Error types, Pagination
   - Full endpoint definitions with request/response schemas

3. ✅ **Task 3**: Basic CRUD API Implementation
   - Database-backed TODO storage with TypeORM (`src/routes/simple-todos-db.ts`)
   - All CRUD operations: GET, POST, PUT, PATCH, DELETE
   - Swagger UI documentation at `/docs` endpoint
   - CORS configuration for development

4. ✅ **Task 4**: Database Integration & ORM Implementation
   - PostgreSQL database with custom `todo_app` schema
   - TypeORM entities: Todo, SubTask, User with proper relationships
   - Repository pattern implementation for data access
   - Database seeding with initial demo data
   - Persistent storage replacing in-memory implementation

5. ⏳ **Task 5**: Testing & Quality Assurance
   - Jest setup, unit/integration tests, contract testing, 80%+ coverage

6. ⏳ **Task 6**: Production Readiness & Monitoring
   - Production Docker, structured logging, metrics, deployment guides

## Docker Development

### Container Architecture
- **API Service**: Node.js 20 Alpine with non-root user
- **PostgreSQL**: Version 16 with persistent volumes
- **Networking**: Bridge network for service communication

### Health Checks
- API: HTTP check on `/health` endpoint
- PostgreSQL: `pg_isready` command
- Proper startup dependencies with `depends_on`

### Development Features
- Volume mounts for hot reload
- Debug port exposed (9229)
- Environment variable injection
- Automatic database initialization

## VS Code Integration

### Debug Configurations
- **Launch App**: Direct TypeScript debugging
- **Debug Tests**: Jest test debugging
- **Attach to Docker**: Remote debugging for containerized app

### Recommended Extensions
- TypeScript/ESLint/Prettier for code quality
- Docker/PostgreSQL for infrastructure
- REST Client/Thunder Client for API testing
- OpenAPI editor for contract development

## Testing Strategy (Task 5)

### Test Structure
```
tests/
├── unit/         # Isolated function tests
├── integration/  # API endpoint tests with test DB
└── e2e/         # Full user journey tests
```

### Testing Stack
- **Jest** with TypeScript support
- **Supertest** for HTTP assertions
- **Test Containers** for real PostgreSQL
- **OpenAPI compliance** testing

## Performance Targets

- Single item operations: < 100ms (95th percentile)
- List operations: < 200ms (95th percentile)  
- Bulk operations: < 500ms for 100 items
- Health checks: < 50ms response time

## Security Considerations

### Authentication Strategy
- **JWT tokens** for user sessions (Bearer auth)
- **API keys** for service-to-service (X-API-Key header)
- **bcrypt** with 12 salt rounds for passwords
- Configurable token expiration

### Input Validation
- Request validation via express-validator or Joi
- OpenAPI schema validation (Task 3)
- SQL injection prevention via parameterized queries
- XSS protection through proper escaping

## Common Development Tasks

### Adding a New Endpoint
1. Update OpenAPI spec (`todo-service-api.yaml`)
2. Generate/update route from spec
3. Implement controller logic
4. Add service layer if needed
5. Write tests (unit + integration)
6. Update Task Master status

### Database Changes
1. Update TypeORM entity definitions in `src/entities/`
2. Test schema synchronization in development
3. Update seed data in `src/seeds/initial-data.ts` if needed
4. Run `npm run db:seed` to populate test data
5. Document in Task Master

### Debugging Issues
1. Check logs in `logs/` directory
2. Use VS Code debugger with breakpoints
3. Docker logs: `npm run docker:logs`
4. Database queries: Check ORM debug mode

## Current API Endpoints

The API is currently implemented with PostgreSQL database backend and provides:

- **GET /api/v1/todos** or **GET /v1/todos** - List all TODOs with pagination/filtering
- **POST /api/v1/todos** or **POST /v1/todos** - Create new TODO
- **GET /api/v1/todos/{id}** - Get specific TODO by ID
- **PUT /api/v1/todos/{id}** - Replace entire TODO
- **PATCH /api/v1/todos/{id}** - Partial update TODO
- **DELETE /api/v1/todos/{id}** - Delete TODO
- **GET /docs** - Swagger UI documentation
- **GET /health** - Health check endpoint

## Critical Files to Understand

### Core Configuration & Setup
- `src/config/config.ts` - Environment configuration and validation
- `src/config/database.ts` - TypeORM DataSource configuration and initialization
- `src/app.ts` - Express app setup and middleware stack (CORS, logging, routes)
- `src/server.ts` - Application entry point with database connection startup

### Database Layer
- `src/entities/Todo.ts` - Main Todo entity with TypeORM decorators
- `src/entities/SubTask.ts` - SubTask entity with Todo relationship
- `src/entities/User.ts` - User entity for future authentication
- `src/repositories/TodoRepository.ts` - Repository pattern with complex querying
- `src/seeds/initial-data.ts` - Database seeding script with demo data

### API Layer
- `src/routes/simple-todos-db.ts` - Database-backed TODO CRUD implementation
- `src/routes/docs.ts` - Swagger UI configuration and OpenAPI spec serving
- `src/routes/health.ts` - Health check endpoints
- `src/middleware/errorHandler.ts` - Global error handling with async support
- `src/utils/asyncHandler.ts` - Async route handler wrapper

### Infrastructure
- `docker-compose.yml` - Container orchestration (API + PostgreSQL with full env vars)
- `todo-service-api.yaml` - Complete API contract specification
- `scripts/init-db.sql` - Database initialization script for Docker