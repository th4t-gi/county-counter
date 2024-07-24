import React, { FC, RefObject } from 'react'
import { Close, Delete } from '@mui/icons-material'
import { ButtonGroup, IconButton, Typography, Button } from '@mui/joy'

import CardTravelIcon from '@mui/icons-material/CardTravel';
import EditNoteIcon from '@mui/icons-material/EditNote';
import AddIcon from '@mui/icons-material/Add';
import { County, CountyFeature } from '../../../types';
import { MapRef } from 'react-map-gl';
import { addVisit, deleteCounty } from '../counties';
import { auth } from '../../../firebase';

interface SelectBarProps {
  selected: number[]
  setSelectMode: (value: boolean) => void
  counties: County[]
  mapRef: RefObject<MapRef>,
}

const SelectBar: FC<SelectBarProps> = (props) => {

  const { selected, counties, setSelectMode, mapRef } = props

  const exists = !!selected.length && selected.every(id => counties.find(c => c.id === id))
  const small = window.innerWidth < 800

  const addVisits = () => {
    selected.forEach(id => {
      const features = mapRef?.current?.querySourceFeatures("composite", {
        sourceLayer: 'base-counties-ids',
        filter: ["==", ['id'], id]
      })
      if (features?.length) {
        addVisit(auth.currentUser!.uid, features[0] as CountyFeature, exists)
      }
    })

    setSelectMode(false)
  }

  const deleteVisits = (ids: number[]) => {

    ids.forEach(id => {
      const features = mapRef?.current?.querySourceFeatures("composite", {
        sourceLayer: 'base-counties-ids',
        filter: ["==", ['id'], id]
      })

      if (features?.length) {
        const { id } = features[0] as CountyFeature
        deleteCounty(id)
      }
    })
    setSelectMode(false)
  }

  return (
    <ButtonGroup variant='plain' spacing={1} color='primary'>
      <IconButton onClick={() => setSelectMode(false)}>
        <Close />
      </IconButton>
      <Typography level={small ? 'body-xs' : 'body-sm'} fontWeight="lg" color='primary' my='auto'>
        {selected.length} Selected
      </Typography>

      {small ?
        <IconButton disabled={!selected.length} onClick={() => addVisits()}>
          <AddIcon />
        </IconButton>
        :
        <Button
          size='sm'
          startDecorator={<AddIcon />}
          disabled={!selected.length}
          onClick={() => addVisits()}
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
        <IconButton disabled={!exists} onClick={() => deleteVisits(selected)}>
          <Delete />
        </IconButton> :
        <Button
          size='sm'
          startDecorator={<Delete />}
          disabled={!exists}
          onClick={() => deleteVisits(selected)}
        >
          Delete
        </Button>
      }


    </ButtonGroup>
  )
}

export default SelectBar