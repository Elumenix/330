import { MyBookmark } from "./myBookmark.js";

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