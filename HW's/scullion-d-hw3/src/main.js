import { MyBookmark } from "./myBookmark.js";
import { Favorite } from "./favorite.js";
import * as Storage from "./storage.js";

let favorites;
let textField;
let urlField;
let commentField;
let bookmark;
let numElements;
let favoriteString;
let startSaving;

const submitClicked = (evt) => {
    console.log("submitClicked");

    if ((textField.value.trim().length >= 1) && (urlField.value.trim().length >= 1) && (commentField.value.trim().length >= 1)) {
        // An FID will be generated automatically
        let favorite = new Favorite(textField.value, urlField.value, commentField.value);
        favorites.push(favorite);

        createBookmarkComponent(favorite.text, favorite.url, favorite.comments, favorite.fid);

        textField.value = "";
        urlField.value = "";
        commentField.value = "";
    }
    else {
        console.log("Not all fields are filled out correctly");
    }

    evt.preventDefault();
    return false;
}

const clearFormFields = (evt) => {
    console.log("cancelClicked");

    textField.value = "";
    urlField.value = "";
    commentField.value = "";

    evt.preventDefault();
    return false;
}

const createBookmarkComponent = (text, url, comments, fid = crypto.randomUUID()) => {
    let newBookmark = new MyBookmark(deleteFavorite);
    newBookmark.dataset.text = text;
    newBookmark.dataset.url = url;
    newBookmark.dataset.comments = comments;
    newBookmark.dataset.fid = fid;

    console.log(newBookmark.comments);

    // Create element to hold bookmark
    let newElement = document.createElement("li");
    newElement.appendChild(newBookmark);

    // put element in a list element on the page
    bookmark.appendChild(newElement);

    numElements++;
    numberChange();

    if (startSaving) {
        Storage.clearFavorites();
        Storage.setFavorites(favorites);
    }
}

const loadFavoritesFromStorage = () => {
    // Favorites gets initialized here
    favorites = Storage.getFavorites();

    if (favorites == undefined) {
        favorites = [];
        favorites.push(new Favorite("CIA", "https://cia.gov", "The Agency.", 1234));
    }

    for (let e = 0; e < favorites.length; e++) {
        createBookmarkComponent(favorites[e].text, favorites[e].url, favorites[e].comments, favorites[e].fid);
    }
}

document.querySelector("#favorite-submit-button").onclick = submitClicked;
document.querySelector("#favorite-cancel-button").onclick = clearFormFields;

window.onload = () => {
    // Establish important page elements
    textField = document.querySelector("#favorite-text");
    urlField = document.querySelector("#favorite-url");
    commentField = document.querySelector("#favorite-comments");
    bookmark = document.querySelector("#bookmarks");
    favoriteString = document.querySelector(".column div");
    startSaving = false;

    numElements = 0;
    numberChange();


    loadFavoritesFromStorage();
    startSaving = true;
}

const numberChange = () => {
    favoriteString.innerHTML = (`Number of favorites: ${numElements}`);
    console.log(favoriteString);
}

const deleteFavorite = (fid) => {
    // From here: https://stackoverflow.com/questions/5767325/how-can-i-remove-a-specific-item-from-an-array-in-javascript
    // No specific user gave me my solution, understanding how splice worked was a result of multiple answers and I modified things from there

    // Get index of correct element;
    for (let c = 0; c < favorites.length; c++) {
        if (favorites[c].fid == fid) {
            // remove from list
            favorites.splice(c, 1);

            // remove from document
            document.querySelector(`#bookmarks li:nth-child(${c + 1})`).remove();

            // update number of elements
            numElements--;
            numberChange();

            break;
        }
    }

    // Favorites are being updated
    Storage.clearFavorites();
    Storage.setFavorites(favorites);
}

