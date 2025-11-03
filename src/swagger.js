import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API REST - Sistema de Reservas de Salones",
      version: "1.0.0",
      description:
        "Documentación de la API del Trabajo Final Integrador (PROGIII). Incluye autenticación, gestión de salones, servicios, usuarios, reservas y reportes.",
    },
    servers: [
      {
        url: "http://localhost:3000/api/v1",
        description: "Servidor local de desarrollo",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ["./src/v1/routes/*.js"], // Swagger buscará los comentarios en las rutas
};

export const swaggerSpec = swaggerJSDoc(options);

export const swaggerDocs = (app) => {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  console.log("Documentación Swagger disponible en: http://localhost:3000/api-docs");
};