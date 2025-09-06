import { useState, useEffect, useCallback } from 'react';

type SetValue<T> = T | ((val: T) => T);

interface UseLocalStorageReturn<T> {
  storedValue: T;
  setValue: (value: SetValue<T>) => void;
  loading: boolean;
  error: string | null;
}

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  serializer?: {
    serialize: (value: T) => string;
    deserialize: (value: string) => T;
  }
): UseLocalStorageReturn<T> {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Default serialization functions
  const serialize = serializer?.serialize || JSON.stringify;
  const deserialize = serializer?.deserialize || JSON.parse;

  // Read value from localStorage on mount
  useEffect(() => {
    try {
      const item = localStorage.getItem(key);
      if (item !== null) {
        const parsedValue = deserialize(item);
        setStoredValue(parsedValue);
      }
      setError(null);
    } catch (err) {
      console.error(`Error reading localStorage key "${key}":`, err);
      setError(`Failed to load ${key} from storage`);
    } finally {
      setLoading(false);
    }
  }, [key, deserialize]);

  // Return a wrapped version of useState's setter function that persists the new value to localStorage
  const setValue = useCallback((value: SetValue<T>) => {
    try {
      // Allow value to be a function so we have the same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      // Save to local storage
      localStorage.setItem(key, serialize(valueToStore));
      
      // Save state
      setStoredValue(valueToStore);
      setError(null);
    } catch (err) {
      console.error(`Error setting localStorage key "${key}":`, err);
      
      if (err instanceof Error && err.name === 'QuotaExceededError') {
        setError('Storage quota exceeded. Please free up space by deleting some data.');
      } else {
        setError(`Failed to save ${key} to storage`);
      }
    }
  }, [key, serialize, storedValue]);

  // Listen for changes to localStorage from other tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          const newValue = deserialize(e.newValue);
          setStoredValue(newValue);
          setError(null);
        } catch (err) {
          console.error(`Error parsing localStorage change for key "${key}":`, err);
          setError(`Failed to sync ${key} from storage`);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key, deserialize]);

  return {
    storedValue,
    setValue,
    loading,
    error
  };
}