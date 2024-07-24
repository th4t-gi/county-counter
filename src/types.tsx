import { Timestamp } from 'firebase/firestore';
import type { FeatureCollection, Geometry } from 'geojson';
import { MapboxGeoJSONFeature } from 'mapbox-gl';


export interface CountyProperties {
  census_area: number
  county: string
  geo_id: string
  lsad: string
  name: string
  state: string
  state_name: string
}

export interface County<T = Visit> {
  id: number,
  name: string,
  state: string,
  visits: T[],
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
  timestamp: string
}

export interface FirebaseVisit {
  trip: string | null,
  nature: NatureOptions,
  timestamp: Timestamp
}

export type SortOptions = 'visited' | 'count' | 'year' | 'trips' | 'state' | 'nature'

export type NatureOptions = "layover" | "driven" | "steppedIn" | "visited" | "stayed" | "lived"

export type CountyFeatureCollection = FeatureCollection<Geometry, County>

export type CountyObject = { [key: string]: County }

export interface CountyFeature extends MapboxGeoJSONFeature {
  id: number,
  state: CountyFeatureState,
  properties: CountyProperties
}

export interface USCity {
  city: string
  city_ascii: string
  state_id: string
  state_name: string
  county_fips: number
  county_name: string
  lat: number
  lng: number
  population: number
  density: number
  military: boolean
  timezone: string
  ranking: number
  id: number
}

export interface Profile {
  username: string,
  email: string,
  hometown: USCity | null,
  settings: {
    theme: "light" | "dark"
  }
}

export interface ProfilePayload {
  username: string,
  email: string,
  password: string,
  hometown: USCity | null,
}

export interface LoginPayload {
  email: string,
  password: string
}