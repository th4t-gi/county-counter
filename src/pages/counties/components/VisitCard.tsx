import React, { FC, useState } from 'react'

import Card from '@mui/joy/Card'
import Stack from '@mui/joy/Stack'
import Typography from '@mui/joy/Typography'
import Select from '@mui/joy/Select'
import Option from '@mui/joy/Option'
import IconButton from '@mui/joy/IconButton'

import DeleteForeverRoundedIcon from '@mui/icons-material/DeleteForeverRounded';

import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs from 'dayjs'
import { isMobile } from 'react-device-detect';

import { County, NatureOptions } from '../../../types'
import { deleteVisit, natureOptions, updateVisit } from '../counties'


interface VisitCardProps {
  index: number
  length: number
  county: County
  // editVisit: (index: number, visit: Partial<Visit>) => void
  // removeVisit: (index: number) => void
  trips: string[]
}

export const VisitCard: FC<VisitCardProps> = (props) => {
  const [showDelete, setShowDelete] = useState(false)
  const { index, length, county,
    // editVisit, removeVisit,
    trips } = props

  // const dispatch = useAppDispatch()

  const visit = county.visits[index]


  function nth(n: number): string {
    return n + (["st", "nd", "rd"][((n + 90) % 100 - 10) % 10 - 1] || "th")
  }

  return (
    <Card
      key={index}
      variant='soft'
      onMouseOver={() => setShowDelete(true)}
      onMouseOut={() => setShowDelete(false)}
    >
      <Stack
        // mx={2}
        direction='row'
        gap={1}
        height={24}
        alignItems={'center'}
        justifyContent={'space-between'}
      >
        <Typography level='title-md'>
          {/* Visit */}
          {index === length - 1 ? 'Latest Visit' : nth(index + 1) + ' Visit'}
        </Typography>

        {(showDelete || isMobile) && <IconButton color='danger' onClick={() => deleteVisit(county, index)}>
          <DeleteForeverRoundedIcon fontSize='small' />
        </IconButton>}
      </Stack>


      <Stack
        direction='row'
        gap={1}
        flexWrap={'wrap'}
        width={'100%'}
      >
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            value={dayjs(visit.timestamp)}
            onAccept={(v) => {
              updateVisit(
                county,
                index,
                {
                  ...visit,
                  timestamp: dayjs(v).toJSON()
                }
              )
            }}
            // onChange={(v) => console.log('hi')}
            closeOnSelect
            sx={{ flex: '1 1 auto' }}
            label="Date"
            views={['year', 'month', 'day']}
            openTo="year"
            maxDate={dayjs()}
          />
        </LocalizationProvider>

        <Select
          variant='outlined'
          placeholder='Trip'
          sx={{ flex: '1 1 40%' }}
          value={visit.trip}
          onChange={(e, trip) =>
            updateVisit(
              county,
              index,
              {
                ...visit,
                trip
              }
            )
          }
        >
          {trips.length ?
            trips.map((v, i) =>
              <Option value={v} key={i}>{v}</Option>
            )
            :
            <Typography p={1} maxWidth='120px' level='body-xs'>Oh no! Looks like you don't have any trips yet</Typography>
          }
          {/* <Option value=''>None</Option> */}
          {/* <Option value='1'>Trip 1 asdfasdf</Option>
          <Option value='2'>Trip 2</Option> */}
        </Select>

        <Select
          variant='outlined'
          sx={{ flex: '1 1 40%' }}
          placeholder='Nature of visit'
          value={visit.nature}
          onChange={(e, nature) => {
            if (nature) {
              updateVisit(
                county,
                index,
                {
                  ...visit,
                  nature
                }
              )
            }
          }}
        >
          {Object.keys(natureOptions).map((v, i) =>
            <Option key={i} value={v}>{natureOptions[v as NatureOptions]}</Option>
          )}
        </Select>
      </Stack>
    </Card>
  )
}
