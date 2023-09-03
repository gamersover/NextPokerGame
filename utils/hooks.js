import { useEffect, useRef, useState } from "react";

const storage = {
    getItem(key, initialValue) {
      if (typeof window === "undefined") {
        return initialValue;
      }
      try {
        const unparsedValue = window.localStorage.getItem(key);
        if (typeof unparsedValue === "undefined") {
          return initialValue;
        }
        return JSON.parse(unparsedValue);
      } catch (error) {
        return initialValue;
      }
    },

    setItem(key, value) {
      window.localStorage.setItem(key,  JSON.stringify(value))
    },
  };


export function useLocalStorage(key, initialValue) {
    const [value, setValue] = useState(initialValue)

    useEffect(() => {
        setValue(storage.getItem(key))
    }, [key, initialValue])

    const setItem = (newValue) => {
        setValue(newValue);
        storage.setItem(key, newValue);
      };

    return [value, setItem];
}
