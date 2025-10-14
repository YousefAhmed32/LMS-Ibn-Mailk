import { useState, useEffect } from 'react';

/**
 * Custom hook to dynamically track the height of the fixed header
 * and provide responsive spacing for content below it
 */
const useHeaderHeight = () => {
  const [headerHeight, setHeaderHeight] = useState(64); // Default mobile height

  useEffect(() => {
    const updateHeaderHeight = () => {
      const header = document.querySelector('header');
      if (header) {
        const height = header.offsetHeight;
        setHeaderHeight(height);
      }
    };

    // Initial measurement with a small delay to ensure header is rendered
    const timeoutId = setTimeout(updateHeaderHeight, 100);

    // Update on resize
    window.addEventListener('resize', updateHeaderHeight);

    // Update when window loads (in case of dynamic content)
    window.addEventListener('load', updateHeaderHeight);

    // Cleanup
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', updateHeaderHeight);
      window.removeEventListener('load', updateHeaderHeight);
    };
  }, []);

  return headerHeight;
};

export default useHeaderHeight;
