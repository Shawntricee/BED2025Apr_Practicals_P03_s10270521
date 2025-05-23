// Get references to form elements
const createStudentForm = document.getElementById("createStudentForm");
const messageDiv = document.getElementById("message");
const apiBaseUrl = "http://localhost:3001"; // Students API port

// Function to display messages to user
function showMessage(text, type = "info") {
  messageDiv.textContent = text;
  messageDiv.className = "";
  
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
createStudentForm.addEventListener("submit", async (event) => {
  event.preventDefault(); // Prevent default form submission

  messageDiv.textContent = ""; // Clear previous messages

  // Collect data from form inputs
  const nameInput = document.getElementById("name");
  const emailInput = document.getElementById("email");
  const ageInput = document.getElementById("age");

  const newStudentData = {
    name: nameInput.value.trim(),
    email: emailInput.value.trim(),
    age: parseInt(ageInput.value)
  };

  // Basic client-side validation
  if (!newStudentData.name || !newStudentData.email || !newStudentData.age) {
    showMessage("Please fill in all required fields.", "error");
    return;
  }

  if (newStudentData.age < 16 || newStudentData.age > 100) {
    showMessage("Age must be between 16 and 100.", "error");
    return;
  }

  try {
    // Show loading message
    showMessage("Creating student...", "info");

    // Make POST request to API
    const response = await fetch(`${apiBaseUrl}/students`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newStudentData),
    });

    // Handle response
    const responseBody = response.headers
      .get("content-type")
      ?.includes("application/json")
      ? await response.json()
      : { message: response.statusText };

    if (response.status === 201) {
      // Success
      showMessage(`Student "${responseBody.name}" created successfully! ID: ${responseBody.id}`, "success");
      createStudentForm.reset(); // Clear the form
      console.log("Created Student:", responseBody);
      
      // Redirect to students list after 2 seconds
      setTimeout(() => {
        window.location.href = "students.html";
      }, 2000);
      
    } else if (response.status === 400) {
      // Validation error
      showMessage(`Validation Error: ${responseBody.error}`, "error");
      console.error("Validation Error:", responseBody);
    } else {
      // Other error
      throw new Error(
        `API error! status: ${response.status}, message: ${responseBody.message || responseBody.error}`
      );
    }
  } catch (error) {
    console.error("Error creating student:", error);
    showMessage(`Failed to create student: ${error.message}`, "error");
  }
});