// Get references to HTML elements
const studentsListDiv = document.getElementById("studentsList");
const fetchStudentsBtn = document.getElementById("fetchStudentsBtn");
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

// Function to fetch students from the API and display them
async function fetchStudents() {
  try {
    studentsListDiv.innerHTML = '<div class="loading">Loading students...</div>';
    messageDiv.textContent = "";

    // Make a GET request to the API endpoint
    const response = await fetch(`${apiBaseUrl}/students`);

    if (!response.ok) {
      const errorBody = response.headers
        .get("content-type")
        ?.includes("application/json")
        ? await response.json()
        : { message: response.statusText };
      throw new Error(
        `HTTP error! status: ${response.status}, message: ${errorBody.message}`
      );
    }

    // Parse the JSON response
    const students = await response.json();

    // Clear previous content and display students
    studentsListDiv.innerHTML = "";
    
    if (students.length === 0) {
      studentsListDiv.innerHTML = '<div class="student-item">No students found.</div>';
    } else {
      students.forEach((student) => {
        const studentElement = document.createElement("div");
        studentElement.classList.add("student-item");
        studentElement.setAttribute("data-student-id", student.id);
        
        studentElement.innerHTML = `
          <h3>${student.name}</h3>
          <div class="student-info">
            <p><strong>Email:</strong> ${student.email}</p>
            <p><strong>Age:</strong> ${student.age}</p>
            <p><strong>Student ID:</strong> ${student.id}</p>
          </div>
          <div class="student-actions">
            <button class="btn btn-primary" onclick="viewStudentDetails(${student.id})">View Details</button>
            <button class="btn btn-warning" onclick="editStudent(${student.id})">Edit</button>
            <button class="btn btn-danger delete-btn" data-id="${student.id}">Delete</button>
          </div>
        `;
        studentsListDiv.appendChild(studentElement);
      });
      
      // Add event listeners for delete buttons
      document.querySelectorAll(".delete-btn").forEach((button) => {
        button.addEventListener("click", handleDeleteClick);
      });
    }
  } catch (error) {
    console.error("Error fetching students:", error);
    studentsListDiv.innerHTML = `<div class="student-item" style="color: red;">Failed to load students: ${error.message}</div>`;
    showMessage(`Failed to load students: ${error.message}`, "error");
  }
}

// Function to view student details (placeholder)
function viewStudentDetails(studentId) {
  console.log("View details for student ID:", studentId);
  showMessage(`View details for student ID: ${studentId} (Feature coming soon!)`, "info");
}

// Function to edit a student
function editStudent(studentId) {
  console.log("Edit student with ID:", studentId);
  window.location.href = `edit-student.html?id=${studentId}`;
}

// Function to handle delete button clicks
async function handleDeleteClick(event) {
  const studentId = event.target.getAttribute("data-id");
  console.log("Attempting to delete student with ID:", studentId);
  
  // Ask for confirmation before deleting
  if (!confirm("Are you sure you want to delete this student? This action cannot be undone.")) {
    return;
  }

  try {
    // Show loading message
    showMessage("Deleting student...", "info");

    // Make DELETE request to the API
    const response = await fetch(`${apiBaseUrl}/students/${studentId}`, {
      method: "DELETE",
    });

    if (response.status === 200) {
      // Success - student was deleted
      const responseBody = await response.json();
      showMessage(`Student "${responseBody.student.name}" deleted successfully!`, "success");
      
      // Remove the student element from the DOM
      const studentElement = document.querySelector(`[data-student-id="${studentId}"]`);
      if (studentElement) {
        studentElement.remove();
      }
      
      console.log("Student deleted successfully:", responseBody);
    } else if (response.status === 404) {
      // Student not found
      showMessage("Student not found - it may have already been deleted.", "warning");
      // Refresh the list to get current state
      fetchStudents();
    } else {
      // Other error
      const errorBody = response.headers
        .get("content-type")
        ?.includes("application/json")
        ? await response.json()
        : { message: response.statusText };
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorBody.message}`);
    }
  } catch (error) {
    console.error("Error deleting student:", error);
    showMessage(`Failed to delete student: ${error.message}`, "error");
  }
}

// Event listeners
fetchStudentsBtn.addEventListener("click", fetchStudents);

// Load students when page loads
window.addEventListener('load', fetchStudents);