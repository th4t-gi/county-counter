import React from 'react';
import { Routes, Route, BrowserRouter } from 'react-router-dom';

import 'mapbox-gl/dist/mapbox-gl.css';
import '@fontsource/roboto';


import Home from './pages/Home';
import About from './pages/About';
import Login from './pages/auth/Login';
import Page404 from './pages/Page404';
import Register from './pages/auth/Register';
import ProtectedRouteLayout from './pages/auth/components/ProtectedRouteLayout';
import Contact from './pages/Contact';
import Test from './pages/Test';
import CountiesDashboard from './pages/counties/CountiesDashboard';
import { auth, db } from './firebase';
import { AuthProvider, FirestoreProvider } from 'reactfire';



function App() {
  //TODO: https://mui.com/joy-ui/customization/using-css-variables/ and <CssVarsProvider />
  return (
    <AuthProvider sdk={auth}>
      <FirestoreProvider sdk={db}>
        <BrowserRouter>
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
              {/* <Route path="/dashboard" element={<DashboardWrapper />} /> */}
              <Route path="/counties" element={<CountiesDashboard />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </FirestoreProvider>
    </AuthProvider>
  );
}

export default App;
