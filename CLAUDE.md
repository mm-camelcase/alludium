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

# Database (to be implemented in Task 2)
npm run db:migrate            # Run database migrations
npm run db:seed               # Seed development data
npm run db:reset              # Reset database
```

## Architecture & Key Patterns

### Contract-First Development
- **OpenAPI Specification** (`todo-service-api.yaml`) is the single source of truth
- API routes and validation will be generated from the spec (Task 3)
- All endpoints must match the OpenAPI contract exactly

### Layered Architecture
```
src/
├── config/          # Environment configuration with Zod validation
├── controllers/     # HTTP request/response handling (Task 3)
├── middleware/      # Cross-cutting concerns (auth, logging, errors)
├── models/          # Database entities & ORM models (Task 2)  
├── routes/          # Express route definitions
├── services/        # Business logic layer (Task 3)
├── types/           # TypeScript type definitions
└── utils/           # Shared utilities (logger, validators)
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
1. **Helmet.js** - Security headers (CSP, XSS protection, etc.)
2. **CORS** - Configured origins from environment
3. **Rate Limiting** - IP-based limiting with configurable windows
4. **Body Size Limits** - 10MB max for JSON/URL-encoded

### Logging Strategy
- Winston logger with structured JSON logging
- Request/response logging middleware
- File rotation for production logs
- Different log levels per environment

### Health Monitoring
- `/health` - Basic health check with service status
- `/health/ready` - Kubernetes readiness probe (checks startup time)
- `/health/live` - Kubernetes liveness probe (simple ping)

## Database Architecture (Task 2)

### PostgreSQL Configuration
- Version 16 (Alpine) in Docker
- Custom schema: `todo_app` for isolation
- Extensions: `uuid-ossp`, `pg_trgm` (for search)
- Connection pooling via ORM

### Planned Schema
```sql
-- Users (authentication)
- id, email, password_hash, created_at, updated_at

-- Todos (core entity)
- id, user_id, title, description, status, priority, due_date, created_at, updated_at

-- Tags (categorization)
- id, name, created_at, updated_at

-- TodoTags (many-to-many)
- todo_id, tag_id

-- ApiKeys (alternative auth)
- id, user_id, key_hash, name, created_at, expires_at
```

### Performance Indexing Strategy
- Primary keys on all tables
- Foreign key indexes
- Composite index on (user_id, status, created_at) for filtered queries
- Text search index on title/description (using pg_trgm)

## Implementation Status

Current implementation follows these phases:

1. ✅ **Task 1**: Development Environment & Infrastructure Setup
   - Docker setup, TypeScript config, basic Express server, health checks

2. ⏳ **Task 2**: Database Schema & ORM Implementation
   - PostgreSQL schema, Prisma/TypeORM setup, migrations, seed data

3. ⏳ **Task 3**: Contract-First API Core Implementation  
   - OpenAPI integration, CRUD operations, JWT/API key auth, validation

4. ⏳ **Task 4**: Advanced Features & Security
   - Filtering/pagination, bulk operations, rate limiting, search

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
1. Update Prisma/TypeORM schema
2. Generate migration
3. Test migration locally
4. Update seed data if needed
5. Document in Task Master

### Debugging Issues
1. Check logs in `logs/` directory
2. Use VS Code debugger with breakpoints
3. Docker logs: `npm run docker:logs`
4. Database queries: Check ORM debug mode

## Critical Files to Understand

- `src/config/config.ts` - Environment configuration and validation
- `src/app.ts` - Express app setup and middleware stack
- `src/middleware/errorHandler.ts` - Global error handling
- `docker-compose.yml` - Container orchestration
- `todo-service-api.yaml` - API contract specification