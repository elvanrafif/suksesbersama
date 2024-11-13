import { useState } from "react";

export const useModalHook = (defaultValue = false) => {
  const [isOpen, setIsOpen] = useState(defaultValue);
  const toggle = () => {
    setIsOpen((p) => !p);
  };
  const close = () => {
    setIsOpen(false);
  };
  const open = () => {
    setIsOpen(true);
  };
  return { toggle, isOpen, close, open };
};
