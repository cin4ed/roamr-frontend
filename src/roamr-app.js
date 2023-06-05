import { LitElement, html, css } from 'lit';
import globalcss from './globalcss.js';
import './roamr-map.js';

class RoamrApp extends LitElement {
  static styles = [globalcss, css``];

  render() {
    return html` <roamr-map></roamr-map> `;
  }
}

customElements.define('roamr-app', RoamrApp);
