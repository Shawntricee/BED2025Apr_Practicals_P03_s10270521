// Get references to the HTML elements you'll interact with:
const booksListDiv = document.getElementById("booksList");
const fetchBooksBtn = document.getElementById("fetchBooksBtn");
const messageDiv = document.getElementById("message");
const apiBaseUrl = "http://localhost:3000";

// Function to fetch books from the API and display them
async function fetchBooks() {
  try {
    booksListDiv.innerHTML = "Loading books...";
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
      booksListDiv.innerHTML = "<p>No books found.</p>";
    } else {
      books.forEach((book) => {
        const bookElement = document.createElement("div");
        bookElement.classList.add("book-item");
        bookElement.setAttribute("data-book-id", book.id);
        bookElement.innerHTML = `
                    <h3>${book.title}</h3>
                    <p>Author: ${book.author}</p>
                    <p>ID: ${book.id}</p>
                    <button onclick="viewBookDetails(${book.id})">View Details</button>
                    <button onclick="editBook(${book.id})">Edit</button>
                    <button class="delete-btn" data-id="${book.id}">Delete</button>
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
    booksListDiv.innerHTML = `<p style="color: red;">Failed to load books: ${error.message}</p>`;
  }
}

// Function to view book details
function viewBookDetails(bookId) {
  console.log("View details for book ID:", bookId);
  // For now, just show an alert with the book ID
  alert(`View details for book ID: ${bookId} (Feature coming soon!)`);
}

// Function to edit a book
function editBook(bookId) {
  console.log("Edit book with ID:", bookId);
  // Redirect to edit.html with the book ID
  window.location.href = `edit.html?id=${bookId}`;
}

// COMPLETE DELETE IMPLEMENTATION
async function handleDeleteClick(event) {
  const bookId = event.target.getAttribute("data-id");
  console.log("Attempting to delete book with ID:", bookId);
  
  // Ask for confirmation before deleting
  if (!confirm("Are you sure you want to delete this book?")) {
    return;
  }

  try {
    // Show loading message
    messageDiv.textContent = "Deleting book...";
    messageDiv.style.color = "blue";

    // Make DELETE request to the API
    const response = await fetch(`${apiBaseUrl}/books/${bookId}`, {
      method: "DELETE",
    });

    if (response.status === 200) {
      // Success - book was deleted
      const responseBody = await response.json();
      messageDiv.textContent = `Book "${responseBody.book.title}" deleted successfully!`;
      messageDiv.style.color = "green";
      
      // Remove the book element from the DOM
      const bookElement = document.querySelector(`[data-book-id="${bookId}"]`);
      if (bookElement) {
        bookElement.remove();
      }
      
      console.log("Book deleted successfully:", responseBody);
    } else if (response.status === 404) {
      // Book not found
      messageDiv.textContent = "Book not found - it may have already been deleted.";
      messageDiv.style.color = "orange";
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
    messageDiv.textContent = `Failed to delete book: ${error.message}`;
    messageDiv.style.color = "red";
  }
}

// Fetch books when the button is clicked
fetchBooksBtn.addEventListener("click", fetchBooks);

// Optionally, fetch books when the page loads
window.addEventListener('load', fetchBooks);