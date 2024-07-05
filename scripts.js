import { books, authors, genres, BOOKS_PER_PAGE } from "./data.js"; //Fetches data from the data file.

let page = 1; //This variable keeps track of the page number.
let matches = books; //To store the filtered book list.

//Function that makes the books available so the element below can display them.
function renderBooks(books) {
  const fragment = document.createDocumentFragment();
  books.forEach((book) => {
    //Loops through the book list and creates a book element for each book
    const element = createBookElement(book);
    fragment.appendChild(element);
  });
  document.querySelector("[data-list-items]").appendChild(fragment);
  showMore(); //Calls this function to update the "Show more" button.
}

//Creates element to display the books on screen as a button with and image, title and author.
function createBookElement({ author, id, image, title }) {
  const element = document.createElement("button");
  element.classList = "preview";
  element.setAttribute("data-preview", id);

  element.innerHTML = `
        <img
            class="preview__image"
            src="${image}"
        />

        <div class="preview__info">
            <h3 class="preview__title">${title}</h3>
            <div class="preview__author">${authors[author]}</div>
        </div>
    `;

  return element; //Return to provide the created element back to the caller for flexible use
}

//Gives out the list of Genres

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

//Provides the list of Autors
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
//Dropdown options whe the search button is opened
function createOptionElement(text, value) {
  const element = document.createElement("option");
  element.value = value;
  element.innerText = text;
  return element;
}
createOptionElement();

//Theme setting simplified into ternery operators

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

//Filters that group the books according to title, genre and author to enable to user the search them respectively.

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

//Show more button function

function showMore() {
  document.querySelector("[data-list-button]").disabled =
    matches.length - page * BOOKS_PER_PAGE < 1;//Enables or disables the "Show more" button based on whether there are more books to display.

//Updates the inner HTML of the "Show more" button to display the number of remaining books.
  document.querySelector("[data-list-button]").innerHTML = `
        <span>Show more</span>
        <span class="list__remaining"> (${
          matches.length - page * BOOKS_PER_PAGE > 0
            ? matches.length - page * BOOKS_PER_PAGE
            : 0
        })</span>`;
}



//Event handlers

// Listens out for a "click" on the search cancel button and hides the search overlay
document.querySelector("[data-search-cancel]").addEventListener("click", () => {
  document.querySelector("[data-search-overlay]").open = false;
});
// Listens out for a "click" on the settings cancel button and hides the settings overlay
document
  .querySelector("[data-settings-cancel]")
  .addEventListener("click", () => {
    document.querySelector("[data-settings-overlay]").open = false;
  });
// Listens out for a "click" on the search button in the header then shows the search overlay and sets the focus to the search input field
document.querySelector("[data-header-search]").addEventListener("click", () => {
  document.querySelector("[data-search-overlay]").open = true;
  document.querySelector("[data-search-title]").focus();
});
// Listens out for a "click" on the settings button in the header and shows the settings overlay
document
  .querySelector("[data-header-settings]")
  .addEventListener("click", () => {
    document.querySelector("[data-settings-overlay]").open = true;
  });
// Listens out for a "click" on the close button in the list and then hides the active list
document.querySelector("[data-list-close]").addEventListener("click", () => {
  document.querySelector("[data-list-active]").open = false;
});

//Theme function application: 
document
  .querySelector("[data-settings-form]")
  .addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const { theme } = Object.fromEntries(formData);
    applyTheme(theme);
    document.querySelector("[data-settings-overlay]").open = false; 
  });



//Search submission

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

//Show more button per page

document.querySelector("[data-list-button]").addEventListener("click", () => {
  const fragment = document.createDocumentFragment();
  renderBooks(
    matches.slice(page * BOOKS_PER_PAGE, (page + 1) * BOOKS_PER_PAGE)
  );
  document.querySelector("[data-list-items]").appendChild(fragment);
  page += 1;
  showMore();
});

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

//Function calls
renderBooks(matches.slice(0, BOOKS_PER_PAGE));
renderGenres();
renderAuthors();

//User prefered theme according to device settings.
if (
  window.matchMedia &&
  window.matchMedia("(prefers-color-scheme: dark)").matches
) {
  applyTheme("night");
} else {
  applyTheme("day");
}
