import { FC, ReactElement } from 'react'

import FormControl from '@mui/joy/FormControl'
import FormHelperText from '@mui/joy/FormHelperText'
import FormLabel from '@mui/joy/FormLabel'

import { InfoOutlined } from '@mui/icons-material'
import { InputProps } from '@mui/joy/Input'

interface FormFieldProps {
  children: ReactElement<InputProps>
  error?: {
    message?: string
  }
  label: string
}

const FormField: FC<FormFieldProps> = (props) => {
  const {children, label, error} = props

  return (
    <FormControl error={!!error}>
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