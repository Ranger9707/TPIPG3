const swaggerAutogen = require('swagger-autogen')();

const doc = {
  info: {
    title: 'API de Reservas de Salones (PROGIII)',
    version: '1.0.0',
    description: 'Documentación auto-generada para la API del Trabajo Final Integrador.'
  },
  host: 'localhost:3000', 
  schemes: ['http'],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      }
    }
  },
  security: [
    {
      bearerAuth: []
    }
  ]
};

const outputFile = './swagger-output.json';

const endpointsFiles = ['./src/appReservas.js']; 

swaggerAutogen(outputFile, endpointsFiles, doc);