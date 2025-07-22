import { Router } from 'express';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';
import fs from 'fs';

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

// Swagger UI options
const swaggerOptions = {
  explorer: true,
  swaggerOptions: {
    url: '/docs/openapi.json',
    docExpansion: 'none',
    filter: true,
    showRequestHeaders: true,
    showCommonExtensions: true,
    tryItOutEnabled: true
  },
  customCss: `
    .swagger-ui .topbar { display: none }
    .swagger-ui .info .title { color: #3b4151; }
    .swagger-ui .scheme-container { background: #f7f7f7; padding: 15px; border-radius: 4px; margin: 15px 0; }
  `,
  customSiteTitle: 'TODO Service API Documentation',
  customfavIcon: '/favicon.ico'
};

/**
 * @route GET /docs/openapi.json
 * @description Get OpenAPI specification in JSON format
 * @access Public
 */
router.get('/openapi.json', (req, res) => {
  try {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // Update server URLs dynamically based on the request
    const spec = { ...openApiSpec };
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    
    if (spec.servers) {
      spec.servers = spec.servers.map((server: any) => {
        if (server.url.includes('localhost')) {
          return {
            ...server,
            url: `${baseUrl}/api/v1`
          };
        }
        return server;
      });
    }
    
    res.json(spec);
  } catch (error) {
    console.error('❌ Error serving OpenAPI spec:', error);
    res.status(500).json({
      error: 'Failed to load OpenAPI specification',
      message: 'The OpenAPI specification file could not be loaded'
    });
  }
});

/**
 * @route GET /docs
 * @description Serve Swagger UI documentation
 * @access Public
 */
router.use('/', swaggerUi.serve);
router.get('/', swaggerUi.setup(openApiSpec, swaggerOptions));

export default router;