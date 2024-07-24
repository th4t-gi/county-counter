import { FC, useState } from 'react'

import Stack from '@mui/joy/Stack'
import Button from '@mui/joy/Button'
import Typography from '@mui/joy/Typography'
import Drawer from '@mui/joy/Drawer'
import DialogTitle from '@mui/joy/DialogTitle'
import IconButton from '@mui/joy/IconButton'
import DialogContent from '@mui/joy/DialogContent'

import AddIcon from '@mui/icons-material/Add'
import DeleteForeverRoundedIcon from '@mui/icons-material/DeleteForeverRounded';
import CloseRounded from '@mui/icons-material/CloseRounded'

import { isMobile } from 'react-device-detect';

import { VisitCard } from './VisitCard'
import { addVisit, deleteCounty } from '../counties'
import { doc } from 'firebase/firestore'
import { auth, countyConverter, db } from '../../../firebase'
import { useFirestoreDocData } from 'reactfire'
import { CountyFeature } from '../../../types'

interface DetailPanelProps {
  focused: CountyFeature
  onClose: () => void
}

export const DetailPanel: FC<DetailPanelProps> = (props) => {

  const {
    focused,
    onClose
  } = props

  const countyRef = doc(db, 'users', auth.currentUser!.uid, 'counties', focused.id.toString()).withConverter(countyConverter)
  const { data: county } = useFirestoreDocData(countyRef);

  const [titleHovered, setTitleHovered] = useState(false)

  return (
    <Drawer
      disableEnforceFocus
      open={!!focused}
      anchor={isMobile ? 'bottom' : 'right'}
      hideBackdrop={true}
      onClose={onClose}
      slotProps={{
        root: {
          sx: {
            position: "relative",
            zIndex: 5
          }
        },
        content: {
          sx: {
            borderRadius: 5,
            m: { xs: 0, sm: 3 },
            mt: { xs: 0, sm: `calc(56px + ${3 * 8}px)` },
            height: { sm: `calc(100% - ${3 * 16 + 56}px)` }
          }
        }
      }}
    >
      <DialogTitle
        sx={{ pt: 1, justifyContent: 'space-between', width: 'fit-container' }}
        component={"div"}
        onMouseOver={() => setTitleHovered(true)}
        onMouseOut={() => setTitleHovered(false)}
      >
        <IconButton onClick={onClose}>
          <CloseRounded />
        </IconButton>

        <Typography
          level='h3'
          sx={{ flex: "0 1 auto", whiteSpace: "nowrap", overflow: 'hidden', textOverflow: 'ellipsis' }}
        >
          {focused?.properties.name} {focused?.properties.lsad}
        </Typography>


        {(titleHovered || isMobile) && !!county?.visits.length ?
          <IconButton
            onClick={() => deleteCounty(focused.id)}
            color='danger'
          // sx={{ position: 'absolute', top: 16, right: 16 }}
          >
            <DeleteForeverRoundedIcon />
          </IconButton>
          : <div style={{ flex: "0 1 36px", visibility: "hidden" }}></div>}

      </DialogTitle>

      <DialogContent>
        <Stack p={2} gap={2}>

          <Button startDecorator={<AddIcon />} variant='soft' onClick={() => addVisit(auth.currentUser!.uid, focused, !!county?.visits.length)}>
            {/* <Button startDecorator={<AddIcon />} variant='soft'> */}
            Add Visit
          </Button>

          {county && county.visits.map((v, i) =>
            <VisitCard
              key={i}
              county={county}
              length={county.visits.length}
              index={i}
              trips={[]}
            />
          ).reverse()}

        </Stack>
      </DialogContent>
    </Drawer>
  )
}
