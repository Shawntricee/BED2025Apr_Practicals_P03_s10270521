const express = require("express");
const app = express();
const PORT = 3000;

app.get("/", (req, res) => {
  res.send("Hello from Express!");
});

// Define route for About Page
app.get("/about", (req, res) => {
    res.send("About Page");
  });
  
  // Define route for Contact Page
  app.get("/contact", (req, res) => {
    res.send("Contact Page");
  });
  
  // Listen on the port after defining routes
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });