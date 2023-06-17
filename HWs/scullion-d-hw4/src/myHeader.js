const template = document.createElement("template");
template.innerHTML = `
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bulma@0.9.4/css/bulma.min.css">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
<link href="https://api.mapbox.com/mapbox-gl-js/v2.9.1/mapbox-gl.css" rel="stylesheet">
<link rel="stylesheet" type="text/css" href="styles/default-styles.css">
<header class="hero is-small is-info is-bold p-2">
  <div class="hero-body">
    <div class="container">
      <h1 class="title"><slot name="title">No title provided</slot></h1>
      <h2 class="subtitle"><slot name="subtitle">No subtitle provided</slot></h2>
    </div>
  </div>
</header>
`;

class MyHeader extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.shadowRoot.appendChild(template.content.cloneNode(true));
    }

    static get observedAttributes() {
        return ["data-title", "data-subtitle"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        this.render();
    }

    connectedCallback() {
        this.render();
    }

    render() {
        const titleSlot = this.shadowRoot.querySelector('slot[name="title"]');
        const subtitleSlot = this.shadowRoot.querySelector('slot[name="subtitle"]');
        titleSlot.textContent = this.dataset.title || "";
        subtitleSlot.textContent = this.dataset.subtitle || "";
    }
}

customElements.define("app-header", MyHeader);
