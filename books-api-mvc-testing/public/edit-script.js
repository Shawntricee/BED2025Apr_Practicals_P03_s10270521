// Get references to elements
const editBookForm = document.getElementById("editBookForm");
const loadingMessageDiv = document.getElementById("loadingMessage");
const messageDiv = document.getElementById("message");
const bookIdInput = document.getElementById("bookId");
const editTitleInput = document.getElementById("editTitle");
const editAuthorInput = document.getElementById("editAuthor");

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

// Function to get book ID from URL query parameter
function getBookIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

// Function to fetch existing book data from the API
async function fetchBookData(bookId) {
  try {
    const response = await fetch(`${apiBaseUrl}/books/${bookId}`);

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

    const book = await response.json();
    return book;
  } catch (error) {
    console.error("Error fetching book data:", error);
    showMessage(`Failed to load book data: ${error.message}`, "error");
    loadingMessageDiv.textContent = "";
    return null;
  }
}

// Function to populate the form with book data
function populateForm(book) {
  bookIdInput.value = book.id;
  editTitleInput.value = book.title;
  editAuthorInput.value = book.author;
  
  loadingMessageDiv.style.display = "none";
  editBookForm.classList.add("show");
}

// Initialize page
const bookIdToEdit = getBookIdFromUrl();

if (bookIdToEdit) {
  fetchBookData(bookIdToEdit).then((book) => {
    if (book) {
      populateForm(book);
    } else {
      loadingMessageDiv.textContent = "Book not found or failed to load.";
      showMessage("Could not find the book to edit.", "error");
    }
  });
} else {
  loadingMessageDiv.textContent = "No book ID specified for editing.";
  showMessage("Please provide a book ID in the URL (e.g., edit.html?id=1).", "warning");
}

// Handle form submission for updating book
editBookForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  console.log("Edit form submitted - implementing PUT logic");

  // Clear previous messages
  messageDiv.textContent = "";

  // Collect updated data from form fields
  const updatedBookData = {
    title: editTitleInput.value.trim(),
    author: editAuthorInput.value.trim(),
  };

  // Get the book ID from the hidden input
  const bookId = bookIdInput.value;

  // Basic client-side validation
  if (!updatedBookData.title || !updatedBookData.author) {
    showMessage("Please fill in all required fields.", "error");
    return;
  }

  if (updatedBookData.title.length > 50) {
    showMessage("Title cannot exceed 50 characters.", "error");
    return;
  }

  if (updatedBookData.author.length > 50) {
    showMessage("Author name cannot exceed 50 characters.", "error");
    return;
  }

  try {
    // Show loading message
    showMessage("Updating book...", "info");

    // Make PUT request to API
    const response = await fetch(`${apiBaseUrl}/books/${bookId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedBookData),
    });

    // Handle the API response
    const responseBody = response.headers
      .get("content-type")
      ?.includes("application/json")
      ? await response.json()
      : { message: response.statusText };

    if (response.status === 200) {
      // Success - book was updated
      showMessage(`Book "${responseBody.title}" updated successfully!`, "success");
      console.log("Book updated successfully:", responseBody);
      
      // Redirect back to index page after a delay
      setTimeout(() => {
        window.location.href = "index.html";
      }, 2000);
    } else if (response.status === 400) {
      // Validation error
      showMessage(`Validation Error: ${responseBody.error}`, "error");
      console.error("Validation Error:", responseBody);
    } else if (response.status === 404) {
      // Book not found
      showMessage("Book not found - it may have been deleted.", "warning");
    } else {
      // Other server error
      throw new Error(
        `API error! status: ${response.status}, message: ${responseBody.message || responseBody.error}`
      );
    }
  } catch (error) {
    console.error("Error updating book:", error);
    showMessage(`Failed to update book: ${error.message}`, "error");
  }
});