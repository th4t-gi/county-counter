import { FC, ReactElement } from 'react'

import FormControl from '@mui/joy/FormControl'
import FormHelperText from '@mui/joy/FormHelperText'
import FormLabel from '@mui/joy/FormLabel'

import { InfoOutlined } from '@mui/icons-material'
import { InputProps } from '@mui/joy/Input'
import { SxProps } from '@mui/joy/styles/types'

interface FormFieldProps {
  label: string
  children: ReactElement<InputProps>
  error?: {
    message?: string
  }
  sx?: SxProps
}

const FormField: FC<FormFieldProps> = (props) => {
  const {children, label, error, sx} = props

  return (
    <FormControl sx={sx} error={!!error}>
      <FormLabel >{label}</FormLabel>
      {children}
      {error && <FormHelperText>
        {error.message && <InfoOutlined />}
        {error.message}
      </FormHelperText>}
    </FormControl>
  )
}

export default FormField