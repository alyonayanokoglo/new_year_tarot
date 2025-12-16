import { useState, useEffect, useCallback } from 'react';
import TarotCard from './TarotCard';
import { tarotCards, predictions } from '../data/tarotData';
import '../styles/CardsFan.css';

function CardsFan({ onCardSelect, selectedCardIndex, onShare, onNewReading, onShuffleReady, canSelect, isReturning, onReturnComplete }) {
  const [cards, setCards] = useState([]);
  const [notSelectedCards, setNotSelectedCards] = useState([]);
  const [selectedPrediction, setSelectedPrediction] = useState(null);
  const [isShuffling, setIsShuffling] = useState(false);
  const [cardsChanged, setCardsChanged] = useState(false);

  const generateCards = useCallback(() => {
    // Случайно выбираем 6 карт из колоды и добавляем соответствующее предсказание
    const shuffledTarot = [...tarotCards].sort(() => Math.random() - 0.5);
    const selectedTarot = shuffledTarot.slice(0, 6).map((card, idx) => {
      // Находим индекс карты в исходном массиве tarotCards
      const cardIndexInTarotDeck = tarotCards.findIndex(c => 
        c.name === card.name && c.number === card.number
      );
      // Присваиваем соответствующее предсказание по индексу
      const prediction = cardIndexInTarotDeck >= 0 && cardIndexInTarotDeck < predictions.length 
        ? predictions[cardIndexInTarotDeck] 
        : predictions[0];
      
      return {
        ...card,
        uniqueId: `${card.name}-${Date.now()}-${idx}`,
        prediction: prediction
      };
    });
    setCards(selectedTarot);
  }, []);

  useEffect(() => {
    generateCards();
  }, [generateCards]);

  // Передаем функцию перемешивания в родительский компонент
  useEffect(() => {
    if (onShuffleReady) {
      onShuffleReady(() => {
        console.log('Shuffling cards...');
        setIsShuffling(true);
        setCardsChanged(false);
        
        // Меняем карты в середине анимации (когда они кружатся)
        setTimeout(() => {
          generateCards();
          setNotSelectedCards([]);
          setSelectedPrediction(null);
          setCardsChanged(true);
        }, 1000); // В середине анимации (50% от 2s)
        
        // Заканчиваем анимацию
        setTimeout(() => {
          setIsShuffling(false);
          setCardsChanged(false);
          console.log('Cards shuffled!');
        }, 2050); // Общая длительность (2s + небольшой запас)
      });
    }
  }, [onShuffleReady, generateCards]);

  const handleCardSelect = (index) => {
    // Используем предсказание, которое уже привязано к карте
    const selectedCard = cards[index];
    const cardPrediction = selectedCard.prediction || predictions[0];
    
    console.log('CardsFan: Выбрано предсказание для карты:', selectedCard.name, cardPrediction);
    setSelectedPrediction(cardPrediction);
    
    onCardSelect(index);
    // Помечаем остальные карты как не выбранные
    setNotSelectedCards(
      cards.map((_, i) => i !== index)
    );
  };

  // Сброс состояния при возврате карты
  useEffect(() => {
    if (isReturning) {
      // Сбрасываем состояние не выбранных карт, чтобы они снова появились
      setNotSelectedCards([]);
    }
  }, [isReturning]);

  return (
    <div className={`cards-fan ${isShuffling ? 'shuffling' : ''} ${cardsChanged ? 'cards-changed' : ''}`}>
      {cards.map((card, index) => (
        <TarotCard
          key={card.uniqueId || `card-${index}`}
          card={card}
          index={index}
          totalCards={cards.length}
          onSelect={() => handleCardSelect(index)}
          isSelected={selectedCardIndex === index}
          isNotSelected={notSelectedCards[index]}
          prediction={selectedCardIndex === index ? selectedPrediction : null}
          onShare={onShare}
          onNewReading={onNewReading}
          canSelect={canSelect}
          isReturning={isReturning && selectedCardIndex === index}
          onReturnComplete={onReturnComplete}
        />
      ))}
    </div>
  );
}

export default CardsFan;
