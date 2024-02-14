import Button from '@mui/joy/Button';
import Stack from '@mui/joy/Stack';
import Typography from '@mui/joy/Typography';
import { Link, useNavigate } from 'react-router-dom';

const NavBar = () => {

   const navigate = useNavigate()

   return (
      <Stack direction={'row'} px={4} py={2} justifyContent={'space-between'}>
         <Stack sx={{ cursor: 'pointer' }} direction={'row'} gap={2} alignItems={'center'} onClick={() => navigate("/")}>
            <img width={50} height={'50'} src='/logo700.png' />
            <Typography level='h3'>County Counter</Typography>
         </Stack>
         <Stack direction={'row'} gap={2} alignItems={'center'}>
            <Button variant='plain' onClick={() => navigate("/login")}>Log in</Button>
            <Button onClick={() => navigate("/register")}>Sign up</Button>
         </Stack>
      </Stack>
   );
};

export default NavBar;