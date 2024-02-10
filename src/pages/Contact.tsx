import React, { CSSProperties, FC, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from './NavBar';
import Box from '@mui/joy/Box';
import Footer from './Footer';
import Stack from '@mui/joy/Stack';
import Typography from '@mui/joy/Typography';
import Button from '@mui/joy/Button';
import { ArrowBack } from '@mui/icons-material'
import Link from '@mui/joy/Link';
import Card from '@mui/joy/Card';
import FormField from './auth/FormField';
import Input from '@mui/joy/Input';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';

import { useForm } from "react-hook-form";
import Textarea from '@mui/joy/Textarea';
import StaticMap from './utils/StaticMap';

interface ContactProps { }

type FormFields = 'name' | 'email' | 'message';

type FormState = {
  [key in FormFields]: string
}

const Contact: FC<ContactProps> = () => {

  const { handleSubmit, register, formState: { errors }, setValue, trigger } = useForm<FormState>();

  const mask: CSSProperties = useMemo(
    () => {
      return{
        maskImage: "radial-gradient(69.66% 50% at 49.97% 50%, #000 0%, rgba(0, 0, 0, 0.00) 100%)",
        WebkitMaskImage: "radial-gradient(69.66% 50% at 49.97% 50%, #000 0%, rgba(0, 0, 0, 0.00) 100%)",
        top: 0,
        left: 0,
        // bottom: 0,
        // right: 0,
        width: '100%',
        height: '100%',
        position: 'absolute',
        backgroundImage: 'url(/1000x500@2x.png)',
        backgroundPosition: 'center',
        backgroundSize: window.innerWidth*3,
        // backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
      }
    },
    [],
  )
  
  // const mask: CSSProperties = 

  const onSubmit = ({ name, email, message }: FormState) => {
    console.log(name + " has a message");

  }

  return (
    <div>
      <NavBar />
      <form noValidate onSubmit={handleSubmit(onSubmit)}>

        <Stack width={'100%'} px={4} py={8} mb={1} alignItems={'center'} position='relative'>
          <Card sx={{ maxWidth: 550, alignItems: 'center', p: 6 }}>
            <Typography level="h1">
              Contact Me
            </Typography>
            <Typography level="body-sm" textAlign={'center'}>
              Hi, I'm Judd, the maintainer of County Counter, if you have any thoughts or questions feel free to fill out this form or send me an email at <Link href="mailto:juddbrau@gmail.com">juddbrau@gmail.com</Link>
            </Typography>

            <Stack width={'100%'} direction={'column'} gap={2} pt={3}>
              {/* <FormField error={errors.username} label="Username"> */}
              <Stack direction={'row'} gap={2} flexWrap={'wrap'}>
                <FormField label="Name" sx={{ flexGrow: 1 }}>
                  <Input
                    color='neutral'
                    type='text'
                  // {...register("username", {
                  //   required: "Please enter a username",
                  //   minLength: {
                  //     value: 4,
                  //     message: "Your username must be atleast 4 characters"
                  //   }
                  // })}
                  />
                </FormField>
                <FormField label="Email" sx={{ flexGrow: 1 }}>
                  <Input
                    color='neutral'
                    type='text'
                  // {...register("username", {
                  //   required: "Please enter a username",
                  //   minLength: {
                  //     value: 4,
                  //     message: "Your username must be atleast 4 characters"
                  //   }
                  // })}
                  />
                </FormField>
              </Stack>

              <FormField label="Message" sx={{ flexGrow: 1 }}>
                <Textarea sx={{ flexGrow: 1 }} minRows={4} maxRows={6} />
              </FormField>

              <Button type='submit'>Submit</Button>

            </Stack>

            {/* <div className="flex items-start gap-[16px] relative self-stretch w-full flex-[0_0_auto]">
              <Button
                className="!flex-1 !flex !grow"
                color="primary"
                size="md"
                text="Name Input"
              />
              <Button
                className="!flex-1 !flex !grow"
                color="primary"
                size="md"
                text="Email Input"
              />
            </div>
            <Button
              className="!self-stretch !h-[199px] !min-h-[unset] !flex !w-full"
              color="primary"
              size="md"
              state="enabled"
              text="Message Input"
            />
            <Button
              className="!self-stretch !flex-[0_0_auto] !flex !w-full"
              color="primary"
              label="Submit"
              size="lg"
              state="enabled"
            /> */}
          </Card>
        </Stack>


      </form>

      <StaticMap random mask live className='absolute left-0 top-0 -z-10 object-cover' />

      <Footer />
    </div>
  );
};

export default Contact;