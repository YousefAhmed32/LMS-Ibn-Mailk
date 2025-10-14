"use client"

import React from 'react';

const Label = React.forwardRef(({ 
  children, 
  className = "", 
  ...props 
}, ref) => {
  return (
    <label
      ref={ref}
      className={`
        text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70
        ${className}
      `}
      {...props}
    >
      {children}
    </label>
  );
});

Label.displayName = 'Label';

export { Label };
export default Label;
