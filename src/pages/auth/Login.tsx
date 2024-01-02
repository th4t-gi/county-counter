import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import { FC, useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useNavigate } from 'react-router-dom';
import { auth, logInWithEmailAndPassword } from '../../resources/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';

import Box from '@mui/joy/Box'
import Button from '@mui/joy/Button'
import Checkbox from '@mui/joy/Checkbox'
import FormControl from '@mui/joy/FormControl'
import FormHelperText from '@mui/joy/FormHelperText'
import FormLabel from '@mui/joy/FormLabel'
import Input from '@mui/joy/Input'
import Stack from '@mui/joy/Stack'
import Typography from '@mui/joy/Typography'
import Link from '@mui/joy/Link'
import IconButton from '@mui/joy/IconButton'
import Card from '@mui/joy/Card'
// import { Checkbox, FormControl, FormHelperText, FormLabel, Input, Stack, Typography, Link, IconButton, Card} from '@mui/joy';
import StaticMap from '../utils/StaticMap';


interface LoginProps {}

const Login: FC<LoginProps> = () => {
  const navigate = useNavigate()
  const [user, loading, error] = useAuthState(auth)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [err, setError] = useState(false)

  useEffect(() => {
    if (loading) {
      // maybe trigger a loading screen
      return;
    }
    if (user) navigate("/dashboard");
  }, [user, loading]);

  let valid = true;
  const submit = async () => {

    //TODO: add validation to form
    if (valid) {
      signInWithEmailAndPassword(auth, email, password).then(v => {
        console.log(v);
        //TODO: Add email verification step
      }).catch(e => {
        //TODO: add error message if email or password is incorrect
        console.error(e.message);
      })
    }
  }

  return (
    <Box px={4} py={6}>
      <IconButton onClick={() => navigate(-1)}>
        <ArrowBackRoundedIcon />
      </IconButton>

      <StaticMap coords={{lat: 39, long: -108, zoom: 5}} className='absolute left-0 top-0 -z-10 h-screen w-screen object-cover opacity-40'/>
      
      <Card sx={{mx: {sm: 'auto'}, maxWidth: {sm: 'sm'}, mt: {sm: 10}, h: 'fit-content' }}>
        {/* <IconButton onClick={() => navigate(-1)}>
          <ArrowLeftIcon />
        </IconButton> */}

        <Stack p={3} spacing={2} alignItems={'stretch'} useFlexGap>
          <img
            className="mx-auto h-10 w-auto"
            src="/logo175.png"
            alt="County Counter"
          />

          <Typography level='h2' textAlign={'center'} mb={3}>
            Sign in to your account
          </Typography>
          <FormControl>
            <FormLabel >Email Address</FormLabel>
            <Input 
              onChange={e => setEmail(e.target.value)} 
              value={email}
              type='email'
              placeholder="someone@example.com" />
          </FormControl>

          <FormControl>
            <FormLabel>Password</FormLabel>
            <Input
              type='password'
              value={password}
              onChange={e => setPassword(e.target.value)}/>
          </FormControl>
          <Box
            display="flex"
            justifyContent={'space-between'}
            alignItems={'center'}
          >
            <Checkbox size="sm" label="Remember me" name="persistent" />
            <Link level="title-sm" href="#replace-with-a-link">
              Forgot your password?
            </Link>
          </Box>

          <Button onClick={submit}>Sign in</Button>

          <Typography level="title-sm" textAlign={'center'}>
            Don't have one? {" "}
            <Link href="/register" >
              Create an account
            </Link>
          </Typography>
        </Stack>
      </Card>
    </Box>
  )
}

export default Login;