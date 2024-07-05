import { books, authors, genres, BOOKS_PER_PAGE } from "./data.js"; // Import data from the data file.

let page = 1; // Tracks the current page number.
let matches = books; // Stores the filtered book list.

// Renders the books on the screen.
function renderBooks(books) {
  const fragment = document.createDocumentFragment();
  books.forEach((book) => {
    const element = createBookElement(book);
    fragment.appendChild(element);
  });
  document.querySelector("[data-list-items]").appendChild(fragment);
  showMore(); // Updates the "Show more" button.
}

// Creates a book element with an image, title, and author.
function createBookElement({ author, id, image, title }) {
  const element = document.createElement("button");
  element.classList = "preview";
  element.setAttribute("data-preview", id);

  element.innerHTML = `
    <img class="preview__image" src="${image}" />
    <div class="preview__info">
      <h3 class="preview__title">${title}</h3>
      <div class="preview__author">${authors[author]}</div>
    </div>
  `;

  return element; // Returns the created element.
}

// Renders the list of genres in a dropdown.
function renderGenres() {
  const genreHtml = document.createDocumentFragment();
  const firstGenreElement = createOptionElement("All Genre", "any");
  genreHtml.appendChild(firstGenreElement);

  for (const [id, name] of Object.entries(genres)) {
    const element = createOptionElement(name, id);
    genreHtml.appendChild(element);
  }

  document.querySelector("[data-search-genres]").appendChild(genreHtml);
}

// Renders the list of authors in a dropdown.
function renderAuthors() {
  const authorsHtml = document.createDocumentFragment();
  const firstAuthorElement = createOptionElement("All authors", "any");
  authorsHtml.appendChild(firstAuthorElement);

  for (const [id, name] of Object.entries(authors)) {
    const element = createOptionElement(name, id);
    authorsHtml.appendChild(element);
  }

  document.querySelector("[data-search-authors]").appendChild(authorsHtml);
}

// Creates an option element for dropdowns.
function createOptionElement(text, value) {
  const element = document.createElement("option");
  element.value = value;
  element.innerText = text;
  return element;
}

// Applies the selected theme to the document.
function applyTheme(theme) {
  const isDark = theme === "night";
  document.querySelector("[data-settings-theme]").value = theme;
  document.documentElement.style.setProperty(
    "--color-dark",
    isDark ? "255, 255, 255" : "10, 10, 20"
  );
  document.documentElement.style.setProperty(
    "--color-light",
    isDark ? "10, 10, 20" : "255, 255, 255"
  );
}

// Filters the books based on the selected filters.
function filterBooks(books, filters) {
  const filteredBooks = books.filter((book) => {
    let genreMatch = filters.genre === "any";

    for (const singleGenre of book.genres) {
      if (genreMatch) break;
      if (singleGenre === filters.genre) {
        genreMatch = true;
      }
    }

    return (
      (filters.title.trim() === "" ||
        book.title.toLowerCase().includes(filters.title.toLowerCase())) &&
      (filters.author === "any" || book.author === filters.author) &&
      genreMatch
    );
  });

  return filteredBooks;
}

// Updates the "Show more" button based on the number of remaining books.
function showMore() {
  document.querySelector("[data-list-button]").disabled =
    matches.length - page * BOOKS_PER_PAGE < 1;

  document.querySelector("[data-list-button]").innerHTML = `
    <span>Show more</span>
    <span class="list__remaining"> (${
      matches.length - page * BOOKS_PER_PAGE > 0
        ? matches.length - page * BOOKS_PER_PAGE
        : 0
    })</span>`;
}

// Event listeners for various actions on the page.
document.querySelector("[data-search-cancel]").addEventListener("click", () => {
  document.querySelector("[data-search-overlay]").open = false;
});

document
  .querySelector("[data-settings-cancel]")
  .addEventListener("click", () => {
    document.querySelector("[data-settings-overlay]").open = false;
  });

document.querySelector("[data-header-search]").addEventListener("click", () => {
  document.querySelector("[data-search-overlay]").open = true;
  document.querySelector("[data-search-title]").focus();
});

document
  .querySelector("[data-header-settings]")
  .addEventListener("click", () => {
    document.querySelector("[data-settings-overlay]").open = true;
  });

document.querySelector("[data-list-close]").addEventListener("click", () => {
  document.querySelector("[data-list-active]").open = false;
});

// Applies the selected theme when the settings form is submitted.
document
  .querySelector("[data-settings-form]")
  .addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const { theme } = Object.fromEntries(formData);
    applyTheme(theme);
    document.querySelector("[data-settings-overlay]").open = false;
  });

// Filters the books based on the search form submission.
document
  .querySelector("[data-search-form]")
  .addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const filters = Object.fromEntries(formData);
    const result = filterBooks(books, filters);

    page = 1;
    matches = result;

    if (result.length < 1) {
      document
        .querySelector("[data-list-message]")
        .classList.add("list__message_show");
    } else {
      document
        .querySelector("[data-list-message]")
        .classList.remove("list__message_show");
    }

    document.querySelector("[data-list-items]").innerHTML = "";
    renderBooks(matches.slice(0, BOOKS_PER_PAGE));

    window.scrollTo({ top: 0, behavior: "smooth" });
    document.querySelector("[data-search-overlay]").open = false;
  });

// Loads more books when the "Show more" button is clicked.
document.querySelector("[data-list-button]").addEventListener("click", () => {
  const fragment = document.createDocumentFragment();
  renderBooks(
    matches.slice(page * BOOKS_PER_PAGE, (page + 1) * BOOKS_PER_PAGE)
  );
  document.querySelector("[data-list-items]").appendChild(fragment);
  page += 1;
  showMore();
});

// Displays the book details when a book element is clicked.
document
  .querySelector("[data-list-items]")
  .addEventListener("click", (event) => {
    const pathArray = Array.from(event.path || event.composedPath());
    let active = null;

    for (const node of pathArray) {
      if (active) break;

      if (node?.dataset?.preview) {
        let result = null;

        for (const singleBook of books) {
          if (result) break;
          if (singleBook.id === node?.dataset?.preview) result = singleBook;
        }

        active = result;
      }
    }

    if (active) {
      document.querySelector("[data-list-active]").open = true;
      document.querySelector("[data-list-blur]").src = active.image;
      document.querySelector("[data-list-image]").src = active.image;
      document.querySelector("[data-list-title]").innerText = active.title;
      document.querySelector("[data-list-subtitle]").innerText = `${
        authors[active.author]
      } (${new Date(active.published).getFullYear()})`;
      document.querySelector("[data-list-description]").innerText =
        active.description;
    }
  });

// Initial function calls to render books, genres, and authors.
renderBooks(matches.slice(0, BOOKS_PER_PAGE));
renderGenres();
renderAuthors();

// Applies the preferred theme based on the device settings.
if (
  window.matchMedia &&
  window.matchMedia("(prefers-color-scheme: dark)").matches
) {
  applyTheme("night");
} else {
  applyTheme("day");
}
