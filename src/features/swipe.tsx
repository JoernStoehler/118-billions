import { useEffect } from 'react';

export const useSwipe = (onSwipeLeft: () => void, onSwipeRight: () => void) => {
  useEffect(() => {
      let swipeTriggered = false; // Flag to prevent multiple triggers

      const handleTouchStart = (event: TouchEvent) => {
          swipeTriggered = false; // Reset flag on new touch start
          const touchStartX = event.touches[0].clientX;

          const handleTouchMove = (event: TouchEvent) => {
              if (swipeTriggered) return; // Prevent multiple triggers

              const touchEndX = event.touches[0].clientX;
              const touchDiff = touchStartX - touchEndX;

              if (touchDiff > 50) {
                  swipeTriggered = true;
                  onSwipeLeft();
                  removeEventListeners();
              } else if (touchDiff < -50) {
                  swipeTriggered = true;
                  onSwipeRight();
                  removeEventListeners();
              }
          };

          const removeEventListeners = () => {
              window.removeEventListener('touchmove', handleTouchMove);
              window.removeEventListener('touchend', removeEventListeners);
          };

          window.addEventListener('touchmove', handleTouchMove);
          window.addEventListener('touchend', removeEventListeners);
      };

      window.addEventListener('touchstart', handleTouchStart);

      return () => {
          window.removeEventListener('touchstart', handleTouchStart);
      };
  }, [onSwipeLeft, onSwipeRight]);
};