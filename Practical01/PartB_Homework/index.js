const express = require("express");
const app = express();
const PORT = 3000;

app.get("/", (req, res) => {
  res.send("Welcome to Homework API");
});

// Define route for Intro Page
app.get("/intro", (req, res) => {
    res.send("Hi, I’m Shawntrice, born and bred in Singapore. I’m someone who believes in working hard and staying humble. Always keen to grow, meet new people, and take on new challenges.");
  });
  
  // Define route for Name Page
  app.get("/name", (req, res) => {
    res.send("Shawntrice Yip");
  });

  // Define route for Hobbies Page
  app.get("/hobbies", (req, res) => {
    res.send("Tennis");
  });

  // Define route for Food Page
  app.get("/food", (req, res) => {
    res.send("Steaks");
  });
  
  // Listen on the port after defining routes
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });