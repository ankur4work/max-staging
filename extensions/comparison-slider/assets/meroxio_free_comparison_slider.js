function initializeImageComparisonSlider(imageComparisonSlider) {
  'use strict';

  if (!imageComparisonSlider) {
    console.warn('ImageComparisonSlider element is not provided.');
    return;
  }

  const sliderRange = imageComparisonSlider.querySelector('[data-m-image-comparison-range]');
  const thumb = imageComparisonSlider.querySelector('[m-image-comparison-thumb]');
  const slider = imageComparisonSlider.querySelector('[data-m-image-comparison-slider]');
  const imageWrapperOverlay = imageComparisonSlider.querySelector('[data-m-image-comparison-overlay]');
  let isMoving = false;

  function setSliderState(active) {
    if (active) {
      sliderRange.classList.add('m-image-comparison__range--active');
    } else {
      sliderRange.classList.remove('m-image-comparison__range--active');
    }
  }

  function moveSliderThumb(e) {
    if (!isMoving) return;

    let position = (e.layerY || e.clientY) - 20;
    position = Math.max(position, -20);
    position = Math.min(position, sliderRange.offsetHeight - 20);

    // Update thumb position here if needed
  }

  function moveSliderRange(e) {
    const value = e.target.value;

    slider.style.left = `${value}%`;
    imageWrapperOverlay.style.width = `${value}%`;

    setSliderState(e.type === 'input');
  }

  function addEventListeners(element, eventType, handler) {
    element.addEventListener(eventType, handler);
    element.addEventListener(`touch${eventType}`, handler);
  }

  function init() {
    addEventListeners(sliderRange, 'input', moveSliderRange);
    addEventListeners(sliderRange, 'change', moveSliderRange);

    if ('ontouchstart' in window) {
      addEventListeners(sliderRange, 'start', () => { isMoving = true; });
      addEventListeners(window, 'end', () => { isMoving = false; });
      addEventListeners(window, 'move', e => {
        if (isMoving) {
          window.requestAnimationFrame(() => moveSliderThumb(e.touches[0]));
        }
      });
    } else {
      sliderRange.addEventListener('mousedown', () => { isMoving = true; });
      window.addEventListener('mouseup', () => { isMoving = false; });
      window.addEventListener('mousemove', e => {
        if (isMoving) {
          window.requestAnimationFrame(() => moveSliderThumb(e));
        }
      });
    }
  }

  init();
}

// Initialize sliders for each block with a unique ID
document.addEventListener('DOMContentLoaded', function() {
  const sliders = document.querySelectorAll('[id^="mcsf-"]');
  sliders.forEach(slider => {
    initializeImageComparisonSlider(slider);
  });
});
