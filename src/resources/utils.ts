import { Timestamp } from 'firebase/firestore';
import type { FeatureCollection, Geometry } from 'geojson';
import { MapboxGeoJSONFeature } from 'mapbox-gl';

// export const updateData = (featureCollection: CountyFeatureCollection, county: County|County[]): CountyFeatureCollection => {
//   //TODO: save to firestore aswell

//   // featureCollection.features.find((v, i))

//   return {
//     type: 'FeatureCollection',
//     features: featureCollection.features.map((f, i) => {
//       // let id = f.properties.GEO_ID
//       // id = id.slice(id.length-5)
//       if (county instanceof Array) {
//         for (const c of county) {
//           if (c.id === f.properties.id) 
//             return { ...f, properties: c };
//         }
//       } else if (county.id === f.properties.id) {
//         // const properties = {
//         //   //coment
//         //   ...f.properties,
//         //   ...county
//         // };
//         return { ...f, properties: county };
//       }
//       return f
//     })
//   }

// }

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
  visited: boolean,
  count: number,
  visits?: Timestamp[],
  image?: string,
  // state: string,
  trips?: string[]
}

export type CountyFeatureCollection = FeatureCollection<Geometry, County>

export type CountyObject = { [key: string]: County }

export interface CountyFeature extends MapboxGeoJSONFeature {
  state: County
}