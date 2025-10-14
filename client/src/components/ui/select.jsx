import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

const SelectContext = React.createContext();

const Select = ({ children, value, onValueChange, defaultValue, ...props }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(value || defaultValue || '');
  const selectRef = useRef(null);

  useEffect(() => {
    if (value !== undefined) {
      setSelectedValue(value);
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleValueChange = (newValue) => {
    setSelectedValue(newValue);
    onValueChange?.(newValue);
    setIsOpen(false);
  };

  return (
    <SelectContext.Provider value={{ 
      isOpen, 
      setIsOpen, 
      selectedValue, 
      handleValueChange 
    }}>
      <div ref={selectRef} className="relative" {...props}>
        {children}
      </div>
    </SelectContext.Provider>
  );
};

const SelectTrigger = React.forwardRef(({ children, className, ...props }, ref) => {
  const { isOpen, setIsOpen } = React.useContext(SelectContext);
  
  return (
    <button
      ref={ref}
      type="button"
      className={`flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      onClick={() => setIsOpen(!isOpen)}
      {...props}
    >
      {children}
      <ChevronDown className={`h-4 w-4 opacity-50 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
    </button>
  );
});

SelectTrigger.displayName = 'SelectTrigger';

const SelectValue = React.forwardRef(({ placeholder, ...props }, ref) => {
  const { selectedValue } = React.useContext(SelectContext);
  
  return (
    <span
      ref={ref}
      className="block truncate"
      {...props}
    >
      {selectedValue || placeholder}
    </span>
  );
});

SelectValue.displayName = 'SelectValue';

const SelectContent = React.forwardRef(({ children, className, ...props }, ref) => {
  const { isOpen } = React.useContext(SelectContext);
  
  if (!isOpen) return null;
  
  return (
    <div
      ref={ref}
      className={`absolute top-full left-0 z-50 w-full mt-1 bg-background border border-input rounded-md shadow-lg max-h-60 overflow-auto ${className}`}
      {...props}
    >
      {children}
    </div>
  );
});

SelectContent.displayName = 'SelectContent';

const SelectItem = React.forwardRef(({ children, className, value, ...props }, ref) => {
  const { selectedValue, handleValueChange } = React.useContext(SelectContext);
  
  return (
    <div
      ref={ref}
      className={`block w-full px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground cursor-pointer ${
        selectedValue === value ? 'bg-accent text-accent-foreground' : ''
      } ${className}`}
      onClick={() => handleValueChange(value)}
      {...props}
    >
      {children}
    </div>
  );
});

SelectItem.displayName = 'SelectItem';

export {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
};
