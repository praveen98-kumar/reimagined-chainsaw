"use client";

import { useCallback, useState } from "react";

export function useToggle() {
  const [toggle, setToggle] = useState(false);

  const _setToggle = useCallback(() => {
    setToggle((prev) => !prev);
  }, []);

  return [toggle, _setToggle];
}
