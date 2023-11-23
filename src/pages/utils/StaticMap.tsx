import React, { FC, useContext } from 'react';


interface StaticMapProps {
  coord: {
    lat: number,
    long: number,
    zoom: number
  } | false
}



const StaticMap: FC<StaticMapProps> = ({coord = false}) => {
  const accessToken = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN
  let lat, long, zoom;

  // const { test } = useContext(GlobalContext)
  if (!coord) {
    navigator.geolocation.getCurrentPosition((pos) => {
      lat = pos.coords.latitude
      long = pos.coords.longitude
      
    })
  } else {
    lat = coord.lat
    long = coord.long
    zoom = coord.zoom
  }
  
  const imgSrc = `https://api.mapbox.com/styles/v1/juddlee/clo0th5kf00an01p60t1a24s2/static/${long},${lat},${zoom},0/1000x500@2x?access_token=${accessToken}`

  // let position = new Promise<GeolocationPosition>((resolve, reject) => {
  //   navigator.geolocation.getCurrentPosition(resolve, reject)
  // })

  // position.then((pos) => {
  //   console.log(pos.coords.latitude, pos.coords.longitude)
  // })


  

  return (
    <div>
      <img src={imgSrc} alt="" className=' opacity-40'/>
    </div>
  )
}

export default StaticMap;