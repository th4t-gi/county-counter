import Button from '@mui/joy/Button';
import Stack from '@mui/joy/Stack';
import Typography from '@mui/joy/Typography';
import { useNavigate } from 'react-router-dom';

const NavBar = () => {

   const navigate = useNavigate()

   return (
      <Stack direction={'row'} px={{xs: 2, sm: 4}} py={2} justifyContent={'space-between'}>
         <Stack sx={{ cursor: 'pointer' }} direction={'row'} gap={2} alignItems={'center'} onClick={() => navigate("/")}>
            <img width={50} height={'50'} src='/logo700.png' alt='County Counter logo'/>
            <Typography maxWidth={{xs: 100, sm: 200}} level='h3'>County Counter</Typography>
         </Stack>
         <Stack direction={'row'} gap={{xs: 1, sm: 2}} alignItems={'center'}>
            <Button variant='plain' onClick={() => navigate("/login")}>Log in</Button>
            <Button onClick={() => navigate("/register")}>Sign up</Button>
         </Stack>
      </Stack>
   );
};

export default NavBar;