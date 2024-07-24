import { FC, useEffect, useState } from 'react';
import { useForm } from "react-hook-form";
import { useNavigate } from 'react-router-dom';

import { FirebaseError } from 'firebase/app';

import { useMediaQuery } from '@mui/material'
import { useTheme } from '@mui/joy';
import Box from '@mui/joy/Box'
import Button from '@mui/joy/Button'
import Checkbox from '@mui/joy/Checkbox'
import Input from '@mui/joy/Input'
import Stack from '@mui/joy/Stack'
import Typography from '@mui/joy/Typography'
import Link from '@mui/joy/Link'
import IconButton from '@mui/joy/IconButton'
import Card from '@mui/joy/Card'
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';

import StaticMap from '../../components/StaticMap';
import { auth } from '../../firebase';
import FormField from './components/FormField';
import { loginUser } from './auth';

type FormState = {
  email: string
  password: string
}

interface LoginProps { }

const Login: FC<LoginProps> = () => {
  const { handleSubmit, register, formState: { errors }, setError } = useForm<FormState>();
  const navigate = useNavigate()
  // const { error, profile } = useAppSelector(state => state.auth)
  // const dispatch = useAppDispatch()

  const theme = useTheme()
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));

  const [remember, setRemember] = useState(false)

  useEffect(() => {
    if (auth.currentUser) {
      navigate("/counties")
    }
  }, [auth.currentUser, navigate])

  const onSubmit = ({ email, password }: FormState) => {

    loginUser({ email, password }, remember).catch((e: FirebaseError) => {
      console.log(e.code);

      if (e.code === 'auth/invalid-credential' || e.code === 'auth/user-not-found' || e.code === 'auth/wrong-password') {
        setError("email", { message: "" })
        setError("password", { message: "Incorrect email or password" })
      } else if (e.code === 'auth/invalid-email') {
        setError('email', { message: "Please enter a valid email" })
      }
    })
  }

  return (
    <Box minHeight='100vh' px={4} py={6}>
      {!isSmall && <IconButton onClick={() => navigate(-1)}>
        <ArrowBackRoundedIcon />
      </IconButton>}

      <Card sx={{ maxWidth: 500, mx: "auto", mt: { xs: 4, sm: 8 } }} >
        {isSmall && <Stack direction='row'>
          <IconButton onClick={() => navigate(-1)}>
            <ArrowBackRoundedIcon />
          </IconButton>
        </Stack>}

        <form noValidate onSubmit={handleSubmit(onSubmit)}>
          <Stack p={3} spacing={2} alignItems={'stretch'} useFlexGap>
            <img
              className="mx-auto h-10 w-auto"
              src="/logo175.png"
              alt="County Counter"
              onClick={() => navigate('/')}
            />

            <Typography level='h2' textAlign={'center'} mb={3}>
              Sign in to your account
            </Typography>

            <FormField error={errors.email} label="Email Address">
              <Input
                color='neutral'
                type='email'
                placeholder="someone@example.com"
                {...register("email", {
                  required: "Please enter an email address",
                })}
              />
            </FormField>

            <FormField error={errors.password} label="Password">
              <Input
                color='neutral'
                type='password'
                {...register('password', {
                  required: "Please enter a password"
                })}
              />
            </FormField>

            <Stack
              direction={'row'}
              justifyContent={'space-between'}
              alignItems={'center'}
              flexWrap={'wrap'}
              gap={1}
            >
              <Checkbox
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                size="sm"
                label="Remember me"
                name="persistent"
                sx={{ flexShrink: 0 }}
              />
              <Link level="title-sm" href="#replace-with-a-link" sx={{ flexShrink: 0 }}>
                Forgot your password?
              </Link>
            </Stack>

            <Button type='submit'>Sign in</Button>

            <Typography level="title-sm" textAlign={'center'}>
              Don't have one? {" "}
              <Link href="/register" >
                Create an account
              </Link>
            </Typography>
          </Stack>
        </form>
      </Card>

      <StaticMap defaultCoords={{ lat: 39, long: -108 }} className='fixed left-0 top-0 -z-10 h-full w-full object-cover opacity-40' />

    </Box>
  )
}

export default Login;