import * as React from 'react';
import { Routes, Route } from 'react-router-dom';

import 'mapbox-gl/dist/mapbox-gl.css';
import '@fontsource/roboto';


import Home from './pages/Home';
import About from './pages/About';
import Login from './pages/auth/Login';
import Page404 from './pages/Page404';
import DashboardWrapper from './pages/Dashboard';
import Register from './pages/auth/Register';
import ProtectedRouteLayout from './pages/auth/ProtectedRouteLayout';
import Contact from './pages/Contact';
import Test from './pages/Test';

function App() {
  //TODO: https://mui.com/joy-ui/customization/using-css-variables/ and <CssVarsProvider />
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/home" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/test" element={<Test />} />

      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/404" element={<Page404 />} />
      <Route path="*" element={<Page404 />} />

      <Route element={<ProtectedRouteLayout />}>
        <Route path="/dashboard" element={<DashboardWrapper />} />

      </Route>
    </Routes>

  );
}

export default App;
