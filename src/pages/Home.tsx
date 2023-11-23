import { FunctionComponent, useContext, useEffect } from 'react';
import StaticMap from "./utils/StaticMap";

import NavBar from './NavBar';

interface HomeProps {
  
}
 
const Home: FunctionComponent<HomeProps> = (props) => {
  // const { location } = useContext(GlobalContext)
  // console.log("Location:", location);
  
  const lat = Math.random()*20 + 27//46.997998 to 27.67210851272917 
  const long = -1*(Math.random()*60 + 67)//-67.088646 to -123.98295649529739
  // console.log(lat,long);
  
  // navigator.geolocation.getCurrentPosition((position) => {
  //   console.log("Latitude is :", position.coords.latitude);
  //   console.log("Longitude is :", position.coords.longitude);
  // });
  

  
  return (
    <div>
      <NavBar />
      <div>HI</div>
      {/* <StaticMap coord={{lat, long, zoom:6}}/> */}
    </div>
  );
}
 
export default Home;