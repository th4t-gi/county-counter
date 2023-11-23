import { FeatureCollection } from 'geojson';
import type { LineLayer, FillLayer } from 'react-map-gl';

export const geojson: FeatureCollection = {
  type: 'FeatureCollection',
  features: [
    { type: 'Feature', geometry: { type: 'Point', coordinates: [-122.4, 37.8] }, properties: {} }
  ]
};

export const filterStyle: FillLayer = {
  id: "county_lines_filter",
  source: 'counties',
  type: "fill",
  paint: {
    'fill-color': "#3288bd"
  }
}

export const fillStyle: FillLayer = {
  id: "county_lines_fill",
  source: 'counties',
  type: "fill",
  paint: {
    "fill-color": [
      'case',
      ['==', ['get', 'visited'], true], '#3288bd',
      "#888888",
    ],
    "fill-opacity": [
      'case',
      ['==', ['get', 'visited'], true], .8,
      0.2,
    ],
  },
}

export const linesStyle: LineLayer = {
  id: "county_lines_outline",
  type: 'line',
  paint: {
    'line-width': .5,
    // 'line-color': '#9ca09f'
    'line-color': '#888888'
  },
}
