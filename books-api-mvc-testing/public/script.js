// Get references to HTML elements
const booksListDiv = document.getElementById("booksList");
const fetchBooksBtn = document.getElementById("fetchBooksBtn");
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

// Function to fetch books from the API and display them
async function fetchBooks() {
  try {
    booksListDiv.innerHTML = '<div style="text-align: center; padding: 20px;">Loading books...</div>';
    messageDiv.textContent = "";

    // Make a GET request to your API endpoint
    const response = await fetch(`${apiBaseUrl}/books`);

    if (!response.ok) {
      // Handle HTTP errors (e.g., 404, 500)
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
    const books = await response.json();

    // Clear previous content and display books
    booksListDiv.innerHTML = "";
    if (books.length === 0) {
      booksListDiv.innerHTML = '<div class="book-item">No books found.</div>';
    } else {
      books.forEach((book) => {
        const bookElement = document.createElement("div");
        bookElement.classList.add("book-item");
        bookElement.setAttribute("data-book-id", book.id);
        bookElement.innerHTML = `
          <h3>${book.title}</h3>
          <p><strong>Author:</strong> ${book.author}</p>
          <p><strong>ID:</strong> ${book.id}</p>
          <div>
            <button class="btn btn-primary" onclick="viewBookDetails(${book.id})">View Details</button>
            <button class="btn btn-warning" onclick="editBook(${book.id})">Edit</button>
            <button class="btn btn-danger delete-btn" data-id="${book.id}">Delete</button>
          </div>
        `;
        booksListDiv.appendChild(bookElement);
      });
      // Add event listeners for delete buttons after they are added to the DOM
      document.querySelectorAll(".delete-btn").forEach((button) => {
        button.addEventListener("click", handleDeleteClick);
      });
    }
  } catch (error) {
    console.error("Error fetching books:", error);
    booksListDiv.innerHTML = `<div class="book-item" style="color: red;">Failed to load books: ${error.message}</div>`;
    showMessage(`Failed to load books: ${error.message}`, "error");
  }
}

// Function to view book details
function viewBookDetails(bookId) {
  console.log("View details for book ID:", bookId);
  showMessage(`View details for book ID: ${bookId} (Feature coming soon!)`, "info");
}

// Function to edit a book
function editBook(bookId) {
  console.log("Edit book with ID:", bookId);
  // Redirect to edit.html with the book ID
  window.location.href = `edit.html?id=${bookId}`;
}

// Function to handle delete button clicks
async function handleDeleteClick(event) {
  const bookId = event.target.getAttribute("data-id");
  console.log("Attempting to delete book with ID:", bookId);
  
  // Ask for confirmation before deleting
  if (!confirm("Are you sure you want to delete this book?")) {
    return;
  }

  try {
    // Show loading message
    showMessage("Deleting book...", "info");

    // Make DELETE request to the API
    const response = await fetch(`${apiBaseUrl}/books/${bookId}`, {
      method: "DELETE",
    });

    if (response.status === 200) {
      // Success - book was deleted
      const responseBody = await response.json();
      showMessage(`Book "${responseBody.book.title}" deleted successfully!`, "success");
      
      // Remove the book element from the DOM
      const bookElement = document.querySelector(`[data-book-id="${bookId}"]`);
      if (bookElement) {
        bookElement.remove();
      }
      
      console.log("Book deleted successfully:", responseBody);
    } else if (response.status === 404) {
      // Book not found
      showMessage("Book not found - it may have already been deleted.", "warning");
      // Refresh the list to get current state
      fetchBooks();
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
    console.error("Error deleting book:", error);
    showMessage(`Failed to delete book: ${error.message}`, "error");
  }
}

// Fetch books when the button is clicked
fetchBooksBtn.addEventListener("click", fetchBooks);

// Optionally, fetch books when the page loads
window.addEventListener('load', fetchBooks);