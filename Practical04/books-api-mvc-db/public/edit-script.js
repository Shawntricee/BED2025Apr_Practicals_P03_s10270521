// Get references to the elements
const editBookForm = document.getElementById("editBookForm");
const loadingMessageDiv = document.getElementById("loadingMessage");
const messageDiv = document.getElementById("message");
const bookIdInput = document.getElementById("bookId");
const editTitleInput = document.getElementById("editTitle");
const editAuthorInput = document.getElementById("editAuthor");

// Base URL for the API.
const apiBaseUrl = "http://localhost:3000";

// Function to get book ID from URL query parameter (e.g., edit.html?id=1)
function getBookIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

// Function to fetch existing book data from the API based on ID
async function fetchBookData(bookId) {
  try {
    // Make a GET request to the API endpoint for a specific book
    const response = await fetch(`${apiBaseUrl}/books/${bookId}`);

    // Check if the HTTP response status is not OK (e.g., 404, 500)
    if (!response.ok) {
      // Attempt to read error body if available (assuming JSON), otherwise use status text
      const errorBody = response.headers
        .get("content-type")
        ?.includes("application/json")
        ? await response.json()
        : { message: response.statusText };
      // Throw an error with status and message
      throw new Error(
        `HTTP error! status: ${response.status}, message: ${errorBody.message || errorBody.error}`
      );
    }

    // Parse the JSON response body into a JavaScript object
    const book = await response.json();
    return book; // Return the fetched book object
  } catch (error) {
    // Catch any errors during the fetch or processing
    console.error("Error fetching book data:", error);
    // Display an error message to the user
    messageDiv.textContent = `Failed to load book data: ${error.message}`;
    messageDiv.style.color = "red";
    loadingMessageDiv.textContent = ""; // Hide loading message if it was shown
    return null; // Indicate that fetching failed
  }
}

// Function to populate the form fields with the fetched book data
function populateForm(book) {
  bookIdInput.value = book.id; // Store the book ID in the hidden input
  editTitleInput.value = book.title; // Set the title input value
  editAuthorInput.value = book.author; // Set the author input value
  loadingMessageDiv.style.display = "none"; // Hide the loading message
  editBookForm.style.display = "block"; // Show the edit form
}

// --- Code to run when the page loads ---

// Get the book ID from the URL when the page loads
const bookIdToEdit = getBookIdFromUrl();

// Check if a book ID was found in the URL
if (bookIdToEdit) {
  // If an ID exists, fetch the book data and then populate the form
  fetchBookData(bookIdToEdit).then((book) => {
    if (book) {
      // If book data was successfully fetched, populate the form
      populateForm(book);
    } else {
      // Handle the case where fetchBookData returned null (book not found or error)
      loadingMessageDiv.textContent = "Book not found or failed to load.";
      messageDiv.textContent = "Could not find the book to edit.";
      messageDiv.style.color = "red";
    }
  });
} else {
  // Handle the case where no book ID was provided in the URL
  loadingMessageDiv.textContent = "No book ID specified for editing.";
  messageDiv.textContent =
    "Please provide a book ID in the URL (e.g., edit.html?id=1).";
  messageDiv.style.color = "orange";
}

// --- COMPLETE PUT REQUEST IMPLEMENTATION ---

// Add an event listener for the form submission (for the Update operation)
editBookForm.addEventListener("submit", async (event) => {
  event.preventDefault(); // Prevent the default browser form submission

  console.log("Edit form submitted - implementing PUT logic");

  // Clear previous messages
  messageDiv.textContent = "";

  // Collect updated data from form fields
  const updatedBookData = {
    title: editTitleInput.value,
    author: editAuthorInput.value,
  };

  // Get the book ID from the hidden input
  const bookId = bookIdInput.value;

  try {
    // Show loading message
    messageDiv.textContent = "Updating book...";
    messageDiv.style.color = "blue";

    // Implement the fetch PUT request to the API endpoint /books/:id
    const response = await fetch(`${apiBaseUrl}/books/${bookId}`, {
      method: "PUT", // HTTP method for updating
      headers: {
        "Content-Type": "application/json", // Tell the API we are sending JSON
      },
      body: JSON.stringify(updatedBookData), // Include the updated data in the request body
    });

    // Handle the API response
    const responseBody = response.headers
      .get("content-type")
      ?.includes("application/json")
      ? await response.json()
      : { message: response.statusText };

    if (response.status === 200) {
      // Success - book was updated
      messageDiv.textContent = `Book "${responseBody.title}" updated successfully!`;
      messageDiv.style.color = "green";
      console.log("Book updated successfully:", responseBody);
      
      // Optionally redirect back to index page after a delay
      setTimeout(() => {
        window.location.href = "index.html";
      }, 2000);
    } else if (response.status === 400) {
      // Validation error
      messageDiv.textContent = `Validation Error: ${responseBody.error}`;
      messageDiv.style.color = "red";
      console.error("Validation Error:", responseBody);
    } else if (response.status === 404) {
      // Book not found
      messageDiv.textContent = "Book not found - it may have been deleted.";
      messageDiv.style.color = "orange";
    } else {
      // Other server error
      throw new Error(
        `API error! status: ${response.status}, message: ${responseBody.message || responseBody.error}`
      );
    }
  } catch (error) {
    console.error("Error updating book:", error);
    messageDiv.textContent = `Failed to update book: ${error.message}`;
    messageDiv.style.color = "red";
  }
});