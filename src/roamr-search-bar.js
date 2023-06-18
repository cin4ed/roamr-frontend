import { LitElement, html, css } from 'lit';

class RoamrSearchBar extends LitElement {
  static styles = css`
    :host {
      position: absolute;
      top: 1rem;
      left: 50%;
      transform: translate(-50%, 0);
    }
  `;

  render() {
    return html`<input type="text" placeholder="Search" />`;
  }
}

customElements.define('roamr-search-bar', RoamrSearchBar);
