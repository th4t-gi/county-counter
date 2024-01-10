import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import React, { FC, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useNavigate } from 'react-router-dom';
import { auth, db, initializeUserFirestore, signUpWithEmailAndPassword } from '../../resources/firebase';

import Box from '@mui/joy/Box'
import Button from '@mui/joy/Button'
import Checkbox from '@mui/joy/Checkbox'
import Input from '@mui/joy/Input'
import Stack from '@mui/joy/Stack'
import Typography from '@mui/joy/Typography'
import Link from '@mui/joy/Link'
import IconButton from '@mui/joy/IconButton'
import Card from '@mui/joy/Card'
import StaticMap from '../utils/StaticMap';

import usCityData from '../../resources/uscities.json'
import { USCity } from '../../resources/utils';
import Autocomplete from '@mui/joy/Autocomplete';
import { useTheme } from '@mui/joy';
import { useMediaQuery } from '@mui/material'
import { useForm } from "react-hook-form";
import { FirebaseError } from 'firebase/app';
import { browserLocalPersistence, browserSessionPersistence, setPersistence } from '@firebase/auth';
import FormField from './FormField';

//TODO: send verification email

type FormFields = 'username' | 'email' | 'hometown' | 'password' | 'confirm_password';

type FormState = {
  [key in FormFields]: string
}
interface RegisterProps { }

const Register: FC<RegisterProps> = () => {
  const { handleSubmit, register, formState: { errors }, setValue, trigger } = useForm<FormState>();

  const navigate = useNavigate()
  const theme = useTheme()
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));

  const [hometownOpen, setHometownOpen] = useState(false)
  const [remember, setRemember] = useState(false)

  const usCities = usCityData as USCity[]

  const onSubmit = ({ username, email, password, hometown }: FormState) => {
    const persistence = remember ? browserLocalPersistence : browserSessionPersistence
    
    setPersistence(auth, persistence).then(() => {
      signUpWithEmailAndPassword(email, password).then(uid => {
        if (uid) {
          const user = {
            username, uid, email, hometown
          }
          initializeUserFirestore(db, user)
        }
      }).catch((e: FirebaseError) => {
        console.log(e.code);
      })
      navigate("/dashboard")
    })
  }

  return (
    <Box minHeight='100vh' px={4} py={6}>
      {!isSmall && <IconButton onClick={() => navigate(-1)}>
        <ArrowBackRoundedIcon />
      </IconButton>}

      <Card sx={{ maxWidth: 500, mx: "auto" }} >
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
              Create your account
            </Typography>

            <FormField error={errors.username} label="Username">
              <Input
                color='neutral'
                type='text'
                {...register("username", {
                  required: "Please enter a username",
                  minLength: {
                    value: 4,
                    message: "Your username must be atleast 4 characters"
                  }
                })}
              />
            </FormField>

            <FormField error={errors.email} label="Email Address">
              <Input
                color='neutral'
                type='email'
                placeholder="someone@example.com"
                {...register("email", {
                  required: "Please enter a valid email address",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Please enter a valid email address"
                  }
                })}
              />
            </FormField>

            <FormField error={errors.hometown} label="Hometown">
              <Autocomplete
                color='neutral'
                options={usCities.sort((a, b) => (a.state_id < b.state_id) ? -1 : 1)}
                groupBy={(option) => option.state_name}
                onInputChange={(e, value, reason) => setHometownOpen(value.length > 2 && reason == 'input')}
                autoHighlight
                blurOnSelect
                placeholder='Nowhere, USA'
                getOptionLabel={option => option.city + ", " + option.state_id}
                noOptionsText="Hmm... I don't know of this place"
                getOptionKey={option => option.id}

                open={hometownOpen}
                onClose={() => setHometownOpen(false) }

                {...register("hometown", {
                  required: "Please select a hometown",
                  onBlur: (e) => trigger('hometown')
                })}

                onChange={(e, option) => {if (option) setValue('hometown', option.city)}}
              />
            </FormField>

            <FormField error={errors.password} label="Password">
              <Input
                color='neutral'
                type='password'
                {...register("password", {
                  required: "Please create a password",
                  minLength: {
                    value: 6,
                    message: "Your password must be atleast 6 characters"
                  }
                })}
              />
            </FormField>

            <FormField error={errors.confirm_password} label="Confirm Password">
              <Input
                color='neutral'
                type='password'

                {...register("confirm_password", {
                  required: "Please confirm your password",
                  validate: (value: string, formValues) =>
                    value === formValues.password || "Passwords must match"
                })}
              />
            </FormField>

            <Checkbox
              name='remember'
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              size="sm"
              label="Remember me"
            />

            <Button type='submit'>Sign up</Button>

            <Typography level="title-sm" textAlign={'center'}>
              Already have an account? {" "}
              <Link href="/login" >
                Login here
              </Link>
            </Typography>
          </Stack>
        </form>
      </Card>

      <StaticMap coords={{ lat: 39, long: -108, zoom: 5 }} className='fixed left-0 top-0 -z-10 h-full w-full object-cover opacity-40' />

    </Box>
  )
}

export default Register;

