import { LitElement, html, css } from 'lit';
// eslint-disable-next-line import/no-unresolved
import mapboxgl from 'https://cdn.skypack.dev/mapbox-gl';
import globalcss from './globalcss.js';
import mapboxcss from './mapboxcss.js';
import './roamr-map-marker.js';

mapboxgl.accessToken = process.env.MAPBOX_API_KEY;

class RoamrMap extends LitElement {
  static styles = [
    globalcss,
    mapboxcss,
    css`
      :host {
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
      }
      #map {
        position: absolute;
        top: 0;
        bottom: 0;
        width: 100%;
      }
    `,
  ];

  render() {
    return html` <div id="map"></div> `;
  }

  firstUpdated() {
    const mapContainer = this.renderRoot.querySelector('#map');

    // eslint-disable-next-line no-unused-vars
    const map = new mapboxgl.Map({
      container: mapContainer,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [-110.31362343661425, 24.103134730434004],
      zoom: 14,
    });

    // Fetch locations from API and add them to the map
    RoamrMap.fetchLocations().then(locations => {
      const markers = locations.map(location => {
        const roamrMapMarker = document.createElement('roamr-map-marker');
        roamrMapMarker.lng = location.lng;
        roamrMapMarker.lat = location.lat;
        roamrMapMarker.name = location.name;
        roamrMapMarker.address = location.address;
        roamrMapMarker.tags = location.tags;
        roamrMapMarker.createdAt = location.createdAt;

        return new mapboxgl.Marker(roamrMapMarker)
          .setLngLat([location.lng, location.lat])
          .addTo(map);
      });

      map.addSource('marker-cluster', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: markers.map(marker => ({
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'Point',
              coordinates: marker.getLngLat().toArray(),
            },
          })),
        },
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 50,
      });

      // map.addLayer({
      //   id: 'clusters',
      //   type: 'circle',
      //   source: 'marker-cluster',
      //   filter: ['has', 'point_count'],
      //   paint: {
      //     'circle-color': 'blue',
      //     'circle-radius': [
      //       'step',
      //       ['get', 'point_count'],
      //       20,
      //       100,
      //       30,
      //       750,
      //       40,
      //     ],
      //   },
      // });

      // map.addLayer({
      //   id: 'cluster-count',
      //   type: 'symbol',
      //   source: 'marker-cluster',
      //   filter: ['has', 'point_count'],
      //   layout: {
      //     'text-field': '{point_count_abbreviated}',
      //     'text-size': 12,
      //   },
      // });
    });
  }

  static async fetchLocations() {
    const response = await fetch('http://localhost:3000/locations');
    const locations = await response.json();
    return locations;
  }
}

customElements.define('roamr-map', RoamrMap);
