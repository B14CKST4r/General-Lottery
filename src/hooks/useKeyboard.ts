import { useEffect, useCallback } from 'react';

interface KeyboardCallbacks {
  onSpace?: () => void;
  onEscape?: () => void;
  onNumber?: (num: number) => void;
  onEnter?: () => void;
  onB?: () => void;
  onH?: () => void;
  onM?: () => void;
  onArrowUp?: () => void;
  onArrowDown?: () => void;
  onF11?: () => void;
}

export const useKeyboard = (callbacks: KeyboardCallbacks, enabled: boolean = true) => {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      switch (event.key) {
        case ' ':
          event.preventDefault();
          callbacks.onSpace?.();
          break;
        case 'Escape':
          callbacks.onEscape?.();
          break;
        case 'Enter':
          callbacks.onEnter?.();
          break;
        case 'b':
        case 'B':
          callbacks.onB?.();
          break;
        case 'h':
        case 'H':
          callbacks.onH?.();
          break;
        case 'm':
        case 'M':
          callbacks.onM?.();
          break;
        case 'ArrowUp':
          callbacks.onArrowUp?.();
          break;
        case 'ArrowDown':
          callbacks.onArrowDown?.();
          break;
        case 'F11':
          event.preventDefault();
          callbacks.onF11?.();
          break;
        default:
          // 数字键 1-9
          const num = parseInt(event.key);
          if (num >= 1 && num <= 9) {
            callbacks.onNumber?.(num);
          }
          break;
      }
    },
    [callbacks, enabled]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
};
