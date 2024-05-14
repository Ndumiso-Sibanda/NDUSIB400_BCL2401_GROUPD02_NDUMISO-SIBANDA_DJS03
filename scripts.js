import { books, authors, genres, BOOKS_PER_PAGE } from "./data.js";

let page = 1;
let matches = books;

function createBookElement(book) {
 const { author, id, image, title } = book;
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
 return element;
}

function populateGenres() {
 const genreSelect = document.querySelector("[data-search-genres]");
 genreSelect.innerHTML = `<option value="any">All Genres</option>`;
 for (const [id, name] of Object.entries(genres)) {
  const option = document.createElement("option");
  option.value = id;
  option.innerText = name;
  genreSelect.appendChild(option);
 }
}

function populateAuthors() {
 const authorSelect = document.querySelector("[data-search-authors]");
 authorSelect.innerHTML = `<option value="any">All Authors</option>`;
 for (const [id, name] of Object.entries(authors)) {
  const option = document.createElement("option");
  option.value = id;
  option.innerText = name;
  authorSelect.appendChild(option);
 }
}

function updateTheme() {
 const themeValue =
  window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
   ? "night"
   : "day";
 const root = document.documentElement;
 root.style.setProperty(
  "--color-dark",
  themeValue === "night" ? "255, 255, 255" : "10, 10, 20"
 );
 root.style.setProperty(
  "--color-light",
  themeValue === "night" ? "10, 10, 20" : "255, 255, 255"
 );
 document.querySelector("[data-settings-theme]").value = themeValue;
}

function updateListButton() {
 const remaining = Math.max(matches.length - page * BOOKS_PER_PAGE, 0);
 const button = document.querySelector("[data-list-button]");
 button.innerText = `Show more (${remaining})`;
 button.disabled = remaining <= 0;
}

function renderBooks() {
 const fragment = document.createDocumentFragment();
 for (const book of matches.slice(
  (page - 1) * BOOKS_PER_PAGE,
  page * BOOKS_PER_PAGE
 )) {
  const element = createBookElement(book);
  fragment.appendChild(element);
 }
 document.querySelector("[data-list-items]").innerHTML = "";
 document.querySelector("[data-list-items]").appendChild(fragment);
}

function handleShowMore() {
 page += 1;
 renderBooks();
 updateListButton();
}

function handleBookClick(event) {
 const target = event.target;
 const previewId = target.closest(".preview")?.getAttribute("data-preview");
 if (!previewId) return;
 const activeBook = books.find((book) => book.id === previewId);
 if (!activeBook) return;
 document.querySelector("[data-list-active]").open = true;
 document.querySelector("[data-list-blur]").src = activeBook.image;
 document.querySelector("[data-list-image]").src = activeBook.image;
 document.querySelector("[data-list-title]").innerText = activeBook.title;
 document.querySelector("[data-list-subtitle]").innerText = `${
  authors[activeBook.author]
 } (${new Date(activeBook.published).getFullYear()})`;
 document.querySelector("[data-list-description]").innerText =
  activeBook.description;
}
