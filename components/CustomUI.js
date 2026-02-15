import { useState } from 'react';

export const CustomCheckbox = ({ checked, onChange, label }) => (
  <label className="custom-checkbox">
    <input type="checkbox" checked={checked} onChange={onChange} />
    <span className="checkbox-box">
      <svg className="checkbox-icon" viewBox="0 0 12 10" fill="none">
        <path d="M1 5L4.5 8.5L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </span>
    {label && <span className="checkbox-label">{label}</span>}
  </label>
);

export const CustomSelect = ({ value, onChange, options, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className="custom-select">
      <button 
        className="select-trigger" 
        onClick={() => setIsOpen(!isOpen)}
        type="button"
      >
        <span>{selectedOption ? selectedOption.label : placeholder}</span>
        <svg className={`select-arrow ${isOpen ? 'open' : ''}`} width="12" height="8" viewBox="0 0 12 8" fill="none">
          <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      {isOpen && (
        <>
          <div className="select-backdrop" onClick={() => setIsOpen(false)} />
          <div className="select-dropdown">
            {options.map((option) => (
              <button
                key={option.value}
                className={`select-option ${option.value === value ? 'selected' : ''}`}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                type="button"
              >
                {option.label}
                {option.value === value && (
                  <svg width="14" height="11" viewBox="0 0 14 11" fill="none">
                    <path d="M1 5.5L5 9.5L13 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export const CustomInput = ({ type = 'text', placeholder, value, onChange, multiline = false }) => {
  if (multiline) {
    return (
      <textarea
        className="custom-input multiline"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={4}
      />
    );
  }

  return (
    <input
      type={type}
      className="custom-input"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
};

export const Button = ({ children, onClick, variant = 'primary', disabled = false, fullWidth = false, type = 'button' }) => (
  <button
    className={`custom-button ${variant} ${fullWidth ? 'full-width' : ''}`}
    onClick={onClick}
    disabled={disabled}
    type={type}
  >
    {children}
  </button>
);

export const ColorPicker = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const colors = [
    '#000000', '#ffffff', '#ef4444', '#f59e0b', '#10b981', 
    '#3b82f6', '#8b5cf6', '#ec4899', '#6366f1', '#14b8a6'
  ];

  return (
    <div className="color-picker">
      <button 
        className="color-swatch" 
        style={{ backgroundColor: value }}
        onClick={() => setIsOpen(!isOpen)}
        type="button"
      />
      {isOpen && (
        <>
          <div className="select-backdrop" onClick={() => setIsOpen(false)} />
          <div className="color-picker-dropdown">
            <div className="color-grid">
              {colors.map((color) => (
                <button
                  key={color}
                  className={`color-option ${color === value ? 'selected' : ''}`}
                  style={{ backgroundColor: color }}
                  onClick={() => {
                    onChange(color);
                    setIsOpen(false);
                  }}
                  type="button"
                />
              ))}
            </div>
            <CustomInput
              type="text"
              placeholder="#000000"
              value={value}
              onChange={onChange}
            />
          </div>
        </>
      )}
    </div>
  );
};
