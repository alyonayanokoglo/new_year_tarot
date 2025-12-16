import { useState, useEffect, useRef, useCallback } from 'react';
import LoadingScreen from './components/LoadingScreen';
import TarotHeader from './components/TarotHeader';
import CardsFan from './components/CardsFan';
import { sharePrediction } from './utils/shareUtils';
import './App.css';
import './styles/CardsFan.css';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCardIndex, setSelectedCardIndex] = useState(null);
  const [headerVisible, setHeaderVisible] = useState(true);
  const [showBackdrop, setShowBackdrop] = useState(false);
  const [hasShuffled, setHasShuffled] = useState(false);
  const [showHintText, setShowHintText] = useState(false);
  const [isReturning, setIsReturning] = useState(false);
  const shuffleFunctionRef = useRef(null);

  const handleLoadComplete = () => {
    setIsLoading(false);
  };

  const handleCardSelect = (index) => {
    setSelectedCardIndex(index);
    setHeaderVisible(false);
    setShowHintText(false);
    setShowBackdrop(true);
    
    // Убираем backdrop через 600ms
    setTimeout(() => {
      setShowBackdrop(false);
    }, 600);
  };

  const handleShare = async (cardElement) => {
    await sharePrediction(cardElement);
  };

  const handleNewReading = () => {
    // Запускаем анимацию возврата карты
    setIsReturning(true);
  };

  const handleReturnComplete = () => {
    // После завершения анимации возврата сбрасываем все состояния
    setIsReturning(false);
    setSelectedCardIndex(null);
    setHeaderVisible(true);
    setShowBackdrop(false);
    setHasShuffled(false);
    setShowHintText(false);
  };

  const handleShuffle = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    console.log('Shuffle button clicked');
    if (shuffleFunctionRef.current) {
      console.log('Calling shuffle function');
      shuffleFunctionRef.current();
      setSelectedCardIndex(null);
      setHeaderVisible(true);
      setShowBackdrop(false);
      setHasShuffled(true); // Отмечаем, что перемешивание было выполнено
      
      // Показываем подсказку после завершения анимации
      setTimeout(() => {
        setShowHintText(true);
      }, 2100); // Чуть больше длительности анимации (2s)
    } else {
      console.error('Shuffle function not available');
    }
  };

  const handleShuffleReady = useCallback((shuffleFn) => {
    shuffleFunctionRef.current = shuffleFn;
  }, []);

  if (isLoading) {
    return <LoadingScreen onLoadComplete={handleLoadComplete} />;
  }

  return (
    <>
      {/* Фоновый слой со звёздами */}
      <div 
        id="bg-stars"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundImage: "url('/img/bg.svg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          opacity: 0.6,
          pointerEvents: 'none',
          zIndex: 0
        }}
      />

      {/* Backdrop blur overlay */}
      {showBackdrop && (
        <div 
          className="backdrop-blur-overlay show"
          id="backdrop-blur"
        />
      )}

      <div id="tarot-container">
        <TarotHeader isVisible={headerVisible} />
        
        <CardsFan 
          onCardSelect={handleCardSelect}
          selectedCardIndex={selectedCardIndex}
          onShare={handleShare}
          onNewReading={handleNewReading}
          onShuffleReady={handleShuffleReady}
          canSelect={hasShuffled}
          isReturning={isReturning}
          onReturnComplete={handleReturnComplete}
        />

        {headerVisible && showHintText && (
          <p className="hint-text fade-in" id="hint-text">Выбери одну карту</p>
        )}
      </div>

      {selectedCardIndex === null && !hasShuffled && (
        <button 
          className="shuffle-btn-bottom" 
          onClick={(e) => {
            console.log('Button clicked directly');
            handleShuffle(e);
          }}
          onMouseDown={(e) => {
            console.log('Button mouse down');
            e.stopPropagation();
          }}
          type="button"
          aria-label="Перемешать карты"
        >
          Перемешать карты
        </button>
      )}
    </>
  );
}

export default App;
