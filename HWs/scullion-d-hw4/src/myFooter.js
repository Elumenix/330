const temp = document.createElement("template");
temp.innerHTML = `
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bulma@0.9.4/css/bulma.min.css">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
<link href="https://api.mapbox.com/mapbox-gl-js/v2.9.1/mapbox-gl.css" rel="stylesheet">
<link rel="stylesheet" type="text/css" href="styles/default-styles.css">
<div class="footer has-background-info has-text-centered has-text-light p-1">
    &copy; <slot name="year"></slot> <slot name="title"></slot>
</div>
`;

class myFooter extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.shadowRoot.appendChild(temp.content.cloneNode(true));
    }

    static get observedAttributes() {
        return ["data-title", "data-year"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        this.render();
    }

    connectedCallback() {
        this.render();
    }

    render() {
        const titleSlot = this.shadowRoot.querySelector('slot[name="title"]');
        const yearSlot = this.shadowRoot.querySelector('slot[name="year"]');
        titleSlot.textContent = this.dataset.title || "";
        yearSlot.textContent = this.dataset.year || "";
    }

}

customElements.define("my-footer", myFooter);
