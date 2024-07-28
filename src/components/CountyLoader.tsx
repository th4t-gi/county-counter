import { Box } from '@mui/joy'
import React from 'react'
import { TailSpin } from 'react-loader-spinner'

const CountyLoader = () => {


  return (
    <Box
      width='100%'
      height='100%'
      alignItems="center"
      justifyContent={'center'}
      display="flex"
    >
      <TailSpin
        height="160"
        width="160"
        color="#a9c0ea"
        ariaLabel="tail-spin-loading"
        radius="6"
        />
      <Box
        component="img"
        src="/logo700.png"
        alt="County Counter Logo"
        position="absolute"
        width="75px"
        height="75px"
      />
    </Box>
  )
}

export default CountyLoader 