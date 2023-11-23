import { FC, useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Map, { Layer, MapRef, Source } from 'react-map-gl';
import { MapLayerMouseEvent } from 'react-map-gl'

import { useAuthState } from "react-firebase-hooks/auth";
import { signOut } from 'firebase/auth';
import { CollectionReference, collection, doc, getDoc, getDocs, query, setDoc, updateDoc } from 'firebase/firestore';

import { auth, db, getUserDoc } from "../resources/firebase"
import { fillStyle, linesStyle } from '../resources/map-style';
import { CountyFeatureCollection, County, updateData, BaseCounty, CountyObject } from '../resources/utils';
import { FeatureCollection, bbox } from '@turf/turf';
import { Feature, Geometry } from 'geojson';



interface DashboardProps { }

const Dashboard: FC<DashboardProps> = () => {

  const navigate = useNavigate();
  const accessToken = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN
  // console.log("Access Token:", accessToken);
  

  const [user, loading, error] = useAuthState(auth)
  const [mouse, setMouse] = useState({ lat: 0, lng: 0 })
  const [allCounties, setAllCounties] = useState<CountyFeatureCollection>()
  const [currCounty, setCurrCounty] = useState<County | null>(null)

  const mapRef = useRef<MapRef>() || null;
  const [counties, setCounties] = useState<CountyObject>({})
  const [viewState, setViewState] = useState({
    longitude: -98.5696,
    latitude: 39.8282,
    zoom: 5
  });

  useEffect(() => {
    if (user && !allCounties) {
      fetch("https://raw.githubusercontent.com/kjhealy/us-county/master/data/geojson/gz_2010_us_050_00_500k.json")
        .then(v => v.json())
        .then((json: FeatureCollection<Geometry, BaseCounty>) => {
          let features = json.features.map( f => {
            return {
              ...f,
              properties: {
                id: f.properties.STATE + f.properties.COUNTY,
                visited: false,
                // visited: Boolean(Math.round(Math.random())),
                name: f.properties.NAME,
                count: 0
              }
            }
          })

          setAllCounties({type: "FeatureCollection", features})
        }).then(() => {
          console.log('hi');
        })
        .catch(console.error)
      }


    if (user) {
      const userDoc = getUserDoc(db, user.uid)
      const counties = collection(db, "users", user.uid, "counties")
      console.log("Getting counties...");
      
      // const q = query(counties)
      getDocs(query(counties)).then(c => {
        const docs = c.docs.map(d => d.data()) as County[]
        const counties = docs.map(d => [d.id, d])
                
        setCounties(Object.fromEntries(counties))
      })
      getDoc(userDoc).then(doc => {
        console.log(doc.data())
      })
    }


  }, [])

  useEffect(() => {
    if (currCounty) setCounties({ ...counties, [currCounty.id]: currCounty })
    // if (allCounties && currCounty) setAllCounties(updateData(allCounties, currCounty))

  }, [currCounty])

  useEffect(() => {
    if (allCounties) setAllCounties(updateData(allCounties, Object.values(counties)))
  
  }, [counties])
  


  // useEffect(() => {
  // if (allCounties) setAllCounties(updateData(allCounties, counties))
  // }, [counties])


  const onMove = useCallback((e: { viewState: { longitude: number; latitude: number; zoom: number; } }) => {
    // const newCenter = [e.viewState.longitude, e.viewState.latitude];

    setViewState(e.viewState)
  }, [])

  const logout = () => {
    signOut(auth).then(() => {
      navigate("/")
    }).catch(console.error)
  }

  const mouseMove = useCallback((e: MapLayerMouseEvent) => {
    setMouse(e.lngLat)
  }, [mouse])


  const onClick = async (e: MapLayerMouseEvent) => {
    if (e.features?.length) {
      const props = e.features[0].properties as County

      let updatedCounty;
      if (props.visited) {
        updatedCounty = { ...props, count: props.count + 1 }
        // setCurrCounty({...props, count: props.count+1, visits: [...props.visits, new Date()]})
      } else {
        updatedCounty = { ...props, visited: true, count: props.count + 1 }
      }
      setCurrCounty(updatedCounty)
      if (user) {
        const countyRef = doc(db, "users", user.uid, "counties", props.id)
        if ((await getDoc(countyRef)).exists()) {
          updateDoc(countyRef, updatedCounty)
        } else {
          setDoc(countyRef, updatedCounty)
        }
      }

    }
  }

  //TODO: Long click??
  const onDoubleClick = (e: MapLayerMouseEvent) => {
    if (e.features?.length) {
      const feature = e.features[0]
      const [minLng, minLat, maxLng, maxLat] = bbox(feature);
  
        mapRef?.current?.fitBounds(
          [
            [minLng, minLat],
            [maxLng, maxLat]
          ],
          {padding: 70, duration: 3000}
        );
    }
   
  }


  return (
    <div className=''>
      <div className='shadow-lg'>
        This is a navbar
        <button className=' border border-gray-500 rounded p-2' onClick={logout}>
          Log Out
        </button>
      </div>

      <div>
        <h2>Center:</h2>
        <p>Lat: {viewState.latitude.toFixed(3)}</p>
        <p>Long: {viewState.longitude.toFixed(3)}</p>
        <p>Zoom: {viewState.zoom.toFixed(3)}</p>
      </div>
      <div>
        {/* <h2>Mouse:</h2>
        <p>Lat: {mouse.lat.toFixed(3)}</p>
        <p>Long: {mouse.lng.toFixed(3)}</p>
        <p>Zoom: {viewState.zoom.toFixed(3)}</p> */}
        <p>currCounty: {JSON.stringify(currCounty)},</p>
      </div>
      {/* <button className='p-4'>
        <ArrowLeftIcon className='h-6 w-6 text-gray-900 hover:text-gray-700' onClick={() => navigate(-1)} />
      </button> */}

      <Map
        mapboxAccessToken={accessToken}
        //@ts-ignore
        ref={mapRef}
        {...viewState}

        minZoom={3}
        maxBounds={[[-170, 0], [-50, 75]]}
        style={{ width: "100%", height: "70vh" }}
        mapStyle="mapbox://styles/juddlee/clo0th5kf00an01p60t1a24s2"
        onMove={onMove}
        onMouseMove={mouseMove}
        onDblClick={onDoubleClick}
        onClick={onClick}
        maxPitch={0}
        interactiveLayerIds={['county_lines_fill']}
      >
        <Source id="counties" type="geojson" data={allCounties && allCounties}>
          <Layer beforeId="waterway-label" {...linesStyle} />
          <Layer beforeId="waterway-label" {...fillStyle} />
        </Source>
      </Map>

    </div>
  )
}

export default Dashboard;