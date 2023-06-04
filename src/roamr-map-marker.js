import { LitElement, html, css } from 'lit';
import globalcss from './globalcss.js';

class RoamrMapMarker extends LitElement {
  static styles = [
    globalcss,
    css`
      :host {
        display: block;
        padding: 0.5rem;
        display: flex;
        flex-direction: column;
        align-items: center;
      }
      .marker {
        color: #fff;
      }
      .marker__img-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        background-color: #3d3d3d;
        width: fit-content;
        padding: 5px;
        border-radius: 5px;
      }
      .marker__img {
        background-image: url('http://placekitten.com/50/50/');
        width: 50px;
        height: 50px;
        background-size: 100%;
        border-radius: 5px;
      }
      .marker__name {
        font-size: 0.8rem;
        text-transform: capitalize;
        margin: 0.5rem;
      }
    `,
  ];

  static properties = {
    name: { type: String },
    address: { type: String },
    tags: { type: String },
    lng: { type: Number },
    lat: { type: Number },
    createdAt: { type: String },
  };

  render() {
    return html`
      <div class="marker">
        <div class="marker__img-container">
          <div class="marker__img"></div>
        </div>
        <p class="marker__name">${this.name}</p>
      </div>
    `;
  }
}

customElements.define('roamr-map-marker', RoamrMapMarker);
