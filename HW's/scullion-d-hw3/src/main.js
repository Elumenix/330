import { MyBookmark } from "./myBookmark.js";
import { Favorite } from "./favorite.js";

let favorites = [];
let textField;
let urlField;
let commentField;
let bookmark;

const submitClicked = (evt) => {
    console.log("submitClicked");
    let string;

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
    let newBookmark = new MyBookmark();
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
}

const loadFavoritesFromStorage = () => {
    for (let e = 0; e < favorites.length; e++) {
        createBookmarkComponent(favorites[e].text, favorites[e].url, favorites[e].comments, favorites[e].fid);
    }
}

document.querySelector("#favorite-submit-button").onclick = submitClicked;
document.querySelector("#favorite-cancel-button").onclick = clearFormFields;


favorites.push(new Favorite("RIT", "https://www.rit.edu", "A private university located near Rochester, NY."));


window.onload = () => {
    // Establish important page elements
    textField = document.querySelector("#favorite-text");
    urlField = document.querySelector("#favorite-url");
    commentField = document.querySelector("#favorite-comments");
    bookmark = document.querySelector("#bookmarks");

    loadFavoritesFromStorage();
}

const deleteFavorite = (fid) => {
    for (let i = 0; i < favorites.length; i++) {

    }
}

/*
const bookmarks = [
    {
        text: "Bing",
        url: "https://www.bing.com",
        comments: "Bing is a web search engine owned and operated by Microsoft."
    },
    {
        text: "Google",
        url: "https://www.google.com",
        comments: "Google Search is a search engine provided and operated by Google."
    },
    {
        text: "DuckDuckGo",
        url: "https://duckduckgo.com/",
        comments: "DuckDuckGo (DDG) is an internet search engine that emphasizes protecting searchers' privacy."
    }
];

window.onload = () => {
    const bookmark = document.querySelector("#bookmarks");

    for (let e = 0; e < bookmarks.length; e++) {
        let element = document.createElement("my-bookmark");
        element.dataset.text = bookmarks[e].text;
        element.dataset.url = bookmarks[e].url;
        element.dataset.comments = bookmarks[e].comments;


        // Create element to hold bookmark
        let newElement = document.createElement("li");
        newElement.appendChild(element);

        // put element in a list element on the page
        bookmark.appendChild(newElement);
    }
};
*/