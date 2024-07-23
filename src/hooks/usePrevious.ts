import { useEffect, useRef } from 'react';

function usePrevious<T>(value: T, init?: T): T | undefined {
  const ref = useRef<T>();

  useEffect(() => {
    ref.current = value;
  }, [value]);

  useEffect(() => {
    if (init) ref.current = init
  }, [])

  return ref.current;
}

export default usePrevious;