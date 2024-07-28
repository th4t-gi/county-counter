import React, { CSSProperties, FC, useEffect, useState } from 'react';
import { useGeolocated } from "react-geolocated";

import { featureCollection, nearestPoint, point } from "@turf/turf"

import imgCoordsSource from "../resources/static_coords.json"

import { getDownloadURL, getStorage, ref } from "firebase/storage";

const imgCoords = imgCoordsSource as [number, number][]

interface Coords {
  lat: number,
  long: number
}

interface BaseBackgroundMapImageProps {
  mask?: boolean
  style?: CSSProperties
  className?: string
}

type BackgroundMapImageProps = BaseBackgroundMapImageProps &
  ({
    live: false
    random: false
    defaultCoords: Coords
  } |
  {
    random?: boolean
    defaultCoords?: Coords
    live?: boolean
  })

const BackgroundMapImage: FC<BackgroundMapImageProps> = (props) => {
  // const accessToken = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN

  const { defaultCoords, mask, live, random } = props
  let [imgSrc, setImgSrc] = useState('/blank.png');

  const { coords } =
    useGeolocated({
      positionOptions: {
        enableHighAccuracy: false,
        maximumAge: Infinity
      },
      userDecisionTimeout: 5000,
    });

  const getImgUrl = (coords: [number, number]) => {
    const targetPoint = point(coords);
    const points = featureCollection(imgCoords.map(c => point(c)));
    const nearest = nearestPoint(targetPoint, points);

    // console.log("Nearest", nearest);

    const lat = nearest.geometry.coordinates[1]
    const long = nearest.geometry.coordinates[0]

    const name = `${lat},${long}-w1280h1280z7.png`
    const imgRef = ref(getStorage(), 'static_maps_new/' + name);

    getDownloadURL(imgRef).then(setImgSrc)
  }

  useEffect(() => {
    if (random) {
      const i = Math.floor(Math.random() * imgCoords.length)
      getImgUrl(imgCoords[i])
    } else if (defaultCoords) {
      getImgUrl([defaultCoords.long, defaultCoords.lat])
    }
  }, [])


  useEffect(() => {

    if (coords && live) {
      console.log("got coords\n" + JSON.stringify(coords))
      getImgUrl([coords.longitude, coords.latitude])
    }

  }, [coords])

  const imgMask: CSSProperties = {
    maskImage: "radial-gradient(69.66% 50% at 49.97% 50%, #000 0%, rgba(0, 0, 0, 0.00) 100%)",
    WebkitMaskImage: "radial-gradient(69.66% 50% at 49.97% 50%, #000 0%, rgba(0, 0, 0, 0.00) 100%)",
  }
  const style: CSSProperties = {
    backgroundImage: `url(${imgSrc})`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
    backgroundSize: 'cover',
    // position: 'absolute',
    width: '100%',
    height: '100%',
  }

  const imgStyle = mask ? { ...style, ...imgMask } : style


  return (
    <div style={{ width: '100%', height: '100%', ...props.style }} className={props.className}>
      <div style={imgStyle}></div>
      {/* <img {...props.style} src={imgSrc} alt={`Static map centered at ${JSON.stringify(imgCenter)}`} /> */}
    </div>
  )
}

export default BackgroundMapImage;