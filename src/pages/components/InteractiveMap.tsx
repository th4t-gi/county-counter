import React, { CSSProperties, FC, ReactElement, ReactNode, RefObject, forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import Map, { FillLayer, Layer, MapLayerMouseEvent, MapLayerTouchEvent, MapRef, MapboxEvent, ViewState, ViewStateChangeEvent } from 'react-map-gl';

import { County, CountyFeature, CountyFeatureState, CountyObject, getFeatureIdentifier, natureOptions } from '../../resources/utils'

import useDoubleLongClick from '../utils/useDoubleLongClick';
import { bbox } from '@turf/turf';

type InteractiveMapProps = {
  counties: CountyObject
  focused?: CountyFeature
  style?: CSSProperties
  children?: ReactNode

  view: Partial<ViewState>

  onSingleClick?: (feature: CountyFeature) => void
  onDoubleClick?: (feature: CountyFeature) => void
  onLongClick?: (feature: CountyFeature) => void

  setClick?: (str: string) => void
} & React.ComponentProps<typeof Map>

export const InteractiveMap: FC<InteractiveMapProps> = forwardRef((props, ref) => {
  const { counties,
    focused,
    children,
    onSingleClick,
    onDoubleClick,
    onLongClick
  } = props

  const mapRef = useRef<MapRef>(null)
  const prevFocusedRef = useRef<CountyFeature | undefined>(focused)

  const styleId = process.env.REACT_APP_ENV === 'production' ? 'clo0th5kf00an01p60t1a24s2' : 'clrih8y4l006f01r7f899d6ok'



  const onLoad = (e: MapboxEvent) => {

    const features = e.target.querySourceFeatures('composite', {
      sourceLayer: 'base-counties-ids',
      filter: ["==", ['id'], 8041]
    })

    // console.log(features);

    // if (features?.length) {
    //   onLongClick(features[0] as CountyFeature)
    // }
  }

  useEffect(() => {

    console.log('rendering map');

    Object.values(counties).forEach(c => {

      if (!c.visits?.length) {
        removeFeatState(c.id)
        return
      }

      // console.log(c);

      const lived = c.visits.some(v => v.nature == 'lived')
      const firstVisit = c.visits.reduce((prev, curr) => prev.timestamp < curr.timestamp ? prev : curr)
      const nature = c.visits.map(v => v.nature).reduce((prev, curr) => {
        if (prev && curr && Object.keys(natureOptions).indexOf(prev) > Object.keys(natureOptions).indexOf(curr)) {
          return prev
        }
        return curr
      })

      setFeatState({
        id: c.id,
        visited: !!c.visits.length,
        count: c.visits.length,
        lived,
        firstYear: new Date(firstVisit.timestamp).getFullYear(),
        firstTrip: firstVisit.trip || '',
        nature,
      })
    })

  }, [counties])

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


  const getFeatState = (id: number) => mapRef?.current?.getFeatureState(getFeatureIdentifier(id)) as County
  const setFeatState = (state: CountyFeatureState | { id: number }) => mapRef.current?.setFeatureState(getFeatureIdentifier(state.id), state)
  const removeFeatState = (id: number) => mapRef.current?.removeFeatureState(getFeatureIdentifier(id))

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