import { useState } from 'react';
import Editor from '@monaco-editor/react';

export const MonacoEditor = ({ language = 'javascript', value, onChange, theme = 'vs-dark', height = '400px' }) => {
  return (
    <div className="monaco-editor-wrapper">
      <Editor
        height={height}
        language={language}
        value={value}
        onChange={onChange}
        theme={theme}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          fontFamily: "'Fira Code', 'Consolas', monospace",
          wordWrap: 'on',
          automaticLayout: true,
          tabSize: 2,
          padding: { top: 16, bottom: 16 }
        }}
      />
    </div>
  );
};

export const CustomLanguageEditor = ({ language = 'simple', value, onChange, height = '300px' }) => {
  // Simple custom language syntax for bot commands
  if (language === 'simple') {
    return (
      <textarea
        className="simple-code-editor"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ height }}
        placeholder={`# Simple Bot Command Language
# Examples:
# IF user.role = admin THEN send "Admin only!"
# IF message.content CONTAINS "hello" THEN react "👋"
# IF user.id = 123456 NOT IN whitelist THEN timeout 3600
# AND conditions: IF (x AND y) THEN action
# Python: python|print("hello")
# JS: javascript|console.log("hello")`}
      />
    );
  }
  return <MonacoEditor language={language} value={value} onChange={onChange} height={height} theme="vs-dark" />;
};

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
  const [searchTerm, setSearchTerm] = useState('');
  const selectedOption = options.find(opt => opt.value === value);
  
  const filteredOptions = options.filter(opt =>
    opt.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            <input
              type="text"
              className="select-search"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              autoFocus
            />
            <div className="select-options-list">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => (
                  <button
                    key={option.value}
                    className={`select-option ${option.value === value ? 'selected' : ''}`}
                    onClick={() => {
                      onChange(option.value);
                      setIsOpen(false);
                      setSearchTerm('');
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
                ))
              ) : (
                <div className="select-no-results">No results found</div>
              )}
            </div>
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
  const [colorMode, setColorMode] = useState('preset'); // 'preset' or 'custom'
  const colors = [
    '#000000', '#ffffff', '#ef4444', '#f59e0b', '#10b981', 
    '#3b82f6', '#8b5cf6', '#ec4899', '#6366f1', '#14b8a6',
    '#06b6d4', '#f97316', '#84cc16', '#a855f7', '#f43f5e'
  ];

  const handleCanvasClick = (e) => {
    const canvas = e.currentTarget;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const radius = Math.min(rect.width, rect.height) / 2;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const angle = Math.atan2(y - centerY, x - centerX);
    const distance = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
    
    if (distance > radius) return;
    
    // Convert angle and distance to HSL
    const hue = ((angle + Math.PI) / (2 * Math.PI)) * 360;
    const saturation = (distance / radius) * 100;
    const lightness = 50;
    
    const hex = hslToHex(hue, saturation, lightness);
    onChange(hex);
  };

  const hslToHex = (h, s, l) => {
    s /= 100;
    l /= 100;
    const a = s * Math.min(l, 1 - l);
    const f = (n) => {
      const k = (n + h / 30) % 12;
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
  };

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
            <div className="color-picker-modes">
              <button
                className={`mode-btn ${colorMode === 'preset' ? 'active' : ''}`}
                onClick={() => setColorMode('preset')}
                type="button"
              >
                Presets
              </button>
              <button
                className={`mode-btn ${colorMode === 'custom' ? 'active' : ''}`}
                onClick={() => setColorMode('custom')}
                type="button"
              >
                Custom
              </button>
            </div>

            {colorMode === 'preset' ? (
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
                    title={color}
                  />
                ))}
              </div>
            ) : (
              <div className="color-picker-custom">
                <canvas
                  width={200}
                  height={200}
                  className="color-wheel"
                  onClick={handleCanvasClick}
                  ref={(canvas) => {
                    if (canvas) {
                      const ctx = canvas.getContext('2d');
                      const centerX = canvas.width / 2;
                      const centerY = canvas.height / 2;
                      const radius = Math.min(canvas.width, canvas.height) / 2 - 5;
                      
                      // Draw color wheel
                      for (let angle = 0; angle < 360; angle += 1) {
                        for (let r = 0; r < radius; r++) {
                          const hue = angle;
                          const saturation = (r / radius) * 100;
                          const hex = hslToHex(hue, saturation, 50);
                          ctx.fillStyle = hex;
                          const rad = (angle * Math.PI) / 180;
                          const x = centerX + r * Math.cos(rad);
                          const y = centerY + r * Math.sin(rad);
                          ctx.fillRect(x, y, 2, 2);
                        }
                      }
                      
                      // Draw current selection marker
                      const canvas2d = canvas.getBoundingClientRect();
                    }
                  }}
                />
              </div>
            )}
            
            <div className="color-input-wrapper">
              <label>HEX Code</label>
              <CustomInput
                type="text"
                placeholder="#000000"
                value={value}
                onChange={onChange}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};
