import { useEffect } from "react";

const AutoRefresh = () => {
  useEffect(() => {
    const interval = setInterval(() => {
      window.location.reload(); // 👈 full page refresh
    }, 10 * 1000); // 10 sec

    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  return null; // This component doesn't render anything
};

export default AutoRefresh;
