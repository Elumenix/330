class myFooter extends HTMLElement {
    constructor() {
        super();
    }

    static get observedAttributes() {
        return ['data-name', 'data-year'];
      }

      attributeChangedCallback(attributeName, oldValue, newValue) {
        console.log(attributeName, oldValue, newValue);
        if (oldValue === newValue) return;
        if (attributeName == "data-name") {
            this.name = newValue;
        }
        else if (attributeName == "data-year") {
            this.year = newValue;
        }

        this.render();
    }

    connectedCallback() {
        this.render();
    }

    render() {
        this.innerHTML = `&copy; ${this.year} ${this.name}`;
    }
}

customElements.define('my-footer', myFooter);
