import React, { Component, RefObject } from 'react';
import { NavigateFunction, useNavigate } from 'react-router-dom';
import { GeolocateControl, GeolocateResultEvent, Layer, MapRef, Popup } from 'react-map-gl';
import { useAuthState } from 'react-firebase-hooks/auth';
import { signOut, User } from 'firebase/auth';
import { deleteDoc, doc, setDoc, } from 'firebase/firestore';
import { FillLayer, MapLayerMouseEvent } from 'mapbox-gl';

import { Button, Select, Stack, Option, Box, IconButton, Drawer, Divider, List, ListItem, ListItemButton, Avatar, Dropdown, Menu, MenuItem, MenuButton, ModalClose, DialogTitle, Typography, Snackbar, ButtonGroup, Chip, Switch, RadioGroup, Radio, CssVarsProvider, LinearProgress, FormControl, FormHelperText, FormLabel, Input } from '@mui/joy';


import TuneRoundedIcon from '@mui/icons-material/TuneRounded';

import { County, CountyFeature, CountyObject, SortOptions, Visit, sortOptions } from '../resources/utils';
import { auth, db, getCounties } from '../resources/firebase';
import { getStyle, selectedStyle } from '../resources/map-style';

import { isEqual, isEmpty } from 'lodash'
import { saveAs } from 'file-saver'

import * as states from '../resources/states.json'

// @ts-ignore
import mapboxgl from "mapbox-gl";
import { DetailPanel } from './components/DetailPanel';
import { InteractiveMap } from './components/InteractiveMap';
import { Close, Delete, MoreVert } from '@mui/icons-material';
import SelectBar from './components/SelectBar';
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
  focused?: CountyFeature,
  sort: SortOptions
  mapRef?: RefObject<MapRef>,
  counties: CountyObject,
  view: {
    longitude: number,
    latitude: number,
    zoom: number,
  },
  highlightedStyle: FillLayer,
  snackbarOpen: boolean
  countyCount: number | null,
  stateCount: number | null,
  click: string

  toggleCountyNames: boolean,
  toggleHover: boolean,
  geoControlRef?: RefObject<mapboxgl.GeolocateControl>
  travelModeEnabled: boolean,
  currCounty?: CountyFeature

  toggleSelect: boolean
  selected: number[]
  lastModified?: CountyFeature

  hoverInfo: HoverInfo | null
  geoControlTracking: boolean
}

interface HoverInfo {
  latitude: number
  longitude: number,
  county?: CountyFeature
}

class Dashboard extends Component<DashboardProps, DashboardState> {
  private accessToken = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;
  private statesObj: { [key: string]: { state: string, abbreviation: string } } = states

  constructor(props: DashboardProps) {
    super(props)

    const sort = 'visited'

    this.state = {
      sort,
      toggleCountyNames: true,
      counties: {},
      view: {
        longitude: -98.5696,
        latitude: 39.8282,
        zoom: 4,
      },
      highlightedStyle: getStyle(sort),
      snackbarOpen: false,
      countyCount: null,
      stateCount: null,
      toggleSelect: false,
      toggleHover: false,
      travelModeEnabled: false,
      selected: [],
      geoControlRef: React.createRef(),
      mapRef: React.createRef(),

      hoverInfo: null,
      click: 'nothing',
      geoControlTracking: false
    }

  }

  componentDidMount() {

    console.log('Getting counties...');

    getCounties(db, this.props.user.uid).then(counties => {
      this.setState({ counties })
    })

  }

  componentDidUpdate(prevProps: DashboardProps, prevState: DashboardState) {

    if (prevState.toggleSelect && !this.state.toggleSelect) {
      this.setState({ selected: [] })
    }

    if (prevState.sort !== this.state.sort) {
      this.setState({ highlightedStyle: getStyle(this.state.sort) })
    }

    if (!isEqual(this.state.counties, prevState.counties)) {

      if (!isEmpty(prevState.counties)) {

        Object.values(this.state.counties).forEach(c => {
          const prev = prevState.counties[c.id]

          if (!isEqual(prev?.visits, c.visits)) {
            const docRef = doc(db, 'users', this.props.user.uid, 'counties', c.id.toString())

            console.log(c.visits?.length ? 'setting' : 'deleting', c.id);
            //BUG: when counties collection doesn't exist, first county isn't set till a 2nd county is clicked
            if (c.visits?.length) setDoc(docRef, c);
            else deleteDoc(docRef).catch(console.log);
          }
        })
      }

      const counties = Object.values(this.state.counties).filter(v => v.visits.length)
      this.setState({ countyCount: counties.length })

      const states = counties.map(c => c.state)
        .filter((v, i, arr) => arr.indexOf(v) === i)
      this.setState({ stateCount: states.length })

    }

    if (this.state.travelModeEnabled && this.state.currCounty && prevState.currCounty && (this.state.currCounty?.id != prevState.currCounty?.id)) {
      console.log('we got a new county!');
      if (!this.state.geoControlTracking) {
        this.state.geoControlRef?.current?.trigger()
      }

      this.addVisit(this.state.currCounty, { nature: 'driven' })
    }

  }

  setClickState = (str: string) => {
    this.setState({ click: str })
  }

  getCounty = (feature: number | CountyFeature) => {
    const id = (feature as CountyFeature)?.id || feature as number

    return this.state.counties[id]
  }

  setCounty = (county: County) => {

    this.setState({
      counties: { ...this.state.counties, [county.id]: county }
    })
  }

  removeCounty = (county: County) => {

    let counties = this.state.counties
    delete counties[county.id]

    this.setState({ counties })
  }

  setVisits = (id: number, visits: Visit[]) => {
    const c = this.state.counties[id]

    this.setCounty({
      ...c,
      visits
    })
  }

  addVisit = (feature: CountyFeature, options?: Partial<Visit>) => {
    const id = feature.id
    let c: County | undefined = this.state.counties[id]

    const newVisit: Visit = {
      trip: null,
      nature: 'visited',
      timestamp: new Date(),
      ...options
    }

    if (!c) {
      this.setCounty({
        id,
        name: feature.properties.name,
        state: feature.properties.state,
        visits: [newVisit]
      })
    } else {
      this.setVisits(id, [newVisit, ...c.visits])
    }
  }

  addVisits = (ids: number[]) => {
    console.log(ids);

    ids.forEach(id => {
      const features = this.state.mapRef?.current?.querySourceFeatures("composite", {
        sourceLayer: 'base-counties-ids',
        filter: ["==", ['id'], id]
      })

      if (features?.length) {
        console.log(id, features[0]);
        this.addVisit(features[0] as CountyFeature)
      }
    })
  }

  editVisit = (id: number) => (index: number, visit: Partial<Visit>) => {
    const c = this.state.counties[id]

    if (c.visits?.length && c.visits?.length > index) {

      const visits = c.visits?.map((v, i) => {
        if (i == index) return { ...v, ...visit }
        return v
      })

      this.setVisits(id, visits)
    }
  }

  removeVisit = (id: number | undefined) => (index: number) => {
    if (!id) return
    const c = this.state.counties[id]
    const visits = c.visits?.filter((v, i) => i !== index)

    this.setVisits(id, visits)
  }


  setFocused = (feature?: CountyFeature) => {
    // this.setClickState("long click")
    // console.log("long click", feature)

    this.setState({ focused: feature });
  }

  handleSnackbarClose = () => {
    this.setState({ snackbarOpen: false })
  }

  addSelected = (id: number) => {
    if (!this.state.selected.includes(id)) {
      this.setState({ selected: [...this.state.selected, id] })
    }
  }

  removeSelected = (id: number) => {
    this.setState({ selected: this.state.selected.filter(v => v !== id) })
  }

  private onMove = (e: { viewState: { longitude: number; latitude: number; zoom: number } }) => {
    // if (this.longTimer) clearTimeout(this.longTimer)
    // this.longTimer = null
    this.setState({ view: e.viewState });

  };

  onSingleClick = (feature: CountyFeature) => {
    // this.setClickState("single click")
    // console.log('single click', feature);


    if (this.state.toggleSelect) {
      if (this.state.selected.includes(feature.id)) {
        this.removeSelected(feature.id)
      } else {
        this.addSelected(feature.id)
      }
    } else {
      this.addVisit(feature)
      this.setState({ lastModified: feature })

      if (this.state.sort !== 'count' && !!this.getCounty(feature)) {
        this.setState({ snackbarOpen: true })
        // this.setFocused(feature)
      }

    }
  }

  onDoubleClick = (feature: CountyFeature) => {
    // this.setClickState("double click")
    // console.log('double click', feature);

    if (this.state.toggleSelect) {
      this.removeSelected(feature.id)
    } else {
      if (!!this.getCounty(feature)) this.setVisits(feature.id, [])

      this.setState({ lastModified: feature })
    }
  }

  onLongClick = (feature: CountyFeature) => {
    // console.log("long click", feature)

    if (!this.state.toggleSelect) this.setFocused(feature)
  }


  onMouseMove = (e: MapLayerMouseEvent) => {
    const county: CountyFeature | undefined = e.features && e.features[0] as CountyFeature

    if (e.originalEvent?.metaKey && e.originalEvent.buttons && county) {
      this.setState({ toggleSelect: true })
      this.addSelected(county.id)
    } else {


      this.setState({
        hoverInfo: {
          latitude: e.lngLat.lat,
          longitude: e.lngLat.lng,
          county
        }
      })
    }
  }

  onExportClick = () => {

    this.setState({
      view: {
        longitude: -101,
        latitude: 38,
        zoom: 3.5
      }
    })

    setTimeout(() => {
      this.state.mapRef?.current?.getCanvas().toBlob((blob) => {
        const name = "export-" + new Date().toLocaleDateString() + ".png"
        if (blob) saveAs(blob, name);
      })
    }, 1000);


  }

  private logout = (path?: string) => {
    signOut(auth)
      .then(() => {
        this.props.navigate(path || '/');
      })
      .catch(console.error);
  };

  toggleTravelMode = () => {
    if (!this.state.travelModeEnabled) {
      if (this.state.geoControlTracking) {
        this.state.geoControlRef?.current?.trigger()
      }

      this.state.geoControlRef?.current?.trigger()
    }

    // this.state.geoControlRef?.currentx
    this.setState({ travelModeEnabled: !this.state.travelModeEnabled })
  }


  onGeolocate = (e: GeolocateResultEvent) => {

    if (this.state.travelModeEnabled) {
      const coordinate: [number, number] = [e.coords.longitude, e.coords.latitude]
      const point = this.state.mapRef?.current?.project(coordinate);

      const features = this.state.mapRef?.current?.queryRenderedFeatures(point, { layers: ['county-fill', 'county-line'] })

      if (features?.length) {
        this.setState({ currCounty: features[0] as CountyFeature })
      }
    }
  }

  render() {
    return (
      <Box>
        {/* TOP MENU */}
        <Stack bgcolor={'white'} className='shadow-lg' p={1} direction='row' spacing={1}>
          <Avatar
            onClick={() => this.props.navigate('/')}
            // size='lg'
            variant='plain'
            src="/logo700.png"
            sx={{ borderRadius: 0 }}
          />

          <Dropdown>
            <MenuButton startDecorator={<TuneRoundedIcon />}>View Options</MenuButton>
            <Menu disablePortal placement='bottom-start' sx={{ p: 2, maxWidth: 200 }}>
              <Stack spacing={1}>
                <Typography level='body-xs' component="label"
                  startDecorator={
                    <Switch checked={this.state.toggleCountyNames}
                      sx={{ mr: 1 }}
                      onClick={() => this.setState({ toggleCountyNames: !this.state.toggleCountyNames })} />
                  }>
                  Show County Names
                </Typography>

                <Typography level='body-xs' component="label"
                  startDecorator={
                    <Switch checked={this.state.toggleHover}
                      sx={{ mr: 1 }}
                      onClick={() => this.setState({ toggleHover: !this.state.toggleHover })} />
                  }>
                  Show Information on Hover
                </Typography>

                <MenuItem disabled>
                  <Typography>Color by</Typography>
                </MenuItem>
                <RadioGroup
                  value={this.state.sort}
                  placeholder="Sort by"
                  onChange={(e) => {
                    const sort = e.target.value as SortOptions
                    if (sort) this.setState({ sort })
                  }}
                >
                  {Object.keys(sortOptions).map((option, index) => (
                    <Radio size='sm' sx={{ mx: 1, borderRadius: 5 }} key={index} value={option} label={sortOptions[option as SortOptions]} />
                  ))}
                </RadioGroup>
              </Stack>

            </Menu>
          </Dropdown>

          {/* TODO: PUT THESE TWO ELEMENTS IN A "OPTIONS" PopOver. Hide/Show Names as a Toggle and Sort as Radio Buttons? */}
          {!this.state.toggleSelect && <>

            {/* <Button variant='soft' onClick={() => this.setState({ toggleCountyNames: !this.state.toggleCountyNames })}>
              {this.state.toggleCountyNames ? "Hide Names" : "Show Names"}
            </Button>

            <Button variant='soft' onClick={() => { this.setState({ toggleHover: !this.state.toggleHover }) }}>
              {this.state.toggleHover ? "Hide Info" : "Show Info"}
            </Button> */}

            <Button variant='soft' onClick={this.toggleTravelMode}>
              {this.state.travelModeEnabled ? "End Travel Mode" : "Travel Mode"}
            </Button>
            <Button variant='soft' onClick={this.onExportClick}>Export as Image</Button>

            <Button variant='soft' onClick={() => { this.setState({ toggleSelect: true }) }}>Select</Button>
          </>}


          {this.state.toggleSelect && <SelectBar
            selected={this.state.selected}
            setToggleSelect={(toggleSelect) => this.setState({ toggleSelect })}
            counties={this.state.counties}
            addVisits={this.addVisits}
          />}

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
              <MenuItem onClick={() => this.logout()}>
                Log Out
              </MenuItem>
            </Menu>
          </Dropdown>

        </Stack>

        <Box p={1} m={1} borderRadius={5} bgcolor={'white'} width={180} position={'absolute'}>
          <Typography level='body-lg'>Center:</Typography>
          <Typography level='body-sm'>Lat: {this.state.view.latitude.toFixed(3)}</Typography>
          <Typography level='body-sm'>Long: {this.state.view.longitude.toFixed(3)}</Typography>
          <Typography level='body-sm'>Zoom: {this.state.view.zoom.toFixed(3)}</Typography>

          {/* <Typography level='body-lg'>Stats:</Typography>
           */}
          <Divider sx={{ my: 1 }}></Divider>
          <Typography level='body-sm'>Number of Counties: {this.state.countyCount}</Typography>
          <Typography level='body-sm'>Number of States: {this.state.stateCount}</Typography>
          {/* {this.context ?
            <Typography>{this.state.geoControlRef.}, {this.context.coords.longitude}</Typography>
            : <Typography>Loading...</Typography>
          } */}
          {/* <Typography>{this.state.click}</Typography> */}
        </Box>

        {this.state.focused &&
          <DetailPanel
            focused={this.state.counties[this.state.focused.id]}
            feature={this.state.focused}
            setVisits={this.setVisits}
            addVisit={this.addVisit}
            editVisit={this.editVisit}
            removeVisit={this.removeVisit}
            onClose={() => this.setFocused()}
          />}

        <Snackbar
          variant="plain"
          // color="success"
          // autoHideDuration={3000}
          sx={{ p: 1, pl: 2 }}
          open={this.state.snackbarOpen}
          onClose={this.handleSnackbarClose}
          anchorOrigin={{ horizontal: 'center', vertical: 'bottom' }}
          endDecorator={
            <Button
              onClick={() => { this.removeVisit(this.state.lastModified?.id)(0); this.handleSnackbarClose() }}
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
          open={this.state.travelModeEnabled}
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
            <Typography level='title-lg' sx={{ color: 'neutral.100', pb: 2}} >
              Currently in 
              <Typography sx={{textDecoration: 'underline', pl: 1}}>{this.state.currCounty?.properties.name} {this.state.currCounty?.properties.lsad}</Typography>, {this.state.currCounty && this.statesObj[this.state.currCounty.properties.state].abbreviation}
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




        {/* <Drawer
          anchor="bottom"
          invertedColors
          size='sm'
          hideBackdrop
          disableEnforceFocus
          slotProps={{
            root: {
              sx: {
                zIndex: 5
              }
            },
          }}
        >
          test
        </Drawer> */}

        <InteractiveMap
          ref={this.state.mapRef}
          counties={this.state.counties}
          focused={this.state.focused}
          style={{ width: '100%', height: '100%', zIndex: -1, position: 'absolute', top: 0 }}
          view={this.state.view}

          onSingleClick={this.onSingleClick}
          onDoubleClick={this.onDoubleClick}
          onLongClick={this.onLongClick}

          onMove={this.onMove}
          onDragStart={(e) => {
            if (e.originalEvent?.metaKey)
              e.target.dragPan.disable()
          }}
          onDragEnd={(e) => e.target.dragPan.enable()}
          onMouseMove={this.onMouseMove}
          boxZoom={!this.state.toggleSelect}

          onLoad={(e) => {
            // this.state.geoControlRef?.current?.trigger()
            this.toggleTravelMode()
          }}
          setClick={this.setClickState}
          preserveDrawingBuffer
        >
          <Layer {...selectedStyle(this.state.selected)} />
          <Layer beforeId="aeroway-polygon" {...this.state.highlightedStyle} />
          <Layer type="symbol" id='county-labels' layout={{ visibility: (this.state.toggleCountyNames ? "visible" : "none") }} />
          <GeolocateControl
            ref={this.state.geoControlRef}
            onGeolocate={this.onGeolocate}
            fitBoundsOptions={{ maxZoom: 12 }}
            position={this.state.travelModeEnabled ? 'bottom-left' : 'bottom-right'}
            positionOptions={{
              enableHighAccuracy: false,
              maximumAge: Infinity
            }}
            trackUserLocation
            onTrackUserLocationStart={(e) => this.setState({ geoControlTracking: true })}
            onTrackUserLocationEnd={(e) => {
              this.setState({ geoControlTracking: false })
            }}
            onOutOfMaxBounds={(e) => console.log('uh oh!')}
          />
          {this.state.hoverInfo?.county && this.state.view.zoom > 3 && this.state.toggleHover &&
            <Popup
              latitude={this.state.hoverInfo.latitude}
              longitude={this.state.hoverInfo.longitude}
              offset={[0, -10] as [number, number]}
              closeButton={false}
              closeOnClick={false}
            >
              <Typography level='title-sm'>
                {this.state.hoverInfo.county.properties.name} {this.state.hoverInfo.county.properties.lsad}
              </Typography>
              {this.state.hoverInfo.county.state.visited &&
                <Box pl={1}>
                  <Typography>
                    Visited {this.state.hoverInfo.county.state.count == 1 ? "once" :
                      this.state.hoverInfo.county.state.count.toString() + " times"}
                  </Typography>
                  <Typography>
                    Trips:
                    <Chip>Trip 1</Chip>
                  </Typography>
                  <p>
                    {JSON.stringify(this.state.hoverInfo.county.state)}
                  </p>
                </Box>
              }
            </Popup>}
        </InteractiveMap>

      </Box>
    );
  }
}

export default DashboardWrapper
