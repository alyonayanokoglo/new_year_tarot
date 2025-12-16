import '../styles/TarotHeader.css';

function TarotHeader({ isVisible }) {
  return (
    <>
      <img 
        src="/img/Logo Long NEW.svg" 
        alt="Совкомбанк Будущее" 
        className={`tarot-logo ${!isVisible ? 'hidden' : ''}`}
      />
      <div className={`tarot-header ${!isVisible ? 'hidden' : ''}`}>
        <h2>Узнай своё предсказание<br />на 2026 год</h2>
      </div>
    </>
  );
}

export default TarotHeader;

