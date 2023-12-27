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

export const countiesAreEqual = (a: County, b: County) => {

  return a && b && a.id === b.id &&
    a.name === b.name &&
    a.visited === b.visited &&
    a.count === b.count &&
    a.lived === b.lived &&
    a.id === b.id
}

export function getCountyState(feature: CountyFeature) {
  const id = feature.id as number;

  let state: County;
  if ((feature.state as County).visited) {
    // console.log('already visited!');

    state = {
      ...(feature.state as County),
      count: (feature.state as County).count + 1,
    };
  } else {
    state = {
      id,
      visited: true,
      name: feature.properties?.name,
      state: feature.properties?.state,
      count: 1,
      lived: false
    };
  }

  return state
}

export const removeCounty = (feature: MapboxGeoJSONFeature, counties: CountyObject) => {
  return Object.values(counties).reduce((acc: CountyObject, c) => {
    if (c.id !== feature.id) {
      acc[c.id] = c
    }
    return acc
  }, {})


}

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
  visited: boolean,
  count: number,
  lived: boolean,
  visits?: Timestamp[],
  image?: string,
  // state: string,
  trips?: string[]
}

export type CountyFeatureCollection = FeatureCollection<Geometry, County>

export type CountyObject = { [key: string]: County }

export interface CountyFeature extends MapboxGeoJSONFeature {
  id: number,
  state: County | {},
  properties: CountyProperties
}