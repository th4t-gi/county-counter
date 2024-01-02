import React, { Component, RefObject } from 'react';
import { NavigateFunction, useNavigate } from 'react-router-dom';
import Map, { Layer, MapRef } from 'react-map-gl';
import { MapLayerMouseEvent } from 'react-map-gl';
import { useAuthState } from 'react-firebase-hooks/auth';
import { signOut, User } from 'firebase/auth';
import { collection, deleteDoc, doc, setDoc, } from 'firebase/firestore';
import { bbox } from '@turf/turf';
import { FillLayer, MapboxEvent } from 'mapbox-gl';

import { Button, Select, Stack, Option, Box, IconButton, Drawer, Divider, List, ListItem, ListItemButton, Avatar, Dropdown, Menu, MenuItem, MenuButton, ModalClose, DialogTitle, Typography, Input, FormControl, FormLabel, Switch} from '@mui/joy';
import CloseRounded from '@mui/icons-material/CloseRounded'
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import AddIcon from '@mui/icons-material/Add';

import SidePanel from './components/SidePanel';
import { County, CountyFeature, CountyObject, getCountyState, countiesAreEqual, removeCounty, isEmpty, SortOptions } from '../resources/utils';
import { auth, db, getCounties } from '../resources/firebase';
import { generateStyle } from '../resources/map-style';

// @ts-ignore
import mapboxgl from "mapbox-gl";
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
  sort: SortOptions
  countyNames: boolean,
  mapRef: RefObject<MapRef>,
  counties: CountyObject,
  view: {
    longitude: number,
    latitude: number,
    zoom: number,
  },
  highlightedStyle: FillLayer,
  drawerOpen: boolean
  countyCount: number | null,
  stateCount: number | null
}

class Dashboard extends Component<DashboardProps, DashboardState> {
  private accessToken = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;

  private feat = (id: number) => ({ source: 'composite', sourceLayer: 'base-counties-ids', id });
  private clickTimer: NodeJS.Timeout | null = null;
  private longTimer: NodeJS.Timeout | null = null;

  private sortOptions = ['visited', 'count']

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
      highlightedStyle: generateStyle('count'),
      drawerOpen: false,
      countyCount: null,
      stateCount: null
    }
  }

  componentDidMount() {
    

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

          if (this.state.mapRef.current?.loaded) {
            this.state.mapRef.current?.setFeatureState(this.feat(c.id), c);
          }

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

      const countyCount = Object.keys(this.state.counties).length
      this.setState({countyCount})

      const states = Object.values(this.state.counties).map(c => c.state)
        .filter((v, i, arr) => arr.indexOf(v) === i)
      this.setState({stateCount: states.length})
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

  toggleDrawer = (drawerOpen: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
    if (
      event.type === 'keydown' &&
      ((event as React.KeyboardEvent).key === 'Tab' ||
        (event as React.KeyboardEvent).key === 'Shift')
    ) {
      return;
    }

    this.setState({drawerOpen})
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
            <ModalClose size='lg'/>
            <DialogTitle >
              <Avatar onClick={() => this.props.navigate('/')} size='lg' variant='plain' src="/logo700.png" sx={{borderRadius: 0}}/>
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
            <Select defaultValue={this.state.sort} placeholder="Sort by" onChange={(e, newValue) => this.setState({ sort: newValue as 'visited' | 'count' })}>
              {this.sortOptions.map((option, index) => (
                <Option sx={{mx: 1, borderRadius: 5}} key={index} value={option}>{option}</Option>
              ))}
            </Select>

            <Button variant='soft' onClick={() => {this.setState({countyNames: !this.state.countyNames})}}>
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
              <Menu placement='bottom-start' sx={{p: 1}}>
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

        <Box p={1} m={1} borderRadius={5} bgcolor={'white'} width={180}  position={'absolute'}>
          <Typography level='body-lg'>Center:</Typography>
          <Typography level='body-sm'>Lat: {this.state.view.latitude.toFixed(3)}</Typography>
          <Typography level='body-sm'>Long: {this.state.view.longitude.toFixed(3)}</Typography>
          <Typography level='body-sm'>Zoom: {this.state.view.zoom.toFixed(3)}</Typography>

          {/* <Typography level='body-lg'>Stats:</Typography>
           */}
          <Divider sx={{my: 1}}></Divider>
          <Typography level='body-sm'>Number of Counties: {this.state.countyCount}</Typography>
          <Typography level='body-sm'>Number of States: {this.state.stateCount}</Typography>
        </Box>

        <Drawer 
          open={this.state.current ? true : false}
          anchor='right'
          hideBackdrop={true}
          onClose={() => this.setState({current: null})}
          slotProps={{
            root: {
              sx: {
                position: "relative"
              }
            },
            content: {
              sx: {
                m: 6,
                mt: `calc(56px + ${6*8}px)`,
                borderRadius: 5,
                height: `calc(100% - ${6*16 + 56}px)`
              },
            }
          }}
        >
          <IconButton
            onClick={() => this.setState({current: null})}
            sx={{ position: 'absolute', top: 12, left: 12 }}
          >
            <CloseRounded />
          </IconButton>
          <DialogTitle sx={{justifyContent: 'center'}}level='h3'>
            
            {this.state.current?.properties.name} {this.state.current?.properties.lsad}
          </DialogTitle>
          {this.state.current && <SidePanel county={this.state.current} setCurrent={this.setCurrent} />}
        </Drawer>

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
          onTouchStart={() => {console.log('test')}}
          // onLoad={(e) => {console.log(e)}}
          interactiveLayerIds={['county-fill']}
        >
          <Layer beforeId="aeroway-polygon" {...this.state.highlightedStyle} />
          <Layer type="symbol" id='county-labels' layout={{visibility: (this.state.countyNames ? "visible" : "none")}}/>
        </Map>


      </Box>
    );
  }
}

export default DashboardWrapper