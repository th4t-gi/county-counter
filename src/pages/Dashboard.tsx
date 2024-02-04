import React, { Component, RefObject } from 'react';
import { NavigateFunction, useNavigate } from 'react-router-dom';
import { GeolocateControl, Layer, MapRef, Popup } from 'react-map-gl';
import { useAuthState } from 'react-firebase-hooks/auth';
import { signOut, User } from 'firebase/auth';
import { deleteDoc, doc, setDoc, } from 'firebase/firestore';
import { FillLayer, MapLayerMouseEvent } from 'mapbox-gl';

import { Button, Select, Stack, Option, Box, IconButton, Drawer, Divider, List, ListItem, ListItemButton, Avatar, Dropdown, Menu, MenuItem, MenuButton, ModalClose, DialogTitle, Typography, Snackbar, ButtonGroup, } from '@mui/joy';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';

import { County, CountyFeature, CountyObject, SortOptions, Visit, sortOptions } from '../resources/utils';
import { auth, db, getCounties } from '../resources/firebase';
import { getStyle, selectedStyle } from '../resources/map-style';

import { isEqual, isEmpty } from 'lodash'

// @ts-ignore
import mapboxgl from "mapbox-gl";
import { DetailPanel } from './components/DetailPanel';
import { InteractiveMap } from './components/InteractiveMap';
import { Close, Delete } from '@mui/icons-material';
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
  drawerOpen: boolean
  snackbarOpen: boolean
  countyCount: number | null,
  stateCount: number | null,
  click: string

  toggleCountyNames: boolean,
  toggleHover: boolean,
  geoControlRef?: RefObject<mapboxgl.GeolocateControl>
  toggleTravelMode: boolean,
  currCounty?: CountyFeature

  toggleSelect: boolean
  selected: number[]
  lastModified?: CountyFeature

  hoverInfo: HoverInfo | null
}

interface HoverInfo {
  latitude: number
  longitude: number,
  county?: CountyFeature
}

class Dashboard extends Component<DashboardProps, DashboardState> {
  private accessToken = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;

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
      drawerOpen: false,
      snackbarOpen: false,
      countyCount: null,
      stateCount: null,
      toggleSelect: false,
      toggleHover: false,
      toggleTravelMode: false,
      selected: [],
      geoControlRef: React.createRef(),
      mapRef: React.createRef(),

      hoverInfo: null,
      click: 'nothing',
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

  addVisit = (feature: CountyFeature) => {
    const id = feature.id
    let c: County | undefined = this.state.counties[id]

    const newVisit: Visit = {
      trip: null,
      nature: 'visited',
      timestamp: new Date()
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
    console.log('single click', feature);


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

    if (this.state.toggleSelect && e.originalEvent?.shiftKey && e.originalEvent.buttons && county) {
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


  private logout = () => {
    signOut(auth)
      .then(() => {
        this.props.navigate('/');
      })
      .catch(console.error);
  };

  toggleDrawer = (drawerOpen: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
    if (
      event.type === 'keydown' &&
      ((event as React.KeyboardEvent).key === 'Tab' ||
        (event as React.KeyboardEvent).key === 'Shift')
    ) {
      return;
    }

    this.setState({ drawerOpen })
  };

  toggleTravelMode = () => {
    this.setState({toggleTravelMode: !this.state.toggleTravelMode})
  }

  render() {
    return (
      <Box>

        {/* LEFT DRAWER */}
        <Drawer size='sm' open={this.state.drawerOpen} onClose={this.toggleDrawer(false)} hideBackdrop={true}>
          <Box
            role="presentation"
            onClick={this.toggleDrawer(false)}
            // onKeyDown={this.toggleDrawer(false)}
            p={1}
          >
            <ModalClose size='lg' />
            <DialogTitle >
              <Avatar onClick={() => this.props.navigate('/')} size='lg' variant='plain' src="/logo700.png" sx={{ borderRadius: 0 }} />
            </DialogTitle>
            <List>
              {['Trips', 'List of Counties', 'Send email', 'Drafts'].map((text) => (
                <ListItem key={text}>
                  <ListItemButton>{text}</ListItemButton>
                </ListItem>
              ))}
            </List>
            {/* <Divider />
            <List>
              {['All mail', 'Trash', 'Spam'].map((text) => (
                <ListItem key={text}>
                  <ListItemButton>{text}</ListItemButton>
                </ListItem>
              ))}
            </List> */}
          </Box>
        </Drawer>

        {/* TOP MENU */}
        <Stack bgcolor={'white'} className='shadow-lg' p={1} direction='row' spacing={1}>
          <Avatar
            onClick={() => this.props.navigate('/')}
            // size='lg'
            variant='plain'
            src="/logo700.png"
            sx={{ borderRadius: 0 }}
          />
          {/* <IconButton size="sm" onClick={this.toggleDrawer(true)}>
              <MenuRoundedIcon></MenuRoundedIcon>
            </IconButton> */}

          {/* TODO: PUT THESE TWO ELEMENTS IN A "OPTIONS" PopOver. Hide/Show Names as a Toggle and Sort as Radio Buttons? */}
          {!this.state.toggleSelect && <>
            <Select
              defaultValue={this.state.sort}
              placeholder="Sort by"
              onChange={(e, newValue) => {
                if (newValue) this.setState({ sort: newValue })
              }}
            >
              {Object.keys(sortOptions).map((option, index) => (
                <Option sx={{ mx: 1, borderRadius: 5 }} key={index} value={option}>{sortOptions[option as SortOptions]}</Option>
              ))}
            </Select>

            <Button variant='soft' onClick={() => { this.setState({ toggleCountyNames: !this.state.toggleCountyNames }) }}>
              {this.state.toggleCountyNames ? "Hide Names" : "Show Names"}
            </Button>

            <Button variant='soft' onClick={() => { this.setState({ toggleHover: !this.state.toggleHover }) }}>
              {this.state.toggleHover ? "Hide Info" : "Show Info"}
            </Button>

            <Button variant='soft' onClick={() => this.toggleTravelMode()}>
            {this.state.toggleTravelMode ? "End Travel Mode" : "Travel Mode"}
            </Button>
          </>}


          {this.state.toggleSelect ?
            <ButtonGroup variant='plain' spacing={2} color='primary'>
              <IconButton onClick={() => this.setState({ toggleSelect: false })}>
                <Close />
              </IconButton>
              <Typography level='body-sm' fontWeight="lg" color='primary' my='auto'>
                {this.state.selected.length} Selected
              </Typography>
              <Button>Edit Trip</Button>
              <Button>Add Trip</Button>
              {/* <Button>{this.state.selected.length > 1 ? "" }</Button> */}
              <IconButton>
                <Delete />
              </IconButton>
            </ButtonGroup>
            : <Button variant='soft' onClick={() => { this.setState({ toggleSelect: true }) }}>Select</Button>
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
              <MenuItem onClick={this.logout}>
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
          <Typography level='body-sm'>Curr County: {this.state.currCounty?.properties.name}</Typography>

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
            if (this.state.toggleSelect && e.originalEvent?.shiftKey) e.target.dragPan.disable()
          }}
          onDragEnd={(e) => e.target.dragPan.enable()}
          onMouseMove={this.onMouseMove}
          boxZoom={!this.state.toggleSelect}

          onLoad={(e) => {
            this.state.geoControlRef?.current?.trigger()
          }}
          setClick={this.setClickState}
        >
          <Layer {...selectedStyle(this.state.selected)} />
          <Layer beforeId="aeroway-polygon" {...this.state.highlightedStyle} />
          <Layer type="symbol" id='county-labels' layout={{ visibility: (this.state.toggleCountyNames ? "visible" : "none") }} />
          <GeolocateControl
            ref={this.state.geoControlRef}
            // ref={}
            onGeolocate={(e) => {
              if (this.state.toggleTravelMode) {
                console.log(e.coords);
                const point: [number, number] = [e.coords.longitude, e.coords.latitude]
                const features = this.state.mapRef?.current?.queryRenderedFeatures(point, {layers: ['base-counties-ids']})
                
                if (features?.length) {
                  this.setState({currCounty: features[0] as CountyFeature})
                }
              }
              
              // this.state.mapRef?.current?.flyTo({ zoom: this.state.view.zoom })

            }}
            fitBoundsOptions={{ maxZoom: 12 }}
            position='top-right'
            positionOptions={{
              enableHighAccuracy: false,
              maximumAge: Infinity
            }}
            trackUserLocation
          />
          {this.state.hoverInfo?.county && this.state.view.zoom > 3 && this.state.toggleHover &&
            <Popup
              latitude={this.state.hoverInfo.latitude}
              longitude={this.state.hoverInfo.longitude}
              offset={[0, -10] as [number, number]}
              closeButton={false}
              closeOnClick={false}
            >
              {this.state.hoverInfo.county.properties.name}
            </Popup>}
        </InteractiveMap>

      </Box>
    );
  }
}

export default DashboardWrapper