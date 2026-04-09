import { useEffect, useState } from "react";

export type ViewAs = "founder" | "vc";

const STORAGE_KEY = "view_as";
const EVENT = "view_as_changed";

export function getViewAs(): ViewAs {
  if (typeof localStorage === "undefined") return "founder";
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored === "vc" ? "vc" : "founder";
}

export function setViewAs(role: ViewAs) {
  localStorage.setItem(STORAGE_KEY, role);
  window.dispatchEvent(new Event(EVENT));
}

export function useViewAs(): [ViewAs, (r: ViewAs) => void] {
  const [view, setView] = useState<ViewAs>(getViewAs);

  useEffect(() => {
    const handler = () => setView(getViewAs());
    window.addEventListener(EVENT, handler);
    return () => window.removeEventListener(EVENT, handler);
  }, []);

  return [view, (r: ViewAs) => { setViewAs(r); }];
}
