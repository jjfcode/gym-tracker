import React, { useState, useRef, useEffect } from 'react';
import styles from './Select.module.css';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps {
  options: SelectOption[];
  value?: string | string[];
  onChange: (value: string | string[]) => void;
  placeholder?: string;
  multiple?: boolean;
  disabled?: boolean;
  error?: string;
  className?: string;
  searchable?: boolean;
}

const Select: React.FC<SelectProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Select an option',
  multiple = false,
  disabled = false,
  error,
  className,
  searchable = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const selectRef = useRef<HTMLDivElement>(null);

  const selectedValues = Array.isArray(value) ? value : value ? [value] : [];
  
  const filteredOptions = searchable && searchQuery
    ? options.filter(option => 
        option.label.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : options;

  const selectedLabels = selectedValues
    .map(val => options.find(opt => opt.value === val)?.label)
    .filter(Boolean);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOptionClick = (optionValue: string) => {
    if (multiple) {
      const newValues = selectedValues.includes(optionValue)
        ? selectedValues.filter(v => v !== optionValue)
        : [...selectedValues, optionValue];
      onChange(newValues);
    } else {
      onChange(optionValue);
      setIsOpen(false);
      setSearchQuery('');
    }
  };

  const handleRemoveValue = (valueToRemove: string, event: React.MouseEvent) => {
    event.stopPropagation();
    if (multiple) {
      onChange(selectedValues.filter(v => v !== valueToRemove));
    } else {
      onChange('');
    }
  };

  return (
    <div className={`${styles.select} ${className || ''}`} ref={selectRef}>
      <div
        className={`${styles.trigger} ${isOpen ? styles.open : ''} ${disabled ? styles.disabled : ''} ${error ? styles.error : ''}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <div className={styles.value}>
          {selectedLabels.length > 0 ? (
            multiple ? (
              <div className={styles.multiValue}>
                {selectedLabels.map((label, index) => (
                  <span key={selectedValues[index]} className={styles.tag}>
                    {label}
                    <button
                      type="button"
                      className={styles.removeTag}
                      onClick={(e) => handleRemoveValue(selectedValues[index], e)}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            ) : (
              selectedLabels[0]
            )
          ) : (
            <span className={styles.placeholder}>{placeholder}</span>
          )}
        </div>
        <div className={styles.arrow}>
          <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
            <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>

      {isOpen && (
        <div className={styles.dropdown}>
          {searchable && (
            <div className={styles.search}>
              <input
                type="text"
                placeholder="Search options..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.searchInput}
                autoFocus
              />
            </div>
          )}
          <div className={styles.options}>
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <div
                  key={option.value}
                  className={`${styles.option} ${
                    selectedValues.includes(option.value) ? styles.selected : ''
                  } ${option.disabled ? styles.disabled : ''}`}
                  onClick={() => !option.disabled && handleOptionClick(option.value)}
                >
                  {multiple && (
                    <input
                      type="checkbox"
                      checked={selectedValues.includes(option.value)}
                      onChange={() => {}}
                      className={styles.checkbox}
                    />
                  )}
                  {option.label}
                </div>
              ))
            ) : (
              <div className={styles.noOptions}>No options found</div>
            )}
          </div>
        </div>
      )}

      {error && <div className={styles.errorMessage}>{error}</div>}
    </div>
  );
};

export default Select;