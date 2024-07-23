import React, { FC, useState } from 'react';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import Stack from '@mui/joy/Stack';
import Typography from '@mui/joy/Typography';
import Button from '@mui/joy/Button';
import { Close } from '@mui/icons-material'
import Link from '@mui/joy/Link';
import Card from '@mui/joy/Card';
import FormField from './auth/components/FormField';
import Input from '@mui/joy/Input';

import { useForm } from "react-hook-form";
import Textarea from '@mui/joy/Textarea';
import StaticMap from '../components/StaticMap'
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../firebase';
import { Snackbar } from '@mui/joy';

interface ContactProps { }

type FormFields = 'name' | 'email' | 'message' | 'subject';

type FormState = {
  [key in FormFields]: string
}

const Contact: FC<ContactProps> = () => {

  const { handleSubmit, register, formState: { errors }, reset } = useForm<FormState>();

  const [snackbarOpen, setSnackbarOpen] = useState(false)

  // const mask: CSSProperties = useMemo(
  //   () => {
  //     return {
  //       maskImage: "radial-gradient(69.66% 50% at 49.97% 50%, #000 0%, rgba(0, 0, 0, 0.00) 100%)",
  //       WebkitMaskImage: "radial-gradient(69.66% 50% at 49.97% 50%, #000 0%, rgba(0, 0, 0, 0.00) 100%)",
  //       top: 0,
  //       left: 0,
  //       // bottom: 0,
  //       // right: 0,
  //       width: '100%',
  //       height: '100%',
  //       position: 'absolute',
  //       backgroundImage: 'url(/1000x500@2x.png)',
  //       backgroundPosition: 'center',
  //       backgroundSize: window.innerWidth * 3,
  //       // backgroundSize: 'cover',
  //       backgroundRepeat: 'no-repeat',
  //     }
  //   },
  //   [],
  // )

  const onSubmit = ({ name, email, message, subject }: FormState) => {

    const collectionRef = collection(db, 'mail')

    addDoc(collectionRef, {
      to: `${name} <${email}>`,
      cc: 'juddbrau@gmail.com',
      message: {
        subject: "[County Counter] " + subject,
        text: `Hi ${name},\n\nThank you for reaching out to me! Here is a copy of your message:\n\n${message}`
      }
    }).then(() => {
      reset()
      setSnackbarOpen(true)
    }).catch(console.error)

  }

  return (
    <div>
      <NavBar />
      <form noValidate onSubmit={handleSubmit(onSubmit)} style={{ position: 'relative' }}>
        <Stack width={'100%'} px={4} py={8} mb={1} alignItems={'center'} zIndex={1}>
          <Card sx={{ maxWidth: 550, alignItems: 'center', p: 6 }}>
            <Typography level="h1">
              Contact Me
            </Typography>
            <Typography level="body-sm" textAlign={'center'}>
              Hi, I'm Judd, the maintainer of County Counter. If you have any thoughts or questions, fill out this form or send me an email at <Link href="mailto:juddbrau@gmail.com">juddbrau@gmail.com</Link>
            </Typography>

            <Stack width={'100%'} direction={'column'} gap={2} pt={3}>
              {/* <FormField error={errors.username} label="Username"> */}
              <Stack direction={'row'} gap={2} flexWrap={'wrap'}>
                <FormField label="Name" sx={{ flexGrow: 1 }} error={errors.name}>
                  <Input
                    color='neutral'
                    type='text'
                    {...register("name", {
                      required: "Please enter a name",
                    })}
                  />
                </FormField>
                <FormField label="Email" sx={{ flexGrow: 1 }} error={errors.email}>
                  <Input
                    color='neutral'
                    type='text'
                    {...register("email", {
                      required: "Please enter a valid email address",
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "Please enter a valid email address"
                      }
                    })}
                  />
                </FormField>
              </Stack>

              <FormField label="Subject" sx={{ flexGrow: 1 }} error={errors.subject}>
                  <Input
                    color='neutral'
                    type='text'
                    {...register("subject", {
                      required: "Please enter in a subject"
                    })}
                  />
                </FormField>

              <FormField label="Message" sx={{ flexGrow: 1 }} error={errors.message}>
                <Textarea
                  sx={{ flexGrow: 1 }}
                  minRows={4}
                  maxRows={6}
                  {...register("message", {
                    required: "Please enter a message",
                  })}
                />
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

        <StaticMap random mask live style={{ zIndex: -1, position: 'absolute', top: 0 }} />

      </form>

      <Snackbar
        open={snackbarOpen}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{horizontal: 'center', vertical: 'bottom'}}
        size='lg'
        endDecorator={<Close onClick={() => setSnackbarOpen(false)}/>}
        variant='soft'
        color='success'
        autoHideDuration={3000}
      >
        Your message has been sent!
      </Snackbar>

      <Footer />
    </div>
  );
};

export default Contact;