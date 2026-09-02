const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "CineVenue API",
      version: "1.0.0",
      description: "Backend API documentation for CineVenue application"
    },
    servers: [
      {
        url: "http://localhost:5000/api",
        description: "Local Server"
      }
    ]
  },
  apis: ["./routes/*.js"]
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = {
  swaggerUi,
  swaggerSpec
};
