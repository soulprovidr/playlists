import { useCallback, useState } from "react";

export const useStateObject = <T>(initialState: T) => {
  const [state, setState] = useState<T>(initialState);

  const setPartialState = useCallback((partialState: Partial<T>) => {
    setState((prevState) => ({
      ...prevState,
      ...partialState,
    }));
  }, []);

  return [state, setPartialState] as const;
};
