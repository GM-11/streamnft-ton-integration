// hooks/useMediaQuery.js
import { useState, useEffect } from "react";

const useMediaQuery = () => {
  // hook that checks if current viewport is pc level or not
  const [matches, setMatches] = useState(
    typeof window !== "undefined" ? window.matchMedia("(min-width: 768px)").matches : true
  )
  useEffect(() => {
    window ? window
      .matchMedia("(min-width: 768px)")
      .addEventListener('change', e => setMatches(e.matches)) : null
  }, []);

  return matches;
};


export default useMediaQuery;
