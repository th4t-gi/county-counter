import Button from '@mui/joy/Button';
import Stack from '@mui/joy/Stack';
import Typography from '@mui/joy/Typography';
import { Link, useNavigate } from 'react-router-dom';

import TwitterIcon from '@mui/icons-material/Twitter';
import InstagramIcon from '@mui/icons-material/Instagram';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import IconButton from '@mui/joy/IconButton';

const Footer = () => {

  const navigate = useNavigate()

  return (
    <Stack
      sx={{ backgroundColor: '#E8E8E8' }}
      px={10}
      py={3}
      gap={{xs: 3, sm: 6}}
      direction={{sm: 'row'}}
      alignItems={'center'}
      justifyContent={'space-between'}
    >
      <Stack sx={{ cursor: 'pointer' }} direction={'row'} gap={2} alignItems={'center'} onClick={() => navigate("/")}>
        {/* <img width={50} height={'50'} src='/logo700.png' /> */}
        <Typography level='h3'>County Counter</Typography>
      </Stack>
      <Stack direction={'row'} gap={3}>
        <Typography
          sx={{ cursor: 'pointer' }}
          onClick={() => navigate("/legal/terms")}
        >
          Terms
        </Typography>
        <Typography
          sx={{ cursor: 'pointer' }}
          onClick={() => navigate("/legal/privacy")}
        >
          Privacy
        </Typography>
        <Typography
          sx={{ cursor: 'pointer' }}
          onClick={() => navigate("/about")}
        >
          About
        </Typography>
        <Typography
          sx={{ cursor: 'pointer' }}
          onClick={() => navigate("/contact")}
        >
          Contact
        </Typography>

      </Stack>
      <Stack direction={'row'} height={24} gap={2} alignItems={'center'}>
        <TwitterIcon
          sx={{ cursor: 'pointer' }}
          onClick={() => navigate("/404")}
          htmlColor='#475569'
        />
        <InstagramIcon
          sx={{ cursor: 'pointer' }}
          onClick={() => navigate("/404")}
          htmlColor='#475569'
        />
        <LinkedInIcon
          sx={{ cursor: 'pointer' }}
          onClick={() => navigate("/404")}
          htmlColor='#475569'
        />
      </Stack>
      {/* <div className="justify-start items-start gap-4 flex"> */}
        {/* DOWNLOAD IT ON THE APP STORE */}
        {/* GET IT ON THE GOOGLE PLAY STORE */}
      {/* </div> */}
    </Stack>
  );
};

export default Footer;