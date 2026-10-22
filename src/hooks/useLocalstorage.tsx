import { Dispatch, SetStateAction, useState } from "react";

type SetValue<T> = Dispatch<SetStateAction<T>>;

const useLocalstorage = <T extends any>(
  key: string,
  initialValue?: T
): [T, SetValue<T>, (key?: string) => void] => {
  const [state, setState] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });

  const setLocalState = (newState: any) => {
    try {
      const newStateValue =
        typeof newState === "function" ? newState(state) : newState;
      setState(newStateValue);
      window.localStorage.setItem(key, JSON.stringify(newStateValue));
    } catch (error) {
      console.log(`Unable to store new value for ${key} in localstorage`);
    }
  };

  const removeState = (localKey: string = key) => {
    try {
      if (window.localStorage.getItem(localKey)) {
        window.localStorage.removeItem(localKey);
      }
    } catch (error) {
      console.error(`Unable to remove value for ${key} in localstorage`);
    }
  };
  return [state, setLocalState, removeState];
};

export default useLocalstorage;
