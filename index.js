// index.js
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());
const PORT = 3000;

// In-memory dummy data
let books = {
  "9780143127741": {
    isbn: "9780143127741",
    title: "The Martian",
    author: "Andy Weir",
    reviews: { alice: "Amazing!" }
  },
  "9780439064873": {
    isbn: "9780439064873",
    title: "Harry Potter and the Chamber of Secrets",
    author: "J.K. Rowling",
    reviews: {}
  }
};

let users = []; // { username, password }
let sessions = {}; // username -> logged in

// ---------- General User APIs ----------

// Task 1: Get all books
app.get('/books', (req, res) => {
  res.json(books);
});

// Task 2: Get book by ISBN
app.get('/books/isbn/:isbn', (req, res) => {
  const book = books[req.params.isbn];
  if (book) res.json(book);
  else res.status(404).json({ message: "Book not found" });
});

// Task 3: Get all books by author
app.get('/books/author/:author', (req, res) => {
  const authorBooks = Object.values(books).filter(
    b => b.author.toLowerCase() === req.params.author.toLowerCase()
  );
  res.json(authorBooks);
});

// Task 4: Get all books by title
app.get('/books/title/:title', (req, res) => {
  const titleBooks = Object.values(books).filter(
    b => b.title.toLowerCase().includes(req.params.title.toLowerCase())
  );
  res.json(titleBooks);
});

// Task 5: Get book reviews
app.get('/books/review/:isbn', (req, res) => {
  const book = books[req.params.isbn];
  if (book) res.json(book.reviews);
  else res.status(404).json({ message: "Book not found" });
});

// Task 6: Register new user
app.post('/register', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ message: "Missing username or password" });
  if (users.find(u => u.username === username)) return res.status(400).json({ message: "User already exists" });
  users.push({ username, password });
  res.json({ message: "User registered successfully" });
});

// Task 7: Login as registered user
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);
  if (user) {
    sessions[username] = true;
    res.json({ message: "Login successful" });
  } else {
    res.status(401).json({ message: "Invalid credentials" });
  }
});

// ---------- Registered User APIs ----------

// Task 8: Add/Modify a book review
app.put('/books/review/:isbn', (req, res) => {
  const { username, review } = req.body;
  const book = books[req.params.isbn];
  if (!sessions[username]) return res.status(401).json({ message: "Login required" });
  if (!book) return res.status(404).json({ message: "Book not found" });
  book.reviews[username] = review;
  res.json({ message: "Review added/updated", reviews: book.reviews });
});

// Task 9: Delete a book review
app.delete('/books/review/:isbn', (req, res) => {
  const { username } = req.body;
  const book = books[req.params.isbn];
  if (!sessions[username]) return res.status(401).json({ message: "Login required" });
  if (!book || !book.reviews[username]) return res.status(404).json({ message: "Review not found" });
  delete book.reviews[username];
  res.json({ message: "Review deleted", reviews: book.reviews });
});

// ---------- Node.js methods with Axios ----------

// Task 10: Get all books using async/await
async function getAllBooks() {
  try {
    const response = await axios.get(`http://localhost:${PORT}/books`);
    console.log(response.data);
  } catch (err) {
    console.error(err.message);
  }
}

// Task 11: Search by ISBN using Promises
function getBookByISBN(isbn) {
  axios.get(`http://localhost:${PORT}/books/isbn/${isbn}`)
    .then(res => console.log(res.data))
    .catch(err => console.error(err.message));
}

// Task 12: Search by Author using async/await
async function getBooksByAuthor(author) {
  try {
    const response = await axios.get(`http://localhost:${PORT}/books/author/${author}`);
    console.log(response.data);
  } catch (err) {
    console.error(err.message);
  }
}

// Task 13: Search by Title using Promises
function getBooksByTitle(title) {
  axios.get(`http://localhost:${PORT}/books/title/${title}`)
    .then(res => console.log(res.data))
    .catch(err => console.error(err.message));
}

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log("You can test Axios functions after server starts");
  // Example Axios calls:
  getAllBooks();
  getBookByISBN("9780143127741");
  getBooksByAuthor("J.K. Rowling");
  getBooksByTitle("Martian");
});
