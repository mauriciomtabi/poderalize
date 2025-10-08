import { createPortal } from "react-dom";
import { useEffect, useState } from "react";

export const DragPortal = ({ children }: { children: React.ReactNode }) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  if (!mounted) return null;
  return createPortal(children as any, document.body);
};

export default DragPortal;
