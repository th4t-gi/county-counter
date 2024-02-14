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

import { County, CountyFeature, Visit } from '../utils/utils'
import { VisitCard } from './VisitCard'

interface DetailPanelProps {
  feature: CountyFeature
  focused: County | undefined
  setVisits: (id: number, visits: Visit[]) => void
  addVisit: (feature: CountyFeature) => void
  editVisit: (id: number) => (index: number, visit: Partial<Visit>) => void
  removeVisit: (id: number) => (index: number) => void
  onClose: () => void
}

export const DetailPanel: FC<DetailPanelProps> = (props) => {

  const {
    feature,
    focused,
    setVisits,
    addVisit,
    editVisit,
    removeVisit,
    onClose
  } = props

  const [titleHovered, setTitleHovered] = useState(false)

  return (
    <Drawer
      disableEnforceFocus
      open={!!feature}
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
        level='h3'
        onMouseOver={() => setTitleHovered(true)}
        onMouseOut={() => setTitleHovered(false)}
      >
        <IconButton
          onClick={onClose}
        >
          <CloseRounded />
        </IconButton>

        {/* BUG: Warning: validateDOMNesting(...): <h3> cannot appear as a child of <h2>. */}
        <Typography
          level='h3'
          sx={{ flex: "0 1 auto", whiteSpace: "nowrap", overflow: 'hidden', textOverflow: 'ellipsis' }}
        >
          {feature?.properties.name} {feature?.properties.lsad}
        </Typography>


        {(titleHovered || isMobile) && !!focused?.visits.length ?
          <IconButton
            onClick={() => setVisits(focused.id, [])}
            color='danger'
          // sx={{ position: 'absolute', top: 16, right: 16 }}
          >
            <DeleteForeverRoundedIcon />
          </IconButton>
          : <div style={{ flex: "0 1 36px", visibility: "hidden" }}></div>}

      </DialogTitle>

      <DialogContent>
        <Stack p={2} gap={2}>

          <Button startDecorator={<AddIcon />} variant='soft' onClick={() => addVisit(feature)}>
            {/* <Button startDecorator={<AddIcon />} variant='soft'> */}
            Add Visit
          </Button>

          {focused && focused.visits.sort((v1, v2) => v2.timestamp.getTime() - v1.timestamp.getTime()).map((v, i) =>
            <VisitCard
              key={i}
              visit={v}
              length={focused.visits.length}
              index={i}
              editVisit={editVisit(focused.id)}
              removeVisit={removeVisit(focused.id)}
              trips={[]}
            />
          )}

        </Stack>
      </DialogContent>
    </Drawer>
  )
}
