import { Timestamp } from 'firebase/firestore';
import type { FeatureCollection, Geometry } from 'geojson';
import { MapLayerMouseEvent, MapLayerTouchEvent, MapboxGeoJSONFeature } from 'mapbox-gl';
import { MapRef } from 'react-map-gl';


export const getFeatureIdentifier = (id: number) => ({ source: 'composite', sourceLayer: 'base-counties-ids', id });


export const isEmpty = (obj: any) => {
  if (!obj) return false
  return Object.keys(obj).length == 0
}

// export function getCountyState(feature: CountyFeature) {
//   const id = feature.id as number;

//   let state: County;
//   if ((feature.state as County).visited) {
//     // console.log('already visited!');

//     state = {
//       ...(feature.state as County),
//       count: (feature.state as County).count + 1,
//     };
//   } else {
//     state = {
//       id,
//       visited: true,
//       name: feature.properties?.name,
//       state: feature.properties?.state,
//       count: 1,
//       lived: false
//     };
//   }

//   return state
// }

export const removeCounty = (feature: MapboxGeoJSONFeature, counties: CountyObject) => {
  return Object.values(counties).reduce((acc: CountyObject, c) => {
    if (c.id !== feature.id) {
      acc[c.id] = c
    }
    return acc
  }, {})


}

export type SortOptions = 'visited' | 'count' | 'year' | 'trips' | 'state'

export interface CountyProperties {
  census_area: number
  county: string
  geo_id: string
  lsad: string
  name: string
  state: string
}

export interface County {
  id: number,
  name: string,
  state: string,
  visits: Visit[],
  image?: string,
}

export interface CountyFeatureState {
  id: number
  visited: boolean,
  count: number,
  lived: boolean,
  firstYear: number,
  firstTrip: string,
  nature: string
}

export interface Visit {
  trip: string | null,
  nature: NatureOptions
  timestamp: Date
}

export interface FirebaseVisit {
  trip: string,
  nature: NatureOptions,
  timestamp: Timestamp
}

export type NatureOptions = "Layover" | "Drove Through" | "Stepped In" | "Visited" | "Stayed" | "Lived"

export type CountyFeatureCollection = FeatureCollection<Geometry, County>

export type CountyObject = { [key: string]: County }

export interface CountyFeature extends MapboxGeoJSONFeature {
  id: number,
  state: County,
  properties: CountyProperties
}