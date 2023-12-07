import * as React from 'react';
import { Routes, Route } from 'react-router-dom';

import 'mapbox-gl/dist/mapbox-gl.css';

import Map from 'react-map-gl';
import Home from './pages/Home';
import About from './pages/About';
import NavBar from './pages/NavBar';
import Login from './pages/auth/Login';
import TestNav from './pages/TestNav';
import Page404 from './pages/Page404';
import DashboardWrapper from './pages/Dashboard';
import Register from './pages/auth/Register';
import ProtectedRouteLayout from './pages/auth/ProtectedRouteLayout';

class App extends React.Component {
  accessToken: string;
  location: [number, number];

  constructor(props: {} | Readonly<{}>) {
    super(props)
    this.accessToken = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN || ""
    this.location = [0,0]
  }

  componentDidMount() {

  }
  
  render() {
    return (
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/test" element={<TestNav />} />


        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<Page404 />} />

        <Route element={<ProtectedRouteLayout />}>
          <Route path="/dashboard" element={<DashboardWrapper />} />
          
        </Route>
      </Routes>
    );
  }
  
}

export default App;
