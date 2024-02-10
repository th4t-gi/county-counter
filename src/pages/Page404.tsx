import React, { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from './NavBar';
import Box from '@mui/joy/Box';
import Footer from './Footer';
import Stack from '@mui/joy/Stack';
import Typography from '@mui/joy/Typography';
import Button from '@mui/joy/Button';
import { ArrowBack } from '@mui/icons-material'


interface Page404Props { }

const Page404: FC<Page404Props> = () => {
  const navigate = useNavigate();
  return (
    <Box>
      <NavBar></NavBar>

      <Stack alignItems={'center'} gap={5} pb={10}>
          <Typography lineHeight='110%' fontSize={{sm: 80}} pt={{xs: 4, sm: 1}} level='h1' fontWeight={'bold'} textAlign={'center'}>404 Not Found</Typography>

          <Box px={5}>
          <img width={500} src="/404-illustration.png" />

          </Box>
          

          <Typography level='title-lg' maxWidth={600} textAlign={'center'} px={3}>
            Uh oh! Looks like you found an unexplored place! Nice Job!
          </Typography>
        <Button variant='soft' startDecorator={<ArrowBack />} onClick={() => navigate(-1)}>Go Back</Button>


      </Stack>
      <Footer></Footer>
    </Box>
  )
};

export default Page404;
