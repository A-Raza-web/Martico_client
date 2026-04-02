import { useEffect, useState } from "react";
import "./Loader.css";

export default function Loader() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCount((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 1;
      });
    }, 30);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="loader-container">
      <h1 className="logo">
        Marti<span>co</span>
      </h1>

      <div className="loading-bar">
        <div className="bar-fill"></div>
      </div>

      <div className="percent">{count}%</div>

      <p className="loading-text">
        Loading amazing deals for you...
      </p>
    </div>
  );
}