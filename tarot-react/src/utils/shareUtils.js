import html2canvas from 'html2canvas';

export async function sharePrediction(cardElement) {
  if (!cardElement) {
    console.error('Карта не выбрана');
    alert('Ошибка: карта не выбрана');
    return;
  }

  try {
    // Находим элемент с предсказанием
    const predictionElement = cardElement.querySelector('.card-prediction');
    
    if (!predictionElement) {
      console.error('Элемент с предсказанием не найден');
      alert('Ошибка: предсказание не найдено. Убедитесь, что карта открыта.');
      return;
    }

    // Проверяем, что предсказание видимо
    const isVisible = predictionElement.style.display !== 'none' && 
                     window.getComputedStyle(predictionElement).display !== 'none';
    
    if (!isVisible) {
      console.error('Предсказание не видимо');
      alert('Ошибка: предсказание не видимо. Откройте карту сначала.');
      return;
    }

    // Проверяем поддержку Web Share API (для мобильных устройств)
    if (navigator.share) {
      const imageBlob = await captureCardImage(predictionElement);
      
      if (imageBlob) {
        const file = new File([imageBlob], `tarot-prediction-2026-${Date.now()}.png`, { 
          type: 'image/png' 
        });
        
        // Проверяем, можно ли поделиться файлом
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              title: 'Моё предсказание на 2026 год',
              text: 'Посмотри мое предсказание Таро на 2026 год!',
              files: [file]
            });
            console.log('Предсказание успешно отправлено');
            return;
          } catch (shareError) {
            // Пользователь отменил шаринг или произошла ошибка
            if (shareError.name !== 'AbortError') {
              console.error('Ошибка при шаринге:', shareError);
              // Продолжаем к скачиванию
            } else {
              return; // Пользователь отменил
            }
          }
        } else {
          // Если не можем поделиться файлом, пробуем поделиться только текстом
          try {
            await navigator.share({
              title: 'Моё предсказание на 2026 год',
              text: 'Посмотри мое предсказание Таро на 2026 год!',
            });
            // Если поделились текстом, все равно скачиваем изображение
            await downloadPredictionImage(predictionElement);
            return;
          } catch (shareError) {
            if (shareError.name !== 'AbortError') {
              // Продолжаем к скачиванию
              await downloadPredictionImage(predictionElement);
            }
            return;
          }
        }
      }
    }
    
    // Для десктопов и старых браузеров - скачиваем изображение
    await downloadPredictionImage(predictionElement);
  } catch (error) {
    console.error('Ошибка при создании изображения:', error);
    alert('Не удалось создать изображение. Попробуйте еще раз.');
  }
}

async function captureCardImage(predictionElement) {
  try {
    // Сохраняем оригинальные стили
    const originalDisplay = predictionElement.style.display;
    const originalTransition = predictionElement.style.transition;
    const originalTransform = predictionElement.style.transform;
    const originalPosition = predictionElement.style.position;
    const originalZIndex = predictionElement.style.zIndex;
    
    // Убеждаемся, что элемент видим
    predictionElement.style.display = 'flex';
    predictionElement.style.transition = 'none';
    predictionElement.style.position = 'fixed';
    predictionElement.style.left = '50%';
    predictionElement.style.top = '50%';
    predictionElement.style.transform = 'translate(-50%, -50%) scale(1)';
    predictionElement.style.zIndex = '10000';
    
    // Ждем для применения стилей и загрузки изображений
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const canvas = await html2canvas(predictionElement, {
      backgroundColor: null, // Прозрачный фон, чтобы сохранить оригинальный
      scale: 2, // Хорошее качество без излишнего размера
      useCORS: true,
      logging: false,
      allowTaint: false,
      removeContainer: false,
      imageTimeout: 15000
    });
    
    // Восстанавливаем оригинальные стили
    predictionElement.style.display = originalDisplay;
    predictionElement.style.transition = originalTransition;
    predictionElement.style.transform = originalTransform;
    predictionElement.style.position = originalPosition;
    predictionElement.style.zIndex = originalZIndex;
    
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob);
      }, 'image/png', 0.95); // Высокое качество
    });
  } catch (error) {
    console.error('Ошибка при создании изображения:', error);
    return null;
  }
}

async function downloadPredictionImage(predictionElement) {
  try {
    // Сохраняем оригинальные стили
    const originalDisplay = predictionElement.style.display;
    const originalTransition = predictionElement.style.transition;
    const originalTransform = predictionElement.style.transform;
    const originalPosition = predictionElement.style.position;
    const originalZIndex = predictionElement.style.zIndex;
    
    // Убеждаемся, что элемент видим
    predictionElement.style.display = 'flex';
    predictionElement.style.transition = 'none';
    predictionElement.style.position = 'fixed';
    predictionElement.style.left = '50%';
    predictionElement.style.top = '50%';
    predictionElement.style.transform = 'translate(-50%, -50%) scale(1)';
    predictionElement.style.zIndex = '10000';
    
    // Ждем для применения стилей и загрузки изображений
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const canvas = await html2canvas(predictionElement, {
      backgroundColor: null, // Прозрачный фон, чтобы сохранить оригинальный
      scale: 2, // Хорошее качество без излишнего размера
      useCORS: true,
      logging: false,
      allowTaint: false,
      removeContainer: false,
      imageTimeout: 15000
    });
    
    // Восстанавливаем оригинальные стили
    predictionElement.style.display = originalDisplay;
    predictionElement.style.transition = originalTransition;
    predictionElement.style.transform = originalTransform;
    predictionElement.style.position = originalPosition;
    predictionElement.style.zIndex = originalZIndex;
    
    // Создаем ссылку для скачивания
    const link = document.createElement('a');
    link.download = `tarot-prediction-2026-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png', 0.95); // Высокое качество
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    console.log('Изображение успешно скачано');
  } catch (error) {
    console.error('Ошибка при скачивании изображения:', error);
    alert('Не удалось сохранить изображение. Попробуйте еще раз.');
  }
}

