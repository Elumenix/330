class MyBookmark extends HTMLElement {
    // called when the component is first created, but before it is added to the DOM
    constructor() {
        super();
        this._text = "RIT";
        this._url = "https://www.rit.edu/";
        this._comments = "No comments found";

        // Attach a shadow DOM tree to this instance - this reates `.shadowRoot` for us
        this.attachShadow({ mode: "open" });
        // Clone `template` and append it
        this.shadowRoot.appendChild(template.content.cloneNode(true));
    }

    // tell the component what attributes to "watch"
    static get observedAttributes() {
        return ["data-text", "data-url", "data-comments"];
    }

    // ** lifecycle events **

    // called when the component is inserted into the DOM
    connectedCallback() {
        this.render();
    }

    // this method is invoked each time one of the component's "watched" attributes changes
    attributeChangedCallback(attributeName, oldValue, newValue) {
        console.log(attributeName, oldValue, newValue);
        if (oldValue === newValue) return;
        if (attributeName == "data-text") {
            this._text = newValue;
        }
        if (attributeName == "data-url") {
            this._url = newValue;
        }
        if (attributeName == "data-comments") {
            this._comments = newValue;
        }
        this.render();
    }

    // helper method
    render() {
        //this.innerHTML = `<span><a href="${this._url}">${this._text}</a></span>`;

        // Is the template loaded?
        let a = this.shadowRoot.querySelector("a");
        // if so, update the shadow DOM
        if (a) {
            a.href = this._url;
            a.textContent = this._text;
            a.title = this._comments;
        }
    }
}

const template = document.createElement("template");
template.innerHTML = `
    <style>
        :host{
            display: inline-block;
            background-color: #ddd;
        }
        span{
            color: #F76902;
            font-variant: small-caps;
            font-weight: bolder;
            font-family: sans-serif;
        }
        </style>
        <span><a href="">???</a></span>
        `;


customElements.define('my-bookmark', MyBookmark);

export { MyBookmark };
