// Get references to form elements
const createBookForm = document.getElementById("createBookForm");
const messageDiv = document.getElementById("message");
const apiBaseUrl = "http://localhost:3000";

// Function to display messages
function showMessage(text, type = "info") {
  messageDiv.textContent = text;
  messageDiv.style.padding = "10px";
  messageDiv.style.borderRadius = "4px";
  messageDiv.style.marginTop = "15px";
  messageDiv.style.fontWeight = "bold";
  
  switch(type) {
    case "success":
      messageDiv.style.backgroundColor = "#d4edda";
      messageDiv.style.color = "#155724";
      messageDiv.style.border = "1px solid #c3e6cb";
      break;
    case "error":
      messageDiv.style.backgroundColor = "#f8d7da";
      messageDiv.style.color = "#721c24";
      messageDiv.style.border = "1px solid #f5c6cb";
      break;
    case "warning":
      messageDiv.style.backgroundColor = "#fff3cd";
      messageDiv.style.color = "#856404";
      messageDiv.style.border = "1px solid #ffeaa7";
      break;
    default:
      messageDiv.style.backgroundColor = "#d1ecf1";
      messageDiv.style.color = "#0c5460";
      messageDiv.style.border = "1px solid #bee5eb";
  }
}

// Handle form submission
createBookForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const titleInput = document.getElementById("title");
  const authorInput = document.getElementById("author");

  const newBookData = {
    title: titleInput.value.trim(),
    author: authorInput.value.trim(),
  };

  // Basic client-side validation
  if (!newBookData.title || !newBookData.author) {
    showMessage("Please fill in all required fields.", "error");
    return;
  }

  if (newBookData.title.length > 50) {
    showMessage("Title cannot exceed 50 characters.", "error");
    return;
  }

  if (newBookData.author.length > 50) {
    showMessage("Author name cannot exceed 50 characters.", "error");
    return;
  }

  try {
    showMessage("Creating book...", "info");

    const response = await fetch(`${apiBaseUrl}/books`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newBookData),
    });

    const responseBody = response.headers
      .get("content-type")
      ?.includes("application/json")
      ? await response.json()
      : { message: response.statusText };

    if (response.status === 201) {
      showMessage(`Book "${responseBody.title}" created successfully! ID: ${responseBody.id}`, "success");
      createBookForm.reset();
      console.log("Created Book:", responseBody);
      
      // Redirect after 2 seconds
      setTimeout(() => {
        window.location.href = "index.html";
      }, 2000);
    } else if (response.status === 400) {
      showMessage(`Validation Error: ${responseBody.error}`, "error");
      console.error("Validation Error:", responseBody);
    } else {
      throw new Error(`API error! status: ${response.status}, message: ${responseBody.message || responseBody.error}`);
    }
  } catch (error) {
    console.error("Error creating book:", error);
    showMessage(`Failed to create book: ${error.message}`, "error");
  }
});