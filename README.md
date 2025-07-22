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
- **API Documentation**: `GET /api/v1` (Coming in Task 3)

## 🏗️ Architecture

This project follows contract-first development principles:

- **OpenAPI Specification**: Single source of truth for API design
- **TypeScript**: Type safety throughout the application
- **Express.js**: Web framework with security middleware
- **PostgreSQL**: Relational database with proper indexing
- **Docker**: Containerized development and deployment

## 📁 Project Structure

```
src/
├── config/          # Configuration management
├── controllers/     # Request handlers (Task 3)
├── middleware/      # Express middleware
├── models/          # Database models (Task 2)
├── routes/          # Route definitions
├── services/        # Business logic (Task 3)
├── types/           # TypeScript type definitions
├── utils/           # Utility functions
└── server.ts        # Application entry point

tests/
├── unit/            # Unit tests (Task 5)
├── integration/     # Integration tests (Task 5)
└── e2e/             # End-to-end tests (Task 5)
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
- `npm run test` - Run tests (Task 5)
- `npm run lint` - Lint code
- `npm run docker:up` - Start all services with Docker
- `npm run docker:down` - Stop all Docker services

## 🔒 Security Features

- **Helmet.js** for security headers
- **CORS** configuration
- **Rate limiting** to prevent abuse
- **Input validation** and sanitization
- **JWT** authentication (Task 3)
- **API key** support (Task 3)

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
- [ ] **Task 2**: Database Schema & ORM Implementation
- [ ] **Task 3**: Contract-First API Core Implementation
- [ ] **Task 4**: Advanced Features & Security
- [ ] **Task 5**: Testing & Quality Assurance
- [ ] **Task 6**: Production Readiness & Monitoring

## 🤝 Contributing

1. Ensure all tests pass: `npm test`
2. Follow the established code style
3. Update documentation as needed
4. Maintain 80%+ test coverage

## 📄 License

MIT License - see LICENSE file for details.