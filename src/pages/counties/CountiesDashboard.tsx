import React, { FC, useEffect, useRef, useState } from 'react'
import { auth, countyConverter, db } from '../../firebase';
import { useNavigate } from 'react-router-dom';
import { TuneRounded } from '@mui/icons-material';
import { Menu, Radio, Box, Input, Stack, Avatar, Dropdown, MenuButton, Typography, Switch, MenuItem, RadioGroup, Button, Divider, Snackbar, Chip } from '@mui/joy';
import { MapLayerMouseEvent } from 'mapbox-gl';
import { GeolocateControl, GeolocateResultEvent, Layer, MapRef, Popup } from 'react-map-gl';
import { DetailPanel } from './components/DetailPanel';
import { InteractiveMap } from './components/InteractiveMap';
import SelectBar from './components/SelectBar';
import { getStyle, selectedStyle } from './map-style';
import { CountyFeature, SortOptions } from "../../types";

import { saveAs } from 'file-saver'
import * as statesObj from '../../resources/states.json'
import { addVisit, deleteCounty, deleteVisit, sortOptions } from './counties';
import { collection } from 'firebase/firestore';
import { isEmpty } from 'lodash';
import { logoutUser } from '../auth/auth';
import { useFirestoreCollectionData } from 'reactfire';

const statesList: { [key: string]: { state: string, abbreviation: string } } = statesObj

interface CountiesDashboardProps { }

interface HoverInfo {
  latitude: number
  longitude: number,
  county?: CountyFeature
}

const CountiesDashboard: FC<CountiesDashboardProps> = (props) => {
  const navigate = useNavigate();
  const mapRef = useRef<MapRef>(null)
  const geoControlRef = useRef<mapboxgl.GeolocateControl>(null)
  const [geoControlTracking, setGeoControlTracking] = useState(false)

  const [view, setView] = useState({
    longitude: -98.5696,
    latitude: 39.8282,
    zoom: 4
  })
  const [hoverInfo, setHoverInfo] = useState<HoverInfo>()
  const [selected, setSelected] = useState<number[]>([])
  const [sort, setSort] = useState<SortOptions>('visited')
  const [focusedFeature, setFocusedFeature] = useState<CountyFeature | null>(null)
  const [lastModified, setLastModified] = useState<CountyFeature | null>(null)
  const [currCounty, setCurrCounty] = useState<CountyFeature | null>(null)

  const [selectMode, setSelectMode] = useState(false)
  const [travelMode, setTravelMode] = useState(false)
  const [showInfoOnHover, setShowInfoOnHover] = useState(false)
  const [showCountyNames, setShowCountyNames] = useState(true)
  const [snackbarOpen, setSnackbarOpen] = useState(false)

  // const { data: signInResult, status: authStatus } = useSigninCheck();

  const countiesRef = collection(db, 'users', auth.currentUser!.uid, 'counties').withConverter(countyConverter)
  const { data: counties } = useFirestoreCollectionData(countiesRef, { idField: '' });

  const countyCount = counties?.length

  const stateCount = counties?.map(v => v.state).filter((v, i, arr) => arr.indexOf(v) === i).length

  useEffect(() => {
    if (!selectMode) {
      setSelected([])
    }
  }, [selectMode])

  useEffect(() => {
    if (travelMode && currCounty) {
      console.log('we got a new county!');
      if (!geoControlTracking) {
        geoControlRef?.current?.trigger()
      }

      addVisit(auth.currentUser!.uid, currCounty, !isEmpty(currCounty.state))
    }
  }, [currCounty, travelMode, geoControlTracking])

  useEffect(() => {
    if (focusedFeature) {
      const features = mapRef?.current?.querySourceFeatures("composite", {
        sourceLayer: 'base-counties-ids',
        filter: ["==", ['id'], focusedFeature?.id]
      })

      if (features?.length) {
        setFocusedFeature(features[0] as CountyFeature)
      }
    }

  }, [mapRef.current, focusedFeature])


  const addSelected = (id: number) => {
    if (!selected.includes(id)) setSelected([...selected, id])
  }

  const removeSelected = (id: number) => setSelected(selected.filter(v => v !== id))

  const onSingleClick = (feature: CountyFeature) => {
    // this.setClickState("single click")


    if (selectMode) {
      if (selected.includes(feature.id)) {
        removeSelected(feature.id)
      } else {
        addSelected(feature.id)
      }
    } else {
      const county = counties.find(c => c.id === feature.id)
      addVisit(auth.currentUser!.uid, feature, !!county?.visits.length)
      setLastModified(feature)

      if (sort !== 'count' && !!counties[feature.id]) {
        setSnackbarOpen(true)
      }
    }
  }

  const onDoubleClick = (feature: CountyFeature) => {
    // this.setClickState("double click")
    // console.log('double click', feature);

    if (selectMode) {
      removeSelected(feature.id)
    } else {
      deleteCounty(feature.id)
      setLastModified(feature)
    }
  }

  const onLongClick = (feature: CountyFeature) => {
    // console.log("long click", feature)

    setFocusedFeature(feature)
  }

  const onMouseMove = (e: MapLayerMouseEvent) => {
    const county: CountyFeature | undefined = e.features && e.features[0] as CountyFeature

    if (e.originalEvent?.metaKey && e.originalEvent.buttons && county) {
      setSelectMode(true)
      addSelected(county.id)
    } else {
      setHoverInfo({
        latitude: e.lngLat.lat,
        longitude: e.lngLat.lng,
        county
      })
    }
  }

  const onExportClick = () => {
    setView({
      longitude: -101,
      latitude: 38,
      zoom: 3.5
    })

    setTimeout(() => {
      mapRef?.current?.getCanvas().toBlob((blob) => {
        const name = "export-" + new Date().toLocaleDateString() + ".png"
        if (blob) saveAs(blob, name);
      })
    }, 1000);
  }

  const toggleTravelMode = () => {
    if (!travelMode) {
      geoControlRef?.current?.trigger()
    }

    setTravelMode(!travelMode)
  }


  const onGeolocate = (e: GeolocateResultEvent) => {

    if (travelMode) {
      const coordinate: [number, number] = [e.coords.longitude, e.coords.latitude]
      const point = mapRef?.current?.project(coordinate);

      const features = mapRef?.current?.queryRenderedFeatures(point, { layers: ['county-fill', 'county-line'] }) as CountyFeature[]

      if (features?.length) {
        setCurrCounty(features[0])
      }
    }
  }

  return (
    <Box>
      {/* TOP MENU */}
      <Stack bgcolor={'white'} className='shadow-lg' p={1} direction='row' spacing={1}>
        <Avatar
          onClick={() => navigate('/')}
          // size='lg'
          variant='plain'
          src="/logo700.png"
          sx={{ borderRadius: 0 }}
        />

        <Dropdown>
          <MenuButton startDecorator={<TuneRounded />}>View Options</MenuButton>
          <Menu disablePortal placement='bottom-start' sx={{ p: 2, maxWidth: 200 }}>
            <Stack spacing={1}>
              <Typography level='body-xs' component="label"
                startDecorator={
                  <Switch checked={showCountyNames}
                    sx={{ mr: 1 }}
                    onClick={() => setShowCountyNames(!showCountyNames)} />
                }>
                Show County Names
              </Typography>

              {/* <Typography level='body-xs' component="label"
                startDecorator={
                  <Switch checked={showInfoOnHover}
                    sx={{ mr: 1 }}
                    onClick={() => setShowInfoOnHover(!showInfoOnHover)} />
                }>
                Show Information on Hover
              </Typography> */}

              <MenuItem disabled>
                <Typography>Color by</Typography>
              </MenuItem>
              <RadioGroup
                value={sort}
                onChange={(e) => setSort(e.target.value as SortOptions)}
              >
                {Object.keys(sortOptions).map((option, index) => (
                  <Radio size='sm' sx={{ mx: 1, borderRadius: 5 }} key={index} value={option} label={sortOptions[option as SortOptions]} />
                ))}
              </RadioGroup>
            </Stack>

          </Menu>
        </Dropdown>


        {selectMode ? <SelectBar
          selected={selected}
          setSelectMode={setSelectMode}
          counties={counties}
          mapRef={mapRef}
        /> :
          <>
            <Button variant='soft' onClick={toggleTravelMode}>
              {travelMode ? "End Travel Mode" : "Travel Mode"}
            </Button>
            <Button variant='soft' onClick={onExportClick}>Export as Image</Button>
            <Button variant='soft' onClick={() => setSelectMode(true)}>Select</Button>
          </>
        }

        {/* Spacer */}
        <Box flexGrow={1}></Box>

        <Dropdown>
          <MenuButton slots={{ root: Avatar }} sx={{
            '& .MuiAvatar-root:hover': {
              opacity: 0.6,
            }
          }}>
            <Avatar />
          </MenuButton>
          <Menu placement='bottom-start' sx={{ p: 1, zIndex: 10 }}>
            <MenuItem >
              My Profile
            </MenuItem>
            <MenuItem>
              My Trips
            </MenuItem>
            <MenuItem>
              Settings
            </MenuItem>
            <Divider></Divider>
            <MenuItem onClick={() => {
              logoutUser()
              navigate("/")
            }}>
              Log Out
            </MenuItem>
          </Menu>
        </Dropdown>

      </Stack>

      <Box p={1} m={1} borderRadius={5} bgcolor={'white'} width={180} position={'absolute'}>
        <Typography level='body-lg'>Center:</Typography>
        <Typography level='body-sm'>Lat: {view.latitude.toFixed(3)}</Typography>
        <Typography level='body-sm'>Long: {view.longitude.toFixed(3)}</Typography>
        <Typography level='body-sm'>Zoom: {view.zoom.toFixed(3)}</Typography>

        {/* <Typography level='body-lg'>Stats:</Typography>
         */}
        <Divider sx={{ my: 1 }}></Divider>
        <Typography level='body-sm'>Number of Counties: {countyCount}</Typography>
        <Typography level='body-sm'>Number of States: {stateCount}</Typography>
        {/* {this.context ?
          <Typography>{this.state.geoControlRef.}, {this.context.coords.longitude}</Typography>
          : <Typography>Loading...</Typography>
        } */}
        {/* <Typography>{this.state.click}</Typography> */}
      </Box>

      {focusedFeature &&
        <DetailPanel
          focused={focusedFeature}
          onClose={() => setFocusedFeature(null)}
        />}

      <Snackbar
        variant="plain"
        // color="success"
        // autoHideDuration={3000}
        sx={{ p: 1, pl: 2 }}
        open={snackbarOpen}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ horizontal: 'center', vertical: 'bottom' }}
        endDecorator={
          <Button
            onClick={() => {
              const county = counties.find(c => c.id == lastModified?.id)
              if (county) {
                deleteVisit(county, county.visits.length - 1)
              }
              setSnackbarOpen(false)
            }}
            size="sm"
            variant="plain"
          // color="success"
          >
            Undo
          </Button>
        }
      >
        Added Visit
      </Snackbar>

      {/* <CssVarsProvider defaultMode="system"> */}
      <Snackbar
        open={travelMode}
        sx={(theme) => ({
          [theme.breakpoints.up('xs')]: {
            backgroundColor: 'neutral.800',
            width: 380,
            height: 200,
            border: 'none',
            pt: 1,
            pb: 2,
          },
          [theme.breakpoints.only('xs')]: {
            top: 'unset',
            bottom: 0,
            // left: 0,
            // right: 0,
            borderBottomLeftRadius: 0,
            borderBottomRightRadius: 0,
            // transform: 'none',
            width: '100vw',
          }
        })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        size='lg'
      >

        <Stack width='100%' height='100%' alignItems='center'>
          {/* <LinearProgress sx={{ width: '100%' }} variant="plain" /> */}

          <Typography level='h2' sx={{ color: 'neutral.100' }}>
            Travel Mode
          </Typography>
          <Typography level='title-lg' sx={{ color: 'neutral.100', pb: 2 }} >
            Currently in
            <Typography sx={{ textDecoration: 'underline', pl: 1 }}>{currCounty?.properties.name} {currCounty?.properties.lsad}</Typography>, {currCounty && statesList[currCounty.properties.state].abbreviation}
          </Typography>

          <Stack direction={'row'} alignItems={'center'} spacing={1}>
            <Typography level='body-lg' sx={{ color: 'neutral.100' }}>Trip: </Typography>
            <Input placeholder="Trip Name" />
          </Stack>

          {/* <Typography level='title-lg' sx={{ color: 'neutral.100', pb: 2}} >
            Entered at some time
          </Typography> */}

          {/* TRIP NAME INPUT, COORDINATES, COUNTY SEAT, POPULATION, TIME ENTERED, TIMES VISITED */}

        </Stack>


      </Snackbar>
      {/* </CssVarsProvider> */}

      <InteractiveMap
        ref={mapRef}
        focused={focusedFeature}
        style={{ width: '100%', height: '100%', zIndex: -1, position: 'absolute', top: 0 }}
        view={view}
        counties={counties}

        onSingleClick={onSingleClick}
        onDoubleClick={onDoubleClick}
        onLongClick={onLongClick}

        onMove={(e) => setView(e.viewState)}
        onDragStart={(e) => {
          if (e.originalEvent?.metaKey)
            e.target.dragPan.disable()
        }}
        onDragEnd={(e) => e.target.dragPan.enable()}
        onMouseMove={onMouseMove}
        boxZoom={!selectMode}

        onLoad={(e) => {
          geoControlRef?.current?.trigger()
          // this.toggleTravelMode()
        }}
        preserveDrawingBuffer
      >
        <Layer {...selectedStyle(selected)} />
        <Layer beforeId="aeroway-polygon" {...getStyle(sort)} />
        <Layer type="symbol" id='county-labels' layout={{ visibility: (showCountyNames ? "visible" : "none") }} />
        <GeolocateControl
          ref={geoControlRef}
          onGeolocate={onGeolocate}
          fitBoundsOptions={{ maxZoom: 12 }}
          position={travelMode ? 'bottom-left' : 'bottom-right'}
          positionOptions={{
            enableHighAccuracy: false,
            maximumAge: Infinity
          }}
          trackUserLocation
          onTrackUserLocationStart={(e) => setGeoControlTracking(true)}
          onTrackUserLocationEnd={(e) => setGeoControlTracking(true)}
          onOutOfMaxBounds={(e) => console.log('uh oh!')}
        />
        {hoverInfo?.county && view.zoom > 3 && showInfoOnHover &&
          <Popup
            latitude={hoverInfo.latitude}
            longitude={hoverInfo.longitude}
            offset={[0, -10] as [number, number]}
            closeButton={false}
            closeOnClick={false}
          >
            <Typography level='title-sm'>
              {hoverInfo.county.properties.name} {hoverInfo.county.properties.lsad}
            </Typography>
            {hoverInfo.county.state.visited &&
              <Box pl={1}>
                <Typography>
                  Visited {hoverInfo.county.state.count == 1 ? "once" :
                    hoverInfo.county.state.count.toString() + " times"}
                </Typography>
                <Typography>
                  Trips:
                  <Chip>Trip 1</Chip>
                </Typography>
                <p>
                  {JSON.stringify(hoverInfo.county.state)}
                </p>
              </Box>
            }
          </Popup>}
      </InteractiveMap>

    </Box>
  )
}

export default CountiesDashboard