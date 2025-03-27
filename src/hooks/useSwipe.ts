import { useEffect } from 'react';

const useSwipe = (onSwipeLeft: () => void, onSwipeRight: () => void) => {
    useEffect(() => {
        const handleTouchStart = (event: TouchEvent) => {
            const touchStartX = event.touches[0].clientX;

            const handleTouchMove = (event: TouchEvent) => {
                const touchEndX = event.touches[0].clientX;
                const touchDiff = touchStartX - touchEndX;

                if (touchDiff > 50) {
                    onSwipeLeft();
                    removeEventListeners();
                } else if (touchDiff < -50) {
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

export default useSwipe;