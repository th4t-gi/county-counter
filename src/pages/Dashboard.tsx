import React, { Component, Ref, RefObject } from 'react';
import { NavigateFunction, useNavigate } from 'react-router-dom';
import Map, { Layer, MapRef } from 'react-map-gl';
import { MapLayerMouseEvent } from 'react-map-gl';
import { useAuthState } from 'react-firebase-hooks/auth';
import { signOut, User } from 'firebase/auth';
import { deleteDoc, doc, setDoc, } from 'firebase/firestore';
import { auth, db, getCounties, getUserDoc, storage } from '../resources/firebase';
import { styles } from '../resources/map-style';
import { County, CountyFeature, CountyObject, CountyProperties } from '../resources/utils';
import { bbox } from '@turf/turf';
import { FillLayer, MapLayerTouchEvent, MapboxGeoJSONFeature } from 'mapbox-gl';

// @ts-ignore
import mapboxgl from 'mapbox-gl/dist/mapbox-gl-csp'
// @ts-ignore
// eslint-disable-next-line import/no-webpack-loader-syntax, import/no-unresolved
import MapboxWorker from 'worker-loader!mapbox-gl/dist/mapbox-gl-csp-worker'
mapboxgl.workerClass = MapboxWorker

const DashboardWrapper = () => {
  const navigate = useNavigate();
  const [user, loading, error] = useAuthState(auth)

  return (
    <Dashboard navigate={navigate} user={user} />
  )
}

interface DashboardProps {
  navigate: NavigateFunction,
  user: User | null | undefined

}

interface DashboardState {
  currCounty: CountyProperties | null,
  sort: 'visited'|'count',
  mapRef: RefObject<MapRef>,
  counties: CountyObject,
  view: {
    longitude: number,
    latitude: number,
    zoom: number,
  },
  highlightedStyle: FillLayer
}

class Dashboard extends Component<DashboardProps, DashboardState> {
  private accessToken = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;

  private feat = (id: number) => ({ source: 'composite', sourceLayer: 'base-counties-ids', id });
  private clickTimer: NodeJS.Timeout | null = null;
  private longTimer: NodeJS.Timeout | null = null;

  constructor(props: DashboardProps) {
    super(props)

    this.state = {
      currCounty: null,
      sort: 'visited',
      mapRef: React.createRef(),
      counties: {},
      view: {
        longitude: -98.5696,
        latitude: 39.8282,
        zoom: 4,
      },
      highlightedStyle: this.generateStyle()
    }
  }

  componentDidMount() {
    this.setState({sort: 'count'})

    if (this.props.user) {
      console.log('Getting counties...');

      getCounties(db, this.props.user.uid).then(counties => {
        this.setState({ counties })
      })
    }
  }

  componentDidUpdate(prevProps: DashboardProps, prevState: DashboardState) {
    
    if (prevState.sort !== this.state.sort) {
      this.setState({highlightedStyle: this.generateStyle()})
    }

    if (this.state.counties !== prevState.counties) {      
      Object.values(this.state.counties).forEach((c) => {
        this.state.mapRef.current?.setFeatureState(this.feat(c.id), c);
      });

      const removed = Object.values(prevState.counties).reduce((acc: CountyObject, c) => {
        if (!this.state.counties[c.id]) {
          acc[c.id] = c
        }
        return acc
      }, {})

      Object.values(removed).forEach(c => {
        this.state.mapRef.current?.setFeatureState(this.feat(c.id), {visited: false, count: null});
      })

      console.log('counties updated');//, this.state.counties, removed);
    }
  }

  private onMove = (e: { viewState: { longitude: number; latitude: number; zoom: number } }) => {
    if (this.longTimer) clearTimeout(this.longTimer)
    this.longTimer = null
    this.setState({ view: e.viewState });
  };

  private logout = () => {
    signOut(auth)
      .then(() => {
        this.props.navigate('/');
      })
      .catch(console.error);
  };

  private addCounty(feature: MapboxGeoJSONFeature) {
    const id = feature.id as number;
    const countyIds = Object.values(this.state.counties).map(c => c.id);

    let state: County;
    if (countyIds.includes(id)) {
      console.log('already visited!');

      state = {
        ...(feature.state as County),
        count: feature.state.count + 1,
      };
    } else {
      state = {
        id,
        visited: true,
        name: feature.properties?.name,
        count: 1,
      };
    }

    this.setState((prev) => ({
      counties: {
        ...prev.counties,
        [id]: state
      }
    }))

    if (this.props.user) {
      const docRef = doc(db, 'users', this.props.user.uid, 'counties', state.id.toString())
      setDoc(docRef, state);
      console.log("Set County", state);
    }
  }

  private removeCounty = (feature: MapboxGeoJSONFeature) => {
    const counties = Object.values(this.state.counties).reduce((acc: CountyObject, c) => {
      if (c.id !== feature.id) {
        acc[c.id] = c
      }
      return acc
    }, {})

    this.setState({counties})

    if (this.props.user && feature.id) {
      const docRef = doc(db, 'users', this.props.user.uid, 'counties', feature.id.toString())
      deleteDoc(docRef).catch(console.log);
    }
  }

  private onMouseDown = (e: MapLayerMouseEvent) => {
    const features = e?.features

    this.longTimer = setTimeout(() => {
      console.log('long click');
      if (features?.length && features[0].state.visited) {
        //Long/Right Click
        this.removeCounty(features[0])
      }
      this.longTimer = null
    }, 400);
  }

  private onClick = (e: MapLayerMouseEvent) => {
    const features = e?.features

    if (this.longTimer && features?.length) {
      const feature = features[0]
      clearInterval(this.longTimer)
      this.longTimer = null

      if (e.originalEvent.detail === 1) {
        this.clickTimer = setTimeout(() => {
          console.log('single click');
          //Single Click:
          this.setState({currCounty: feature.properties as CountyProperties});
          this.addCounty(feature)
        }, 200)
      } else if (this.clickTimer && e.originalEvent.detail === 2) {
        console.log('double click');
        clearTimeout(this.clickTimer);
        this.clickTimer = null

        //Double Click:
        this.setState({currCounty: feature.properties as CountyProperties});

        const [minLng, minLat, maxLng, maxLat] = bbox(feature);
        this.state.mapRef?.current?.fitBounds(
          [
            [minLng, minLat],
            [maxLng, maxLat],
          ],
          { padding: 100, duration: 3000 }
        );
      }
    }
  }

  generateStyle() {
    const sort = this.state?.sort || "visited"
    
    const style = {
      id: 'county-fill',
      source: 'composite',
      'source-layer': 'base-counties-ids',
      type: 'fill',
      paint: {
        'fill-color': styles[sort],
        'fill-opacity': ['interpolate', ['linear'], ['zoom'], 9, 1, 15, 0],
      },
    } as FillLayer;

    return style
  }

  render() {
    return (
      <div className="">
        <div className="shadow-lg bg-white z-30">
          This is a navbar
          <button className="border border-gray-500 rounded p-2" onClick={this.logout}>
            Log Out
          </button>
        </div>

        <div className="bg-white w-fit">
          <h2>Center:</h2>
          <p>Lat: {this.state.view.latitude.toFixed(3)}</p>
          <p>Long: {this.state.view.longitude.toFixed(3)}</p>
          <p>Zoom: {this.state.view.zoom.toFixed(3)}</p>
          <p>currCounty: {JSON.stringify(this.state.currCounty)},</p>
        </div>

        <Map
          mapboxAccessToken={this.accessToken}
          ref={this.state.mapRef}
          {...this.state.view}
          minZoom={2.5}
          maxPitch={0}
          doubleClickZoom={false}
          style={{ left: 0, top: 0, zIndex: -1, position: 'absolute', width: '100%', height: '100%' }}
          mapStyle="mapbox://styles/juddlee/clo0th5kf00an01p60t1a24s2"
          onMove={this.onMove}
          onClick={this.onClick}
          onMouseDown={this.onMouseDown}
          // onClick={this.onSingleClick}
          // onDblClick={this.onDoubleClick}
          interactiveLayerIds={['county-fill']}
        >
          <Layer beforeId="county-line" {...this.state.highlightedStyle} />
        </Map>
      </div>
    );
  }
}

export default DashboardWrapper