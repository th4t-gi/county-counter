import { FunctionComponent } from 'react';
import StaticMap from "../components/StaticMap";

import NavBar from '../components/NavBar';
import { useNavigate } from 'react-router-dom';
import Button from '@mui/joy/Button';
import Typography from '@mui/joy/Typography';
import Footer from '../components/Footer';
import Box from '@mui/joy/Box';
import Stack from '@mui/joy/Stack';
import Card from '@mui/joy/Card';
import { ArrowForward } from '@mui/icons-material';

interface HomeProps {

}

const Home: FunctionComponent<HomeProps> = (props) => {
  // const { location } = useContext(GlobalContext)
  // console.log("Location:", location);

  // const lat = Math.random() * 20 + 27//46.997998 to 27.67210851272917 
  // const long = -1 * (Math.random() * 60 + 67)//-67.088646 to -123.98295649529739
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


      <Box height={'85vh'}>
        <Stack width={'100%'} height={'85vh'} justifyContent={'center'} py={0} px={{ xs: 4, sm: 10 }} sx={{ position: 'absolute', zIndex: 1 }}>
          <Card sx={{ maxWidth: 710, maxHeight: '100%', p: { xs: 4, sm: 8 } }}>
            <Stack spacing={2}>

              <Typography level='h1' mb={3}>
                Why do you think they call them <Typography color='primary'>count</Typography>ies?
              </Typography>

              <Typography level='body-lg' textOverflow={'ellipsis'}>
                County Counting, otherwise known as county collecting, is a hobby to track and try to visit all 3,243 counties in the United States and its territories.
              </Typography>
              {/* <Typography level='body-lg'>
                Aliquam vel platea curabitur sit vestibulum egestas sit id lorem. Aliquet neque, dui sed eget scelerisque. Non at at venenatis tortor amet feugiat ullamcorper in. Odio vulputate cras vel lacinia turpis volutpat adipiscing. Sollicitudin at velit, blandit tempus nunc in.
              </Typography> */}

              <Stack direction={'row'} spacing={3} mt={2}>
                <Button onClick={() => navigate("/register")}>Sign up</Button>
                <Button variant='outlined' onClick={() => navigate("/about")} endDecorator={<ArrowForward />}>How it works</Button>
              </Stack>

            </Stack>
          </Card>
        </Stack>


        <StaticMap random mask style={{ zIndex: 0, height: "85vh" }} />

      </Box>


      <Footer />
    </div>
  );
}

export default Home;