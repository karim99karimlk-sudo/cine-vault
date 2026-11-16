import { useState, useEffect } from 'react';

/**
 * Custom hook that debounces a rapidly changing value.
 * @template T
 * @param {T} value - The value to debounce
 * @param {number} delay - Delay in milliseconds (default: 400ms)
 * @returns {T}
 */
export function useDebounce(value, delay = 400) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

export default useDebounce;
