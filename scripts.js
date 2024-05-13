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
