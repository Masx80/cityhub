"use client";

interface ScrollToOptions {
  offset?: number;
  behavior?: ScrollBehavior;
}

/**
 * Scrolls to a specific element using browser's native scrolling
 */
export function scrollToElement(
  elementOrSelector: string | HTMLElement,
  options: ScrollToOptions = {}
): void {
  const { offset = 0, behavior = 'auto' } = options;
  
  // Get the target element
  const targetElement = 
    typeof elementOrSelector === 'string'
      ? document.querySelector(elementOrSelector)
      : elementOrSelector;
  
  if (!targetElement) {
    console.warn(`Element not found: ${elementOrSelector}`);
    return;
  }
  
  const targetPosition = targetElement.getBoundingClientRect().top + window.scrollY - offset;
  
  // Use browser's built-in scrolling
  window.scrollTo({
    top: targetPosition,
    behavior: behavior
  });
}

/**
 * Scroll to specific y-position using browser's native scrolling
 */
export function scrollToY(
  targetY: number, 
  options: ScrollToOptions = {}
): void {
  const { behavior = 'auto' } = options;
  
  // Use browser's built-in scrolling
  window.scrollTo({
    top: targetY,
    behavior: behavior
  });
}

/**
 * Scroll to top of page using browser's native scrolling
 */
export function scrollToTop(options: ScrollToOptions = {}): void {
  scrollToY(0, options);
}

/**
 * Setup a scroll container with minimal styling
 */
export function setupSmoothScrollContainer(
  containerElement: HTMLElement
): void {
  if (!containerElement) return;
  
  // Don't add any special classes or styles
  // Let the browser handle scrolling naturally
} 