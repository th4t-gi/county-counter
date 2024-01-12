import React, { FC, useContext, useEffect, useState } from 'react';


interface StaticMapProps {
  coords: {
    lat: number,
    long: number,
    zoom: number
  }
  className?: string
}



const StaticMap: FC<StaticMapProps> = (props) => {
  const accessToken = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN
  let [imgSrc, setImgSrc] = useState("");

  let defaultCoords = {
    lat: 0,
    long: 0,
    zoom: 6
  }

  const getCurrentPosition = () => {
    return new Promise<GeolocationPosition> ((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject)
    })
  }

  const getImgUrl = ({lat, long, zoom}: {lat: number, long: number, zoom: number}) => {
    return './1000x500@2x.png'
    // return `https://api.mapbox.com/styles/v1/juddlee/clo0th5kf00an01p60t1a24s2/static/${long},${lat},${zoom},0/1000x500?access_token=${accessToken}`
  }

  // navigator.geolocation.getCurrentPosition(pos => {
  //   console.log('hi');

  //   let defaultCoords = {
  //     lat: pos.coords.latitude,
  //     long: pos.coords.longitude,
  //     zoom: 6
  //   }

  //   let url = getImgUrl(props.coords || defaultCoords)
  //   console.log(url);
    
  //   // setImgSrc(url)
  // })

  useEffect(() => {
    let url = getImgUrl(props.coords)
    
    setImgSrc(url)
    
    // getCurrentPosition().then(pos => {
    //   console.log('hi');

    //   let defaultCoords = {
    //     lat: pos.coords.latitude,
    //     long: pos.coords.longitude,
    //     zoom: 6
    //   }

    //   let url = getImgUrl(props.coords || defaultCoords)
    //   console.log(url);
      
    //   setImgSrc(url)
    // }).catch(console.error)
      // const { test } = useContext(GlobalContext)

    
  }, [])


  

  return (
    <img className={props.className} src={imgSrc} alt={`County Counter map`}/>
  )
}

export default StaticMap;