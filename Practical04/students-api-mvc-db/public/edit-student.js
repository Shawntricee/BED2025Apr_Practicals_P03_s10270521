// Get references to elements
const editStudentForm = document.getElementById("editStudentForm");
const loadingMessageDiv = document.getElementById("loadingMessage");
const messageDiv = document.getElementById("message");
const studentIdInput = document.getElementById("studentId");
const editNameInput = document.getElementById("editName");
const editEmailInput = document.getElementById("editEmail");
const editAgeInput = document.getElementById("editAge");

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

// Function to get student ID from URL query parameter
function getStudentIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

// Function to fetch existing student data from the API
async function fetchStudentData(studentId) {
  try {
    const response = await fetch(`${apiBaseUrl}/students/${studentId}`);

    if (!response.ok) {
      const errorBody = response.headers
        .get("content-type")
        ?.includes("application/json")
        ? await response.json()
        : { message: response.statusText };
      throw new Error(
        `HTTP error! status: ${response.status}, message: ${errorBody.message || errorBody.error}`
      );
    }

    const student = await response.json();
    return student;
  } catch (error) {
    console.error("Error fetching student data:", error);
    showMessage(`Failed to load student data: ${error.message}`, "error");
    loadingMessageDiv.textContent = "";
    return null;
  }
}

// Function to populate the form with student data
function populateForm(student) {
  studentIdInput.value = student.id;
  editNameInput.value = student.name;
  editEmailInput.value = student.email;
  editAgeInput.value = student.age;
  
  loadingMessageDiv.style.display = "none";
  editStudentForm.classList.add("show");
}

// Initialize page
const studentIdToEdit = getStudentIdFromUrl();

if (studentIdToEdit) {
  fetchStudentData(studentIdToEdit).then((student) => {
    if (student) {
      populateForm(student);
    } else {
      loadingMessageDiv.textContent = "Student not found or failed to load.";
      showMessage("Could not find the student to edit.", "error");
    }
  });
} else {
  loadingMessageDiv.textContent = "No student ID specified for editing.";
  showMessage("Please provide a student ID in the URL (e.g., edit-student.html?id=1).", "warning");
}

// Handle form submission for updating student
editStudentForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  console.log("Edit form submitted - implementing PUT logic");

  // Clear previous messages
  messageDiv.textContent = "";

  // Collect updated data from form fields
  const updatedStudentData = {
    name: editNameInput.value.trim(),
    email: editEmailInput.value.trim(),
    age: parseInt(editAgeInput.value)
  };

  // Get the student ID from the hidden input
  const studentId = studentIdInput.value;

  // Basic client-side validation
  if (!updatedStudentData.name || !updatedStudentData.email || !updatedStudentData.age) {
    showMessage("Please fill in all required fields.", "error");
    return;
  }

  if (updatedStudentData.age < 16 || updatedStudentData.age > 100) {
    showMessage("Age must be between 16 and 100.", "error");
    return;
  }

  try {
    // Show loading message
    showMessage("Updating student...", "info");

    // Make PUT request to API
    const response = await fetch(`${apiBaseUrl}/students/${studentId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedStudentData),
    });

    // Handle the API response
    const responseBody = response.headers
      .get("content-type")
      ?.includes("application/json")
      ? await response.json()
      : { message: response.statusText };

    if (response.status === 200) {
      // Success - student was updated
      showMessage(`Student "${responseBody.name}" updated successfully!`, "success");
      console.log("Student updated successfully:", responseBody);
      
      // Redirect back to students list after a delay
      setTimeout(() => {
        window.location.href = "students.html";
      }, 2000);
    } else if (response.status === 400) {
      // Validation error
      showMessage(`Validation Error: ${responseBody.error}`, "error");
      console.error("Validation Error:", responseBody);
    } else if (response.status === 404) {
      // Student not found
      showMessage("Student not found - it may have been deleted.", "warning");
    } else {
      // Other server error
      throw new Error(
        `API error! status: ${response.status}, message: ${responseBody.message || responseBody.error}`
      );
    }
  } catch (error) {
    console.error("Error updating student:", error);
    showMessage(`Failed to update student: ${error.message}`, "error");
  }
});