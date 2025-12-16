import { useEffect, useState } from 'react';
import '../styles/LoadingScreen.css';

function LoadingScreen({ onLoadComplete }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Симулируем загрузку
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => {
        onLoadComplete();
      }, 500);
    }, 2000);

    return () => clearTimeout(timer);
  }, [onLoadComplete]);

  if (!isVisible) return null;

  return (
    <div id="loading-screen" className={isVisible ? 'visible' : 'hidden'}>
      <div className="loading-symbol">🔮</div>
      <div className="loading-text">Тасуем карты судьбы...</div>
    </div>
  );
}

export default LoadingScreen;

