import { MapboxGeoJSONFeature } from 'mapbox-gl'
import React, { ChangeEvent, FC, useEffect, useState } from 'react'
import { County, CountyFeature } from '../../resources/utils'

interface SidePanelProps {
  county: CountyFeature
  setCurrent: (c: CountyFeature | null) => void
}


const SidePanel: FC<SidePanelProps> = (props) => {

  const [count, setCount] = useState(0)
  const [visited, setVisited] = useState(false)
  const [lived, setLived] = useState(false)

  const {county} = props
  
  // useEffect(() => {
  //   if (Object.keys(county.state).length) {
  //     setCount((county.state as County).count)
  //     setVisited((county.state as County).visited)
  //     setLived((county.state as County).lived)
  //   } else {
  //     setCount(0)
  //     setVisited(false)
  //     setLived(false)
  //   }
  // }, [county])

  // useEffect(() => {
  //   if (!Number.isNaN(count)) {
  //     setCurrentState({count, visited, lived})
  //   }
  // }, [count, visited, lived])


  // const setCurrentState = (obj: {[key: string]: any}) => {
  //   const state = getCountyState(county)

  //   console.log('set current county', {...state, ...obj});
    
  //   props.setCurrent({...county, state: {...state, ...obj}})
  // }

  // const updateCounty = (c: Partial<County>) => {
  //   if (c.count !== undefined) {
  //     console.log(c.count);
      
  //     setCount(c.count)
  //     if (c.count && !visited) setVisited(true)
  //     else if (c.count == 0) setVisited(false)
  //   }

  //   if (c.visited !== undefined) {
  //     setVisited(c.visited)
  //     if (!c.visited) setCount(0)
  //     else if (c.visited && count == 0) setCount(1)
  //   }

  //   if (c.lived !== undefined) {
  //     if (c.lived) {
  //       setVisited(true)
  //       setCount(1)
  //     }
  //     setLived(c.lived)
  //   }
    
  // }

  return (
    // <div className='absolute right-0 bg-white h-5/6 w-1/3 overflow-auto overflow-y-scroll'></div>
    <div className='p-2' >
      {/* <XMarkIcon className="h-10 w-10" onClick={() => { props.setCurrent(null) }} /> */}
        {/* <h1 className=' text-2xl'>{county.properties.name} {county.properties.lsad}</h1> */}

      {/* <div>
        <label className=' mx-2'>
          Count:
          <input type="number" className=' mx-2' min={0} value={count} onChange={(e) => updateCounty({count: parseInt(e.target.value)})} />
        </label>
      </div>

      <div>
        <label>
          <input className=' mx-2' type="checkbox" checked={visited} onChange={(e) => updateCounty({visited: e.target.checked})}/>
          Visited
        </label>
      </div>

      <div>
        <label>
          <input className=' mx-2' type="checkbox" checked={lived} onChange={(e) => updateCounty({lived: e.target.checked})}/>
          Lived
        </label>
      </div> */}

      <p>county: {JSON.stringify(county.state)}</p>
    </div>
  )
}

export default SidePanel