/**
 * International phone input - E.164 output
 * Uses react-phone-number-input (country selector + flag, validation)
 * value/onChange are in E.164 format (e.g. +201234567890)
 */
import React from 'react';
import PhoneInputLib from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

const PhoneInput = ({
  value,
  onChange,
  placeholder = 'Enter phone number',
  defaultCountry = 'EG',
  className = '',
  disabled,
  id,
  ...rest
}) => {
  return (
    <PhoneInputLib
      international
      defaultCountry={defaultCountry}
      value={value || ''}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      id={id}
      className={`phone-input-wrapper ${className}`}
      numberInputProps={{
        className: 'phone-input-number',
        'data-testid': id
      }}
      countrySelectProps={{ className: 'phone-input-country' }}
      {...rest}
    />
  );
};

export default PhoneInput;
