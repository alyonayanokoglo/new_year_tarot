import { useState, useRef, useEffect } from 'react';
import '../styles/TarotCard.css';

function TarotCard({ card, index, totalCards, onSelect, isSelected, isNotSelected, prediction, onShare, onNewReading, canSelect, isReturning, onReturnComplete }) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [showPrediction, setShowPrediction] = useState(false);
  const [isFlippingToPrediction, setIsFlippingToPrediction] = useState(false);
  const cardRef = useRef(null);
  const initialPositionRef = useRef(null);

  const handleCardClick = (e) => {
    // Если клик был по кнопке или её родителю, не обрабатываем
    const target = e.target;
    if (target.closest('.card-prediction-buttons') || 
        target.closest('.share-prediction-btn') || 
        target.closest('.new-reading-btn-prediction') ||
        target.tagName === 'BUTTON') {
      e.stopPropagation();
      return;
    }
    
    // Если показывается предсказание или идет анимация переворота, не обрабатываем клики по карте
    if (showPrediction || isFlippingToPrediction) {
      return;
    }
    
    // Блокируем выбор карты, если перемешивание не было выполнено
    if (!canSelect && !isSelected) {
      return;
    }
    
    if (!isSelected) {
      // Вычисляем начальную позицию карты в веере перед переходом на fixed
      if (cardRef.current) {
        const rect = cardRef.current.getBoundingClientRect();
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        
        // Вычисляем смещение от центра экрана до центра карты
        const initialX = rect.left + rect.width / 2 - centerX;
        const initialY = rect.top + rect.height / 2 - centerY;
        
        // Сохраняем в ref для использования в useEffect
        initialPositionRef.current = { x: initialX, y: initialY };
        
        // Устанавливаем начальную позицию через CSS переменные
        cardRef.current.style.setProperty('--initial-x', `${initialX}px`);
        cardRef.current.style.setProperty('--initial-y', `${initialY}px`);
      }
      onSelect();
    } else if (isSelected && isFlipped && !showPrediction && !isFlippingToPrediction) {
      // Показываем предсказание при клике на перевернутую карту с анимацией переворота
      if (prediction && cardRef.current) {
        // Заполняем предсказание
        const titleEl = cardRef.current.querySelector('.card-prediction-title');
        const textEl = cardRef.current.querySelector('.card-prediction-text');
        const adviceEl = cardRef.current.querySelector('.card-prediction-advice');
        
        if (titleEl) titleEl.innerText = prediction.title || '';
        if (textEl) textEl.innerText = prediction.text || '';
        if (adviceEl) adviceEl.innerText = prediction.advice || '';
        
        // Запускаем анимацию переворота
        setIsFlippingToPrediction(true);
        
        // После завершения анимации переворота показываем предсказание
        setTimeout(() => {
          setShowPrediction(true);
          setIsFlippingToPrediction(false);
          
          // Полностью скрываем карту аркана после анимации
          if (cardRef.current) {
            const cardFront = cardRef.current.querySelector('.card-front');
            if (cardFront) {
              cardFront.style.display = 'none';
              cardFront.style.visibility = 'hidden';
            }
          }
        }, 800); // Длительность анимации переворота
      }
    }
  };

  useEffect(() => {
    if (isSelected) {
      // Анимация вылета и переворота - переворот начинается одновременно с вылетом
      setIsFlipped(true);
    }
  }, [isSelected]);


  useEffect(() => {
    if (showPrediction && cardRef.current && !isFlippingToPrediction) {
      // Находим элементы
      const predictionFace = cardRef.current.querySelector('.card-prediction');
      const cardBack = cardRef.current.querySelector('.card-back');
      const cardFront = cardRef.current.querySelector('.card-front');

      // Показываем сторону с предсказанием
      if (predictionFace) {
        predictionFace.style.display = 'flex';
        predictionFace.style.transform = 'rotateY(0deg)';
        predictionFace.style.visibility = 'visible';
        predictionFace.style.zIndex = '1000';
      }
      
      // Скрываем card-back и card-front
      if (cardBack) {
        cardBack.style.display = 'none';
      }
      if (cardFront) {
        cardFront.style.display = 'none';
      }
      
      // Останавливаем анимацию вылета и фиксируем финальное состояние
      cardRef.current.style.animation = 'none';
      cardRef.current.style.setProperty('transform', 'translate3d(-50%, -50%, 0px) rotate(0deg) scale(1)', 'important');
    }
  }, [showPrediction, isFlippingToPrediction]);

  // Обработка анимации возврата
  useEffect(() => {
    if (isReturning && cardRef.current) {
      // Сбрасываем состояние карты
      setShowPrediction(false);
      setIsFlipped(false);
      setIsFlippingToPrediction(false);
      
      // Скрываем предсказание и показываем рубашку
      const predictionFace = cardRef.current.querySelector('.card-prediction');
      const cardBack = cardRef.current.querySelector('.card-back');
      
      if (predictionFace) {
        predictionFace.style.display = 'none';
      }
      if (cardBack) {
        cardBack.style.display = 'flex';
      }
      
      // Сбрасываем transform для правильного возврата
      if (cardRef.current) {
        cardRef.current.style.transition = '';
        cardRef.current.style.transform = '';
      }
      
      // После завершения анимации вызываем callback
      const timer = setTimeout(() => {
        if (onReturnComplete) {
          onReturnComplete();
        }
      }, 1500); // Длительность анимации возврата
      
      return () => clearTimeout(timer);
    }
  }, [isReturning, onReturnComplete]);

  const handleShare = async (e) => {
    e.stopPropagation();
    if (cardRef.current) {
      onShare(cardRef.current);
    }
  };

  const handleNewReading = (e) => {
    e.stopPropagation();
    onNewReading();
  };

  return (
    <div
      ref={cardRef}
      className={`fan-card ${isSelected ? 'selected' : ''} ${isNotSelected ? 'not-selected' : ''} ${isFlipped ? 'flipped' : ''} ${!canSelect && !isSelected ? 'disabled' : ''} ${isReturning ? 'returning' : ''} ${showPrediction ? 'showing-prediction' : ''} ${isFlippingToPrediction ? 'flipping-to-prediction' : ''}`}
      style={{
        ...(isSelected ? { zIndex: 1000 } : {}),
        ...(!canSelect && !isSelected ? { cursor: 'default' } : {})
      }}
      onClick={handleCardClick}
      onMouseDown={(e) => {
        // Если клик по кнопке, не обрабатываем
        if (e.target.closest('.card-prediction-buttons') || 
            e.target.closest('.share-prediction-btn') || 
            e.target.closest('.new-reading-btn-prediction') ||
            e.target.tagName === 'BUTTON') {
          e.stopPropagation();
        }
      }}
    >
      {/* Рубашка карты */}
      <div className={`card-face card-back ${isFlipped ? 'flipped' : ''}`}>
        <span className="card-back-symbol"></span>
      </div>

      {/* Лицевая сторона карты */}
      <div className={`card-face card-front ${card.image ? 'image-card' : ''} ${isFlipped ? 'flipped' : ''} ${isFlippingToPrediction ? 'flipping-to-prediction' : ''}`}>
        {card.image ? (
          <img src={card.image} alt={card.name || ''} className="tarot-image-full" />
        ) : (
          <>
            <div className="tarot-card-number">{card.number}</div>
            <div className="tarot-card-icon">{card.icon}</div>
            <div className="tarot-card-name">{card.name}</div>
            <div className="tarot-card-subtitle">{card.subtitle}</div>
            {!isFlipped && !showPrediction && !isFlippingToPrediction && <div className="tarot-tap-hint">Нажми для предсказания</div>}
          </>
        )}
      </div>

      {/* Сторона с предсказанием - обратная сторона карты аркана */}
      <div 
        className={`card-face card-prediction ${showPrediction ? 'visible' : ''} ${isFlippingToPrediction ? 'flipping-from-front' : ''}`} 
        style={showPrediction || isFlippingToPrediction ? { display: 'flex' } : { display: 'none' }}
      >
        <img src="/img/Logo Long NEW.svg" alt="Logo" className="card-prediction-logo" />
        <div className="card-prediction-content">
          <div className="card-prediction-group">
            <div className="card-prediction-title"></div>
            <div className="card-prediction-text"></div>
            <div className="card-prediction-advice-label">Совет:</div>
            <div className="card-prediction-advice"></div>
          </div>
        </div>
        <div className="card-prediction-buttons">
          <button className="share-prediction-btn" onClick={handleShare}>
            Поделиться предсказанием
          </button>
          <button className="new-reading-btn-prediction" onClick={handleNewReading}>
            Сделать еще один расклад
          </button>
        </div>
      </div>
    </div>
  );
}

export default TarotCard;
