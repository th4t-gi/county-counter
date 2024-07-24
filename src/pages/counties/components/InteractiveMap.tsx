import React, { CSSProperties, FC, ReactNode, forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import Map, { MapLayerMouseEvent, MapLayerTouchEvent, MapRef, ViewState } from 'react-map-gl';

import { County, CountyFeature } from '../../../types'

import useDoubleLongClick from '../../../hooks/useDoubleLongClick';
import { bbox } from '@turf/turf';
import usePrevious from '../../../hooks/usePrevious';
import { natureOptions } from '../counties';

type InteractiveMapProps = {
  focused: CountyFeature | null
  style?: CSSProperties
  children?: ReactNode,
  counties: County[]

  view: Partial<ViewState>

  onSingleClick?: (feature: CountyFeature) => void
  onDoubleClick?: (feature: CountyFeature) => void
  onLongClick?: (feature: CountyFeature) => void

  setClick?: (str: string) => void
} & React.ComponentProps<typeof Map>

export const InteractiveMap: FC<InteractiveMapProps> = forwardRef((props, ref) => {
  const { focused,
    children,
    counties,
    onSingleClick,
    onDoubleClick,
    onLongClick
  } = props

  const mapRef = useRef<MapRef>(null)
  const prevFocusedRef = useRef<CountyFeature | null>(focused)
  // const uid = auth.currentUser!.uid
  const prevCounties = usePrevious<County[]>(counties, [])
  const [isLoaded, setIsLoaded] = useState(false)



  // const styleId = process.env.REACT_APP_ENV === 'production' ? 'clo0th5kf00an01p60t1a24s2' : 'clrih8y4l006f01r7f899d6ok'
  const styleId = 'clo0th5kf00an01p60t1a24s2'
  const mapIsLoaded = mapRef.current?.isStyleLoaded() && !isLoaded
  useEffect(() => {
    if (mapIsLoaded) {
      setIsLoaded(true)
    }
  }, [mapIsLoaded])
  //BUG: Renders all counties a second time after first visitAdded

  //Rendering each county
  useEffect(() => {
    if (isLoaded) {
      console.log('rendering map');
      // console.log(prevCounties, counties);

      const deleted = prevCounties?.filter(prev => !counties.some(c => prev.id === c.id && prev.visits.length === c.visits.length))
      deleted?.forEach(c => {
        console.log(`deleting county ${c.id}`);
        mapRef.current?.removeFeatureState(getFeatureIdentifier(c.id))
      })

      counties.forEach(c => {
        const featState = mapRef.current?.getFeatureState(getFeatureIdentifier(c.id))

        if (featState?.count === c.visits.length) {
          // console.log(`county ${c.id} already rendered`);
          return
        }
        console.log(`county ${c.id} rendering`);

        const lived = c.visits.some(v => v.nature === 'lived')
        const firstVisit = c.visits.reduce((prev, curr) => prev.timestamp < curr.timestamp ? prev : curr)
        const nature = c.visits.map(v => v.nature).reduce((prev, curr) => {
          if (prev && curr && Object.keys(natureOptions).indexOf(prev) > Object.keys(natureOptions).indexOf(curr)) {
            return prev
          }
          return curr
        })
        mapRef.current?.setFeatureState(
          getFeatureIdentifier(c.id),
          {
            id: c.id,
            visited: !!c.visits.length,
            count: c.visits.length,
            lived,
            firstYear: new Date(firstVisit.timestamp).getFullYear(),
            firstTrip: firstVisit.trip || '',
            nature,
          }
        )
      });
    }
  }, [counties, isLoaded])

  useEffect(() => {
    if (focused && prevFocusedRef.current?.id !== focused?.id) {

      const [minLng, minLat, maxLng, maxLat] = bbox(focused);
      mapRef?.current?.fitBounds(
        [
          [minLng, minLat],
          [maxLng, maxLat],
        ],
        { padding: 100, duration: 3000 }
      );
    }

    prevFocusedRef.current = focused
  }, [focused])

  useImperativeHandle<MapRef | undefined, MapRef | undefined>(
    ref,
    () => mapRef.current || undefined
  )

  const _onClick = (eventHandler?: (feature: CountyFeature) => void) => (e: MapLayerMouseEvent | MapLayerTouchEvent) => {
    const features = mapRef.current?.queryRenderedFeatures(e.point, {
      layers: ['county-fill']
    })

    if (features?.length && eventHandler) {
      eventHandler(features[0] as CountyFeature)
    }
  }

  useDoubleLongClick({
    ref: mapRef,
    clickLatency: 250,
    longLatency: 400,
    onSingleClick: _onClick(onSingleClick),
    onDoubleClick: _onClick(onDoubleClick),
    onLongClick: _onClick(onLongClick),

    setClick: props.setClick
  });

  return (
    <Map
      {...props}
      {...props.view}
      ref={mapRef}
      minZoom={2.5}
      maxPitch={0}
      doubleClickZoom={false}
      interactiveLayerIds={['county-fill']}
      mapStyle={`mapbox://styles/juddlee/${styleId}`}
    >
      {children}
    </Map>
  )
})

export const getFeatureIdentifier = (id: number) => ({ source: 'composite', sourceLayer: 'base-counties-ids', id });