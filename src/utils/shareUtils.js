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
    // Создаем клон элемента для создания изображения, чтобы не трогать оригинал
    const clone = predictionElement.cloneNode(true);
    
    // Делаем клон невидимым для пользователя, но доступным для html2canvas
    // Используем position: fixed и убираем за пределы экрана, но оставляем видимым для html2canvas
    clone.style.position = 'fixed';
    clone.style.left = '-9999px';
    clone.style.top = '0';
    clone.style.width = predictionElement.offsetWidth + 'px';
    clone.style.height = predictionElement.offsetHeight + 'px';
    clone.style.zIndex = '-9999';
    clone.style.visibility = 'visible';
    clone.style.opacity = '1';
    clone.style.pointerEvents = 'none';
    // Убеждаемся, что фон виден
    clone.style.background = window.getComputedStyle(predictionElement).background || '#0F8EFF';
    clone.style.backgroundColor = window.getComputedStyle(predictionElement).backgroundColor || '#0F8EFF';
    
    // Добавляем клон в body (вне экрана)
    document.body.appendChild(clone);
    
    // Ждем для применения стилей и загрузки изображений
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Получаем вычисленный цвет фона и стили
    const computedStyle = window.getComputedStyle(predictionElement);
    const bgColor = computedStyle.backgroundColor || '#0F8EFF';
    const backgroundImage = computedStyle.backgroundImage;
    const background = computedStyle.background || `#0F8EFF url("/img/bg_2.svg") center/cover no-repeat`;
    
    // Ждем загрузки фонового изображения
    if (backgroundImage && backgroundImage !== 'none') {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      const imageUrl = backgroundImage.match(/url\(["']?([^"']+)["']?\)/)?.[1];
      if (imageUrl) {
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = resolve; // Продолжаем даже если изображение не загрузилось
          img.src = imageUrl.startsWith('/') ? window.location.origin + imageUrl : imageUrl;
          setTimeout(resolve, 1000); // Таймаут на случай проблем с загрузкой
        });
      }
    }
    
    const canvas = await html2canvas(clone, {
      backgroundColor: bgColor !== 'rgba(0, 0, 0, 0)' && bgColor !== 'transparent' ? bgColor : '#0F8EFF',
      scale: 2, // Хорошее качество без излишнего размера
      useCORS: true,
      logging: false,
      allowTaint: false,
      removeContainer: false,
      imageTimeout: 15000,
      windowWidth: clone.offsetWidth,
      windowHeight: clone.offsetHeight,
      onclone: (clonedDoc, element) => {
        // Находим клонированный элемент в клонированном документе
        // html2canvas клонирует весь body, поэтому ищем элемент по классу
        const clonedElement = clonedDoc.querySelector('.card-prediction') || element;
        if (clonedElement) {
          // Убеждаемся, что фон правильно установлен
          clonedElement.style.background = background;
          clonedElement.style.backgroundColor = bgColor;
          clonedElement.style.backgroundImage = backgroundImage !== 'none' ? backgroundImage : '';
          clonedElement.style.backgroundSize = 'cover';
          clonedElement.style.backgroundPosition = 'center';
          clonedElement.style.backgroundRepeat = 'no-repeat';
        }
      }
    });
    
    // Удаляем клон
    document.body.removeChild(clone);
    
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
    // Создаем клон элемента для создания изображения, чтобы не трогать оригинал
    const clone = predictionElement.cloneNode(true);
    
    // Делаем клон невидимым для пользователя, но доступным для html2canvas
    // Используем position: fixed и убираем за пределы экрана, но оставляем видимым для html2canvas
    clone.style.position = 'fixed';
    clone.style.left = '-9999px';
    clone.style.top = '0';
    clone.style.width = predictionElement.offsetWidth + 'px';
    clone.style.height = predictionElement.offsetHeight + 'px';
    clone.style.zIndex = '-9999';
    clone.style.visibility = 'visible';
    clone.style.opacity = '1';
    clone.style.pointerEvents = 'none';
    // Убеждаемся, что фон виден
    clone.style.background = window.getComputedStyle(predictionElement).background || '#0F8EFF';
    clone.style.backgroundColor = window.getComputedStyle(predictionElement).backgroundColor || '#0F8EFF';
    
    // Добавляем клон в body (вне экрана)
    document.body.appendChild(clone);
    
    // Ждем для применения стилей и загрузки изображений
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Получаем вычисленный цвет фона и стили
    const computedStyle = window.getComputedStyle(predictionElement);
    const bgColor = computedStyle.backgroundColor || '#0F8EFF';
    const backgroundImage = computedStyle.backgroundImage;
    const background = computedStyle.background || `#0F8EFF url("/img/bg_2.svg") center/cover no-repeat`;
    
    // Ждем загрузки фонового изображения
    if (backgroundImage && backgroundImage !== 'none') {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      const imageUrl = backgroundImage.match(/url\(["']?([^"']+)["']?\)/)?.[1];
      if (imageUrl) {
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = resolve; // Продолжаем даже если изображение не загрузилось
          img.src = imageUrl.startsWith('/') ? window.location.origin + imageUrl : imageUrl;
          setTimeout(resolve, 1000); // Таймаут на случай проблем с загрузкой
        });
      }
    }
    
    const canvas = await html2canvas(clone, {
      backgroundColor: bgColor !== 'rgba(0, 0, 0, 0)' && bgColor !== 'transparent' ? bgColor : '#0F8EFF',
      scale: 2, // Хорошее качество без излишнего размера
      useCORS: true,
      logging: false,
      allowTaint: false,
      removeContainer: false,
      imageTimeout: 15000,
      windowWidth: clone.offsetWidth,
      windowHeight: clone.offsetHeight,
      onclone: (clonedDoc, element) => {
        // Находим клонированный элемент в клонированном документе
        // html2canvas клонирует весь body, поэтому ищем элемент по классу
        const clonedElement = clonedDoc.querySelector('.card-prediction') || element;
        if (clonedElement) {
          // Убеждаемся, что фон правильно установлен
          clonedElement.style.background = background;
          clonedElement.style.backgroundColor = bgColor;
          clonedElement.style.backgroundImage = backgroundImage !== 'none' ? backgroundImage : '';
          clonedElement.style.backgroundSize = 'cover';
          clonedElement.style.backgroundPosition = 'center';
          clonedElement.style.backgroundRepeat = 'no-repeat';
        }
      }
    });
    
    // Удаляем клон
    document.body.removeChild(clone);
    
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

