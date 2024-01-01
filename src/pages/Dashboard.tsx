import React, { Component, RefObject } from 'react';
import { NavigateFunction, useNavigate } from 'react-router-dom';
import Map, { Layer, MapRef } from 'react-map-gl';
import { MapLayerMouseEvent } from 'react-map-gl';
import { useAuthState } from 'react-firebase-hooks/auth';
import { signOut, User } from 'firebase/auth';
import { collection, deleteDoc, doc, setDoc, } from 'firebase/firestore';
import { auth, db, getCounties, storage } from '../resources/firebase';
import { generateStyle, styles } from '../resources/map-style';
import { County, CountyFeature, CountyObject, getCountyState, countiesAreEqual, removeCounty, isEmpty } from '../resources/utils';
import { bbox } from '@turf/turf';
import { FillLayer, MapboxGeoJSONFeature } from 'mapbox-gl';

// import { XMarkIcon } from '@heroicons/react/24/solid';
import SidePanel from './components/SidePanel';

// @ts-ignore
import mapboxgl from "mapbox-gl";
import { Button, Select, Stack, Option } from '@mui/joy';
// @ts-ignore
// eslint-disable-next-line import/no-webpack-loader-syntax
mapboxgl.workerClass =
  require("worker-loader!mapbox-gl/dist/mapbox-gl-csp-worker").default; /* eslint import/no-webpack-loader-syntax: off */

const DashboardWrapper = () => {
  const navigate = useNavigate();
  const [user, loading, error] = useAuthState(auth)

  return (<>
    {user && <Dashboard navigate={navigate} user={user} />}
  </>)
}

interface DashboardProps {
  navigate: NavigateFunction,
  user: User
}

interface DashboardState {
  current: CountyFeature | null,
  sort: 'visited' | 'count',
  countyNames: boolean,
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

  private sortOptions = ['visited', 'count', 'year', 'trips', "state"]

  constructor(props: DashboardProps) {
    super(props)

    this.state = {
      current: null,
      sort: 'count',
      countyNames: true,
      mapRef: React.createRef(),
      counties: {},
      view: {
        longitude: -98.5696,
        latitude: 39.8282,
        zoom: 4,
      },
      highlightedStyle: generateStyle('count')
    }
  }

  componentDidMount() {

    document.addEventListener('keydown', this.handleEscape);

    // this.setState({ sort: 'count' })

    console.log('Getting counties...');

    getCounties(db, this.props.user.uid).then(counties => {
      this.setState({ counties })
    })
  }

  componentDidUpdate(prevProps: DashboardProps, prevState: DashboardState) {

    if (prevState.sort !== this.state.sort) {
      this.setState({ highlightedStyle: generateStyle(this.state.sort) })
    }


    if (this.state.current && prevState.current !== this.state.current) {
      const curr = this.state.current.state as County

      if (curr.visited) {
        this.setState({ counties: { ...this.state.counties, [curr.id]: this.state.current.state } })
      } else {
        const counties = removeCounty(this.state.current, this.state.counties)
        this.setState({ counties })
      }
    }


    if (this.state.counties !== prevState.counties) {

      //ADDED && EDITED
      Object.values(this.state.counties).forEach((c) => {
        if (!countiesAreEqual(prevState.counties[c.id], c)) {

          this.state.mapRef.current?.setFeatureState(this.feat(c.id), c);

          if (this.state.current?.id == c.id) {
            this.setState({ current: { ...this.state.current, state: c } });
          }

          //BUG: when counties collection doesn't exist, first county isn't set till a 2nd county is clicked
          if (Object.keys(prevState.counties).length) {
            const docRef = doc(db, 'users', this.props.user.uid, 'counties', c.id.toString())
            console.log('setting', c.id);
            setDoc(docRef, c);
          }

        }
      })

      //REMOVED
      Object.values(prevState.counties).forEach((c) => {
        if (!this.state.counties[c.id]) {

          this.state.mapRef.current?.removeFeatureState(this.feat(c.id))

          if (this.state.current?.id == c.id) {
            this.setState({ current: { ...this.state.current, state: {} } });
          }

          const docRef = doc(db, 'users', this.props.user.uid, 'counties', c.id.toString())
          console.log('deleting', c.id);
          deleteDoc(docRef).catch(console.log);
        }
      })
    }
  }

  componentWillUnmount(): void {
    document.removeEventListener('keydown', this.handleEscape);
  }

  private onMove = (e: { viewState: { longitude: number; latitude: number; zoom: number } }) => {
    if (this.longTimer) clearTimeout(this.longTimer)
    this.longTimer = null
    this.setState({ view: e.viewState });
  };

  handleEscape = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      console.log('Escape key pressed');
      this.setState({ current: null })
    }
  };

  private logout = () => {
    signOut(auth)
      .then(() => {
        this.props.navigate('/');
      })
      .catch(console.error);
  };

  private onMouseDown = (e: MapLayerMouseEvent) => {
    const features = e?.features

    this.longTimer = setTimeout(() => {
      console.log('long click', e);
      //Long/Right Click

      if (features?.length) {
        const feature = features[0] as CountyFeature
        this.setState({ current: feature });

        const [minLng, minLat, maxLng, maxLat] = bbox(feature);
        this.state.mapRef?.current?.fitBounds(
          [
            [minLng, minLat],
            [maxLng, maxLat],
          ],
          { padding: 100, duration: 3000 }
        );
      }

      this.longTimer = null
    }, 400);
  }

  //BUG: When you single click a county, then right click it deletes the county
  private onClick = (e: MapLayerMouseEvent) => {
    const features = e?.features

    if (this.longTimer && features?.length) {
      const feature = features[0] as CountyFeature

      if (isEmpty(feature.state)) {
        this.state.mapRef.current?.setFeatureState(
          this.feat(feature.id),
          {
            id: feature.id,
            visited: false,
            name: feature.properties?.name,
            state: feature.properties?.state,
            count: 0,
            lived: false
          }
        )
      }
      
      clearInterval(this.longTimer)
      this.longTimer = null

      if (e.originalEvent.detail === 1) {
        this.clickTimer = setTimeout(() => {
          console.log('single click', this.state.mapRef.current?.getFeatureState(this.feat(feature.id)));
          
          //Single Click:
          let state = this.state.mapRef.current?.getFeatureState(this.feat(feature.id)) as County

          state.visited = true
          if (this.state.sort == 'count') state.count++
          else if (state.count == 0) state.count = 1
          

          this.setState({ counties: {...this.state.counties, [state.id]: state}})

          // const [minLng, minLat, maxLng, maxLat] = bbox(feature);
          // this.state.mapRef?.current?.fitBounds(
          //   [
          //     [minLng, minLat],
          //     [maxLng, maxLat],
          //   ],
          //   { padding: 100, duration: 3000 }
          // );
        }, 200)
      } else if (this.clickTimer && e.originalEvent.detail === 2) {
        console.log('double click', feature.state);
        clearTimeout(this.clickTimer);
        this.clickTimer = null

        //Double Click:
        if (features?.length && features[0].state.visited) {
          const counties = removeCounty(features[0], this.state.counties)
          this.setState({ counties })
          // this.removeCounty(features[0])
        }
      }
    }
  }
  

  setCurrent = (current: CountyFeature | null) => {
    this.setState({ current })
  }

  render() {
    return (
      <>
        <div className="shadow-lg bg-white z-30 flex flex-auto justify-between items-center p-2">

        <div className='flex flex-auto items-center gap-3'>

        <Select defaultValue={this.state.sort} placeholder="Sort by" onChange={(e, newValue) => this.setState({ sort: newValue as 'visited' | 'count' })}>
          {this.sortOptions.map((option, index) => (
            <Option value={option}>{option}</Option>
          ))}
        </Select>
          {/* <div>
            <label>Sort by:</label>
            <select value={this.state.sort} onChange={(e) => this.setState({ sort: e.target.value as 'visited' | 'count' })}>
              {this.sortOptions.map((option, index) => (
                <option key={index} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div> */}

          <Button variant='soft' onClick={() => {this.setState({countyNames: !this.state.countyNames})}}>
            {this.state.countyNames ? "Hide Names" : "Show Names"}
          </Button>

          {/* <button className="border border-gray-500 rounded p-2" onClick={() => {this.setState({countyNames: !this.state.countyNames})}}>
            {this.state.countyNames ? "Hide Names" : "Show Names"}
          </button> */}
        </div>
          

          
          <Stack direction={'row'} spacing={1}>
            <Button variant='soft' onClick={this.logout}>
              Log Out
            </Button>
            <Button variant='outlined' onClick={this.logout}>
              Log Out
            </Button>
            <Button variant='solid' onClick={this.logout}>
              Log Out
            </Button>
            <Button variant='plain' onClick={this.logout}>
              Log Out
            </Button>
          </Stack>
          
          {/* <button className="border border-gray-500 rounded p-2" onClick={this.logout}>
            Log Out
          </button> */}
        </div>

        <div className="bg-white w-fit max-w-sm overflow-scroll absolute">
          <h2>Center:</h2>
          <p>Lat: {this.state.view.latitude.toFixed(3)}</p>
          <p>Long: {this.state.view.longitude.toFixed(3)}</p>
          <p>Zoom: {this.state.view.zoom.toFixed(3)}</p>
        </div>

        {this.state.current &&
          <SidePanel county={this.state.current} setCurrent={this.setCurrent} />}

        <Map
          mapboxAccessToken={this.accessToken}
          ref={this.state.mapRef}
          {...this.state.view}
          minZoom={2.5}
          maxPitch={0}
          doubleClickZoom={false}
          style={{ top: 0, left: 0, zIndex: -1, position: 'absolute', width: '100vw', height: '100vh' }}
          mapStyle="mapbox://styles/juddlee/clo0th5kf00an01p60t1a24s2"
          onMove={this.onMove}
          onClick={this.onClick}
          onMouseDown={this.onMouseDown}
          interactiveLayerIds={['county-fill']}
        >
          <Layer beforeId="aeroway-polygon" {...this.state.highlightedStyle} />
          <Layer type="symbol" id='county-labels' layout={{visibility: (this.state.countyNames ? "visible" : "none")}}/>
        </Map>


      </>
    );
  }
}

export default DashboardWrapper