import { Expression, FillLayer, LineLayer } from 'mapbox-gl';
import { SortOptions } from '../../types';

// const colorArray = ["#63a088", "#f9e784", "#7582a9", "#eb8258", "#f8333c", "#b24c63"]

export function getStyle(sort: SortOptions) {

  const style: FillLayer = {
    id: 'county-fill',
    source: 'composite',
    'source-layer': 'base-counties-ids',
    type: 'fill',
    paint: {
      'fill-color': styles[sort],
      'fill-opacity': ['interpolate', ['linear'], ['zoom'], 9, 1, 15, 0],
    },
  }

  return style
}

export const styles: { [key in SortOptions]?: Expression } = {
  visited: [
    "case",
    ["==", ['feature-state', "lived"], true],
    "#000000",
    ["==", ["feature-state", "visited"], true],
    "#a9c0ea",

    "rgba(171, 195, 231, 0)"
  ],
  count: [
    "case",
    ["==", ['feature-state', "count"], null],
    "rgba(171, 195, 231, 0)",
    ["==", ['feature-state', "lived"], true],
    "#000000",
    [
      "interpolate",
      ["linear"],
      ["feature-state", "count"],
      1, '#66c2a5',
      2, '#abdda4',
      3, '#e6f598',
      4, '#ffffbf',
      5, '#fee08b',
      6, '#fdae61',
      7, '#f46d43',
      8, '#d53e4f',
    ],
  ],
  year: [
    "case",
    ["==", ['feature-state', "count"], null],
    "rgba(171, 195, 231, 0)",
    ["==", ['feature-state', "lived"], true],
    "#000000",
    [
      "interpolate",
      ["linear"],
      ["feature-state", "firstYear"],
      1900, '#66c2a5',
      1950, '#abdda4',
      2000, '#e6f598',
      2010, '#ffffbf',
      2015, '#fee08b',
      2020, '#fdae61',
      2023, '#f46d43',
      2024, '#d53e4f',
    ],
  ],
  nature: [
    "case",
    ["==", ['feature-state', "nature"], "layover"],
    '#66c2a5',
    ["==", ['feature-state', "nature"], "driven"],
    '#e6f598',
    ["==", ['feature-state', "nature"], "steppedIn"],
    '#ffffbf',
    ["==", ['feature-state', "nature"], "visited"],
    '#fee08b',
    ["==", ['feature-state', "nature"], "stayed"],
    '#fdae61',
    ["==", ['feature-state', "nature"], "lived"],
    '#000000',
    "rgba(171, 195, 231, 0)",
  ]
}

export const selectedStyle = (counties: number[]): LineLayer => ({
  type: 'line',
  source: 'composite',
  'source-layer': 'base-counties-ids',
  id: 'selected',
  layout: {
    "line-join": "bevel",
    "line-cap": "round",
  },
  filter: [
    "match",
    ["id"],
    [0, ...counties],
    true,
    false
  ],
  paint: {
    "line-color": "rgba(119, 137, 238, 0.5)",
    "line-opacity": 1,
    "line-width": [
      "interpolate",
      ["exponential", 1.56],
      ["zoom"],
      2.5,
      1,
      6,
      5
    ],
  }
})