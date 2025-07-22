# TODO Service API

A contract-first REST API for managing TODO items, built with Node.js, TypeScript, Express, and PostgreSQL.

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- Docker & Docker Compose
- Git

### Development Setup

1. **Clone and setup**
   ```bash
   git clone <repository-url>
   cd todo-service-api
   cp .env.example .env
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start with Docker (Recommended)**
   ```bash
   npm run docker:up
   ```

4. **Or start locally**
   ```bash
   npm run dev
   ```

### API Endpoints

- **Health Check**: `GET /health`
- **API Documentation**: `GET /docs` (Swagger UI)
- **List TODOs**: `GET /api/v1/todos` or `GET /v1/todos`
- **Create TODO**: `POST /api/v1/todos` or `POST /v1/todos`
- **Get TODO**: `GET /api/v1/todos/{id}`
- **Update TODO**: `PUT /api/v1/todos/{id}` or `PATCH /api/v1/todos/{id}`
- **Delete TODO**: `DELETE /api/v1/todos/{id}`

## 🏗️ Architecture

This project follows contract-first development principles:

- **OpenAPI Specification**: Single source of truth for API design
- **TypeScript**: Type safety throughout the application
- **Express.js**: Web framework with security middleware
- **PostgreSQL**: Relational database with TypeORM integration
- **TypeORM**: Object-relational mapping with decorator pattern
- **Docker**: Containerized development and deployment

## 📁 Project Structure

```
src/
├── config/          # Environment configuration & database setup
│   ├── config.ts    # Zod validation for environment variables
│   └── database.ts  # TypeORM DataSource configuration
├── entities/        # TypeORM database entities
│   ├── Todo.ts      # Main Todo entity with relationships
│   ├── SubTask.ts   # SubTask entity with cascade delete
│   └── User.ts      # User entity for authentication
├── middleware/      # Express middleware (error handling, CORS)
├── repositories/    # Data access layer with repository pattern
│   └── TodoRepository.ts # Complex querying and filtering
├── routes/          # Route definitions (health, docs, todos)
│   ├── health.ts    # Health check endpoints
│   ├── docs.ts      # Swagger UI configuration
│   └── simple-todos-db.ts # TODO CRUD with PostgreSQL backend
├── seeds/           # Database seeding scripts
│   └── initial-data.ts # Demo data creation
├── utils/           # Utility functions (logger, async handlers)
├── app.ts           # Express app setup and middleware stack
└── server.ts        # Application entry point with DB initialization

todo-service-api.yaml # Complete OpenAPI 3.0.3 specification
docker-compose.yml   # PostgreSQL + API containerization
scripts/init-db.sql  # Database schema initialization
```

## 🛠️ Development

### VS Code Setup

The project includes pre-configured VS Code settings:

- **Debug configurations** for app and tests
- **Recommended extensions**
- **Task runner** for common operations

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm run start` - Start production server
- `npm run db:seed` - Seed database with demo data
- `npm run test` - Run tests (Task 5)
- `npm run lint` - Lint code
- `npm run docker:up` - Start all services with Docker
- `npm run docker:down` - Stop all Docker services

## 🔒 Security Features

- **Helmet.js** for security headers (disabled in development)
- **CORS** manual implementation with permissive development settings
- **Rate limiting** to prevent abuse (disabled in development)
- **Input validation** and sanitization (planned)
- **JWT** authentication (planned)
- **API key** support (planned)

## 📊 Monitoring & Health Checks

- `GET /health` - Basic health check
- `GET /health/ready` - Kubernetes readiness probe
- `GET /health/live` - Kubernetes liveness probe

## 🐳 Docker Support

The project includes:

- **Development Dockerfile** with hot reload
- **Docker Compose** for full stack development
- **PostgreSQL** container with persistent storage
- **Health checks** for all services

## 📈 Performance Targets

- Single item operations: < 100ms (95th percentile)
- List operations: < 200ms (95th percentile)
- Bulk operations: < 500ms for up to 100 items

## 🧪 Testing Strategy (Task 5)

- **Unit Tests**: Individual function testing
- **Integration Tests**: API endpoint testing
- **Contract Tests**: OpenAPI compliance
- **Load Tests**: Performance validation
- **Security Tests**: Authentication & authorization

## 📝 Implementation Status

- [x] **Task 1**: Development Environment & Infrastructure Setup
- [x] **Task 2**: OpenAPI Specification & Contract Definition
- [x] **Task 3**: Basic CRUD API Implementation (Database-Backed)
- [x] **Task 4**: Database Integration & ORM Implementation (TypeORM + PostgreSQL)
- [x] **Task 9**: Swagger UI Documentation Integration
- [ ] **Task 5**: Testing & Quality Assurance
- [ ] **Task 6**: Production Readiness & Monitoring

### Current Features ✅

- Complete OpenAPI 3.0.3 specification with all endpoints defined
- Interactive Swagger UI documentation at `/docs`
- Full CRUD operations with PostgreSQL database persistence
- TypeORM entities with proper relationships and decorators
- Repository pattern for data access with complex querying
- Database seeding with demo data (`npm run db:seed`)
- Health check endpoints for monitoring
- Docker Compose setup with PostgreSQL
- Development-friendly CORS configuration
- TypeScript with strict type checking
- Structured logging with Winston

### Next Steps 🚧

- Implement authentication and authorization (JWT + API keys)
- Add comprehensive test coverage (Jest + Supertest)
- Production security hardening (rate limiting, input validation)
- Advanced features (filtering, pagination, bulk operations, search)

## 🤝 Contributing

1. Ensure all tests pass: `npm test`
2. Follow the established code style
3. Update documentation as needed
4. Maintain 80%+ test coverage

## 📄 License

MIT License - see LICENSE file for details.