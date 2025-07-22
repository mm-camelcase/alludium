import { Router } from 'express';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';

const router = Router();

// Load OpenAPI specification
const openApiPath = path.join(__dirname, '../../todo-service-api.yaml');
let openApiSpec: any;

try {
  openApiSpec = YAML.load(openApiPath);
} catch (error) {
  console.error('❌ Failed to load OpenAPI specification:', error);
  openApiSpec = {
    openapi: '3.0.3',
    info: {
      title: 'TODO Service API',
      version: 'v1',
      description: 'OpenAPI specification file not found'
    },
    paths: {}
  };
}

// Swagger UI options with Try it out enabled
const swaggerOptions = {
  explorer: true,
  swaggerOptions: {
    docExpansion: 'list',
    filter: true,
    showRequestHeaders: true,
    showCommonExtensions: true,
    tryItOutEnabled: true,
    supportedSubmitMethods: ['get', 'post', 'put', 'delete', 'patch', 'head', 'options']
  },
  customSiteTitle: 'TODO Service API Documentation',
  customCss: `
    .swagger-ui .topbar { display: none }
    .swagger-ui .info .title { color: #3b4151; }
  `
};

// Add CORS middleware specifically for Swagger UI assets
router.use('/', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', '*');
  res.removeHeader('Content-Security-Policy');
  next();
});

// Serve Swagger UI directly with the spec
router.use('/', swaggerUi.serve);
router.get('/', (req, res, next) => {
  // Add CORS headers to the documentation page itself
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', '*');
  
  // Remove restrictive CSP for Swagger UI to work properly
  res.removeHeader('Content-Security-Policy');
  
  // Setup Swagger UI with the loaded spec
  const swaggerUiHandler = swaggerUi.setup(openApiSpec, swaggerOptions);
  swaggerUiHandler(req, res, next);
});

export default router;