import { RefObject, useEffect } from 'react';
import { MapEvent, MapLayerMouseEvent, MapLayerTouchEvent, MapRef } from 'react-map-gl';

/**
 * A simple React hook for differentiating single and double clicks on the same component.
 *
 * @param {node} ref Dom node to watch for double clicks
 * @param {number} [longLatency=400] The amount of time (in milliseconds) to wait before differentiating a single from a double click
 * @param {number} [clickLatency=200] The amount of time (in milliseconds) to wait before differentiating a single from a double click
 * @param {function} onSingleClick A callback function for single click events
 * @param {function} onDoubleClick A callback function for double click events
 * @param {function} onLongClick A callback function for long click events
 */

interface Parameters {
  ref: RefObject<any | null>,
  longLatency: number,
  clickLatency: number,
  onSingleClick?: (e: MapLayerMouseEvent | MapLayerTouchEvent) => void,
  onDoubleClick?: (e: MapLayerMouseEvent | MapLayerTouchEvent) => void,
  onLongClick?: (e: MapLayerMouseEvent | MapLayerTouchEvent) => void
  setClick?: (str: string) => void
}

const useDoubleLongClick = ({
  ref,
  longLatency = 400,
  clickLatency = 200,
  onSingleClick = () => null,
  onDoubleClick = () => null,
  onLongClick = () => null,

  setClick = () => null
}: Parameters) => {
  useEffect(() => {

    const clickRef: MapRef = ref?.current;

    if (clickRef) {
      // console.log('theres a ref!');

      let clickCount = 0;
      let timer: NodeJS.Timeout | null = null;
      let touch = false;
      let moving = false;

      const handleStart = (e: MapLayerMouseEvent | MapLayerTouchEvent) => {
        moving = false
        setClick('start not moving')

        timer = setTimeout(() => {
          console.log();

          if (!moving) {
            onLongClick(e)
          }
          timer = null
          // moving = false
          // setClick('not moving')
        }, longLatency);

      }

      const handleEnd = (e: MapLayerMouseEvent | MapLayerTouchEvent) => {
        if (timer && !moving) {
          clickCount += 1;

          setTimeout(() => {
            if (clickCount === 1) onSingleClick(e);
            else if (clickCount === 2) onDoubleClick(e);
            else if (clickCount === 3) console.log('hi tripple click');

            clickCount = 0;
            touch = false
            moving = false
            setClick('not moving')
          }, clickLatency);

          clearTimeout(timer)
          timer = null
        }
      }

      const handleMouseDown = (e: MapLayerMouseEvent) => {
        if (!touch) {
          handleStart(e)
        }
      }

      const handleTouchStart = (e: MapLayerTouchEvent) => {
        touch = true;
        handleStart(e)
      }


      const handleClick = (e: MapLayerMouseEvent) => {
        if (!touch) {
          handleEnd(e)
        }
      }

      const handleMove = (e: MapEvent) => {
        // console.log('moving');
        setClick('moving')
        moving = true
      }

      // Add event listener for click events
      clickRef.on('mousedown', handleMouseDown)
      clickRef.on('touchstart', handleTouchStart)
      clickRef.on('click', handleClick);
      clickRef.on('touchend', handleEnd)
      clickRef.on('move', handleMove)
      clickRef.on('boxzoomstart', handleMove)

      // Remove event listener
      return () => {
        clickRef.off('click', handleClick);
        clickRef.off('mousedown', handleMouseDown)
        clickRef.off('touchstart', handleTouchStart)
        clickRef.off('touchend', handleEnd)
        clickRef.off('move', handleMove)
        clickRef.off('boxzoomstart', handleMove)
      };
    }
  }, [ref?.current, onSingleClick, onDoubleClick, onLongClick]);

};

export default useDoubleLongClick;