import React, { Component } from 'react';
import { NavigateFunction, useNavigate } from 'react-router-dom';
import { Layer, MapRef } from 'react-map-gl';
import { useAuthState } from 'react-firebase-hooks/auth';
import { signOut, User } from 'firebase/auth';
import { deleteDoc, doc, setDoc, } from 'firebase/firestore';
import { FillLayer } from 'mapbox-gl';

import { Button, Select, Stack, Option, Box, IconButton, Drawer, Divider, List, ListItem, ListItemButton, Avatar, Dropdown, Menu, MenuItem, MenuButton, ModalClose, DialogTitle, Typography, Snackbar, } from '@mui/joy';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';

import { County, CountyFeature, CountyObject, SortOptions, Visit } from '../resources/utils';
import { auth, db, getCounties } from '../resources/firebase';
import { getStyle } from '../resources/map-style';

import { isEqual, isEmpty } from 'lodash'

// @ts-ignore
import mapboxgl from "mapbox-gl";
import { DetailPanel } from './components/DetailPanel';
import { InteractiveMap } from './components/InteractiveMap';
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
  focused: CountyFeature | null,
  sort: SortOptions
  countyNames: boolean,
  mapRef: MapRef | null,
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

  lastModified: CountyFeature | null
}

class Dashboard extends Component<DashboardProps, DashboardState> {
  private accessToken = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;

  private sortOptions = ['visited', 'count', 'year']

  constructor(props: DashboardProps) {
    super(props)

    const sort = 'visited'

    this.state = {
      focused: null,
      sort,
      countyNames: true,
      mapRef: null,
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
      lastModified: null,

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

    if (prevState.sort !== this.state.sort) {
      this.setState({ highlightedStyle: getStyle(this.state.sort) })
    }

    if (!isEmpty(prevState.counties) && !isEqual(this.state.counties, prevState.counties)) {


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

  setVisits = (id: number, visits: Visit[]) => {
    const c = this.state.counties[id]

    this.setCounty({
      ...c,
      visits
    })
  }

  setFocused = (feature: CountyFeature | null) => {
    // this.setClickState("long click")
    // console.log("long click", feature)

    this.setState({ focused: feature });
  }

  handleSnackbarClose = () => {
    this.setState({ snackbarOpen: false })
  }

  addVisit = (feature: CountyFeature) => {
    const id = feature.id
    let c: County | undefined = this.state.counties[id]

    const newVisit: Visit = {
      trip: null,
      nature: 'Visited',
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

  private onMove = (e: { viewState: { longitude: number; latitude: number; zoom: number } }) => {
    // if (this.longTimer) clearTimeout(this.longTimer)
    // this.longTimer = null
    this.setState({ view: e.viewState });
  };

  onSingleClick = (feature: CountyFeature) => {
    // this.setClickState("single click")
    console.log('single click', feature);

    this.addVisit(feature)
    this.setState({ lastModified: feature })

    if (this.state.sort !== 'count' && !!this.getCounty(feature)) {
      this.setState({ snackbarOpen: true })
      // this.setFocused(feature)
    }
  }

  onDoubleClick = (feature: CountyFeature) => {
    // this.setClickState("double click")
    console.log('double click', feature);
    if (!!this.getCounty(feature)) this.setVisits(feature.id, [])
    
    this.setState({ lastModified: feature })
  }

  onLongClick = (feature: CountyFeature) => {
    console.log("long click", feature)

    this.setFocused(feature)
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
              {['Inbox', 'Starred', 'Send email', 'Drafts'].map((text) => (
                <ListItem key={text}>
                  <ListItemButton>{text}</ListItemButton>
                </ListItem>
              ))}
            </List>
            <Divider />
            <List>
              {['All mail', 'Trash', 'Spam'].map((text) => (
                <ListItem key={text}>
                  <ListItemButton>{text}</ListItemButton>
                </ListItem>
              ))}
            </List>
          </Box>
        </Drawer>

        {/* TOP MENU */}
        <Box bgcolor='white' className="shadow-lg">
          <Stack p={1} direction='row' spacing={1}>
            <IconButton size="sm" onClick={this.toggleDrawer(true)}>
              <MenuRoundedIcon></MenuRoundedIcon>
            </IconButton>
            <Select defaultValue={this.state.sort} placeholder="Sort by" onChange={(e, newValue) => this.setState({ sort: newValue as SortOptions })}>
              {this.sortOptions.map((option, index) => (
                <Option sx={{ mx: 1, borderRadius: 5 }} key={index} value={option}>{option}</Option>
              ))}
            </Select>

            <Button variant='soft' onClick={() => { this.setState({ countyNames: !this.state.countyNames }) }}>
              {this.state.countyNames ? "Hide Names" : "Show Names"}
            </Button>

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
              <Menu placement='bottom-start' sx={{ p: 1, zIndex: 10}}>
                <MenuItem >
                  Profile
                </MenuItem>
                <MenuItem>
                  My Stats
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
        </Box>

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
            onClose={() => this.setFocused(null)}
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
              onClick={() => {this.removeVisit(this.state.lastModified?.id)(0); this.handleSnackbarClose()}}
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
          accessToken={this.accessToken}
          counties={this.state.counties}
          focused={this.state.focused}
          style={{ width: '100%', height: '100%', zIndex: -1, position: 'absolute', top: 0 }}
          onMove={this.onMove}
          view={this.state.view}

          onSingleClick={this.onSingleClick}
          onDoubleClick={this.onDoubleClick}
          onLongClick={this.onLongClick}

          setClick={this.setClickState}
        >
          <Layer beforeId="aeroway-polygon" {...this.state.highlightedStyle} />
          <Layer type="symbol" id='county-labels' layout={{ visibility: (this.state.countyNames ? "visible" : "none") }} />
        </InteractiveMap>

      </Box>
    );
  }
}

export default DashboardWrapper