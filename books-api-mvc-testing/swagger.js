const swaggerAutogen = require("swagger-autogen")();

const outputFile = "./swagger-output.json";
const routes = ["./app.js"];

const doc = {
  info: {
    title: "Books & Users API",
    description: "A comprehensive API for managing books and users with full CRUD operations",
    version: "1.0.0"
  },
  host: "localhost:3000",
  schemes: ["http"],
  tags: [
    {
      name: "Books",
      description: "Operations related to books"
    },
    {
      name: "Users", 
      description: "Operations related to users"
    }
  ],
  definitions: {
    Book: {
      id: 1,
      title: "The Great Gatsby",
      author: "F. Scott Fitzgerald"
    },
    User: {
      id: 1,
      username: "john_doe",
      email: "john@example.com"
    },
    BookInput: {
      title: "Book Title",
      author: "Author Name"
    },
    UserInput: {
      username: "username",
      email: "user@example.com"
    },
    Error: {
      error: "Error message"
    }
  }
};

swaggerAutogen(outputFile, routes, doc).then(() => {
  console.log("Swagger documentation generated successfully!");
  console.log("Run your app and visit http://localhost:3000/api-docs to view the documentation");
});