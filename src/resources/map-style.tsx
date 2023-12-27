import { Expression } from 'mapbox-gl';

export const styles: {[key: string]: Expression} = {
  visited: [
    "case",
    ["==", ["feature-state", "visited"], true],
    "#a9c0ea",
    "rgba(171, 195, 231, 0)"
  ],
  count: [
    "case",
    ["==", ['feature-state', "count"], null],
    "rgba(171, 195, 231, 0)",
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
      8, '#d53e4f'
    ],
  ],
}
