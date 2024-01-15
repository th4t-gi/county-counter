import { FunctionComponent, useContext, useEffect } from 'react';
import StaticMap from "./utils/StaticMap";

import NavBar from './NavBar';
import { Link, useNavigate } from 'react-router-dom';
import Button from '@mui/joy/Button';
import { InteractiveMap } from './components/InteractiveMap';
import Typography from '@mui/joy/Typography';
import Footer from './Footer';

interface HomeProps {

}

const Home: FunctionComponent<HomeProps> = (props) => {
  // const { location } = useContext(GlobalContext)
  // console.log("Location:", location);

  const lat = Math.random() * 20 + 27//46.997998 to 27.67210851272917 
  const long = -1 * (Math.random() * 60 + 67)//-67.088646 to -123.98295649529739
  // console.log(lat,long);

  const navigate = useNavigate()



  return (
    <div>
      <NavBar></NavBar>
      {/* <nav className='flex px-8 py-3 justify-between flex-row'>

        <div className='flex flex-auto items-center'>
          County Counter
        </div>

        <div className='flex flex-1/3 gap-x-8 justify-center grow items-center'>
          <Link to="/">Home</Link>
          <Link to="/about">About</Link>
        </div>

        <div className='flex flex-1 justify-end gap-4'>
          <Button variant='plain' onClick={() => navigate("/login")}>
            Login
          </Button>
          <Button variant='outlined' onClick={() => navigate("/register")}>
            Sign up
          </Button>
          <button className=' border border-gray-500 rounded p-2' >
            Login
          </button>
          <button className='border border-gray-500 rounded p-2'>
            <Link to="/register">Sign Up</Link>
          </button>
        </div>
      </nav> */}

      <Typography p={4} level='h1' textAlign={'center'}>
        County Counter
      </Typography>
      <Typography level='title-lg'>
        Gamify your travel and try to get to all 3206 counties!
      </Typography>
      <StaticMap className='' coords={{ lat, long, zoom: 6 }} />

      {/* <InteractiveMap /> */}
      <Footer />
    </div>
  );
}

export default Home;