import { Close, Delete } from '@mui/icons-material'
import { ButtonGroup, IconButton, Typography, Button } from '@mui/joy'
import React, { FC } from 'react'

import CardTravelIcon from '@mui/icons-material/CardTravel';
import EditNoteIcon from '@mui/icons-material/EditNote';
import AddIcon from '@mui/icons-material/Add';
import { CountyObject } from '../../resources/utils';

interface SelectBarProps {
  selected: number[]
  setToggleSelect: (value: boolean) => void
  counties: CountyObject
  addVisits: (id: number[]) => void
}

const SelectBar: FC<SelectBarProps> = (props) => {

  const { selected, counties, setToggleSelect, addVisits } = props

  const exists = selected.length && selected.every((id: number) => counties[id])
  const small = window.innerWidth < 800

  return (
    <ButtonGroup variant='plain' spacing={1} color='primary'>
      <IconButton onClick={() => setToggleSelect(false)}>
        <Close />
      </IconButton>
      <Typography level={small ? 'body-xs' : 'body-sm'} fontWeight="lg" color='primary' my='auto'>
        {selected.length} Selected
      </Typography>

      {small ?
        <IconButton disabled={!selected.length} onClick={() => addVisits(selected)}>
          <AddIcon />
        </IconButton>
        :
        <Button
          size='sm'
          startDecorator={<AddIcon />}
          disabled={!selected.length}
          onClick={() => addVisits(selected)}
        >
          Add Visit
        </Button>
      }

      {small ?
        <IconButton disabled={!selected.length}>
          <CardTravelIcon />
        </IconButton> :
        <Button
          size='sm'
          startDecorator={<CardTravelIcon />}
          disabled={!selected.length}
        >
          Add Trip
        </Button>
      }

      {small ?
        <IconButton disabled>
          <EditNoteIcon />
        </IconButton> :
        <Button
          size='sm'
          startDecorator={<EditNoteIcon />}
          disabled
        >
          Edit Trip
        </Button>
      }

      {small ?
        <IconButton disabled={!exists}>
          <Delete />
        </IconButton> :
        <Button
          size='sm'
          startDecorator={<Delete />}
          disabled={!exists}
        >
          Delete
        </Button>
      }


    </ButtonGroup>
  )
}

export default SelectBar