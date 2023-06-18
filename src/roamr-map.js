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
      // center: [-110.31362343661425, 24.103134730434004], la paz
      center: [-99.16611594869102, 19.41083370748163],
      zoom: 12,
    });

    // Helper
    // map.on('zoomend', () => {
    //   console.log('zoom', map.getZoom());
    // });

    // Fetch locations from API and add them to the map
    RoamrMap.fetchLocations().then(locations => {
      map.addSource('my-locations', {
        type: 'geojson',
        data: locations,
        cluster: true,
        clusterMaxZoom: 13,
        clusterRadius: 60,
      });

      map.addLayer({
        id: 'my-locations',
        type: 'circle',
        source: 'my-locations',
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': '#3D3D3D',
          'circle-radius': [
            'step',
            ['get', 'point_count'],
            20,
            100,
            30,
            750,
            40,
          ],
        },
      });

      map.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'my-locations',
        filter: ['has', 'point_count'],
        layout: {
          'text-field': ['get', 'point_count_abbreviated'],
          'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
          'text-size': 12,
        },
        paint: {
          'text-color': '#fff',
        },
      });

      map.addLayer({
        id: 'unclustered-point',
        type: 'circle',
        source: 'my-locations',
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-color': '#11b4da',
          'circle-radius': 4,
          'circle-stroke-width': 1,
          'circle-stroke-color': '#fff',
        },
      });

      const markers = {};
      let markersOnScreen = {};

      function updateMarkers() {
        const newMarkers = {};
        const features = map.querySourceFeatures('my-locations');

        // For every mark visible on the map, create an HTML marker for it
        // (if we didn't yet), and add it to the map if it's not there already.
        for (const feature of features) {
          const coords = feature.geometry.coordinates;
          const props = feature.properties;

          if (!props.cluster) {
            const id = props.ID;

            let marker = markers[id];
            if (!marker) {
              const el = document.createElement('roamr-map-marker');
              el.name = props.NOMBRE;

              markers[id] = new mapboxgl.Marker({
                element: el,
              }).setLngLat(coords);
              marker = markers[id];
            }

            newMarkers[id] = marker;
            if (!markersOnScreen[id]) marker.addTo(map);
          }
        }

        // For every marker we've added previously, remove those that are no
        // longer visible.
        Object.keys(markersOnScreen).forEach(id => {
          if (!newMarkers[id]) markersOnScreen[id].remove();
        });
        markersOnScreen = newMarkers;
      }

      map.on('render', () => {
        if (!map.isSourceLoaded('my-locations')) return;
        updateMarkers();
      });

      // const markers = locations.map(location => {
      //   const roamrMapMarker = document.createElement('roamr-map-marker');
      //   // roamrMapMarker.lng = location.lng;
      //   // roamrMapMarker.lat = location.lat;
      //   // roamrMapMarker.name = location.name;
      //   // roamrMapMarker.address = location.address;
      //   // roamrMapMarker.tags = location.tags;
      //   // roamrMapMarker.createdAt = location.createdAt;
      //   roamrMapMarker.name = location.properties.NOMBRE;
      //   return new mapboxgl.Marker(roamrMapMarker)
      //     .setLngLat(location.geometry.coordinates)
      //     .addTo(map);
      // });
      // CLUSTERING
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
    });
  }

  static async fetchLocations() {
    // Get locations from API (production)
    // const response = await fetch('http://localhost:3000/locations');
    // const locations = await response.json();
    // return locations;

    // Get locations as array of features from local file (development)
    // const response = await fetch('../data/locations.json');
    // const data = await response.json();
    // const locations = data.features;
    // return locations;

    // Get locations as pure geojson from local file (development)
    const response = await fetch('../data/locations.json');
    const data = await response.json();
    return data;
  }
}

customElements.define('roamr-map', RoamrMap);
