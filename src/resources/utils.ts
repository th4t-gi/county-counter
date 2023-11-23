import { Timestamp } from 'firebase/firestore';
import type { FeatureCollection, Geometry } from 'geojson';

export const updateData = (featureCollection: CountyFeatureCollection, county: County|County[]): CountyFeatureCollection => {
  //TODO: save to firestore aswell

  // featureCollection.features.find((v, i))

  return {
    type: 'FeatureCollection',
    features: featureCollection.features.map((f, i) => {
      // let id = f.properties.GEO_ID
      // id = id.slice(id.length-5)
      if (county instanceof Array) {
        for (const c of county) {
          if (c.id === f.properties.id) 
            return { ...f, properties: c };
        }
      } else if (county.id === f.properties.id) {
        // const properties = {
        //   //coment
        //   ...f.properties,
        //   ...county
        // };
        return { ...f, properties: county };
      }
      return f
    })
  }

}

export interface BaseCounty {
  CENSUSAREA: number
  COUNTY: string
  GEO_ID: string
  LSAD: "County"
  NAME: string
  STATE: string,
  // // currIndex?: number,
  // id: string,
  // name: string,
  // selected?: boolean
}

export interface County {
  id: string,
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