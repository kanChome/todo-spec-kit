import React, { useState, useCallback, useRef, useEffect } from 'react';
import styles from './TaskInput.module.css';

interface TaskInputProps {
  onAddTask: (description: string) => Promise<boolean>;
  disabled?: boolean;
  placeholder?: string;
  maxLength?: number;
  error?: string | null;
  onErrorClear?: () => void;
}

export function TaskInput({ 
  onAddTask, 
  disabled = false, 
  placeholder = "What needs to be done?",
  maxLength = 100,
  error,
  onErrorClear
}: TaskInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const remainingChars = maxLength - inputValue.length;
  const isNearLimit = remainingChars <= 10;
  const isAtLimit = remainingChars === 0;

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    
    // Enforce character limit
    if (newValue.length <= maxLength) {
      setInputValue(newValue);
      
      // Clear error when user starts typing
      if (error && onErrorClear) {
        onErrorClear();
      }
    }
  }, [maxLength, error, onErrorClear]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedValue = inputValue.trim();
    if (!trimmedValue || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const success = await onAddTask(trimmedValue);
      if (success) {
        setInputValue('');
        inputRef.current?.focus();
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [inputValue, onAddTask, isSubmitting]);

  const isAddDisabled = disabled || isSubmitting || inputValue.trim().length === 0;

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.inputContainer}>
        <label htmlFor="task-input" className={styles.label}>
          {placeholder}
        </label>
        <input
          ref={inputRef}
          id="task-input"
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder={placeholder}
          disabled={disabled || isSubmitting}
          maxLength={maxLength}
          className={`${styles.input} ${error ? styles.inputError : ''}`}
          aria-describedby={error ? 'input-error' : 'char-counter'}
          aria-invalid={!!error}
        />
        
        <button
          type="submit"
          disabled={isAddDisabled}
          className={`${styles.button} ${isAddDisabled ? styles.buttonDisabled : ''}`}
          aria-label="Add task"
        >
          {isSubmitting ? 'Adding...' : 'Add Task'}
        </button>
      </div>

      <div className={styles.feedback}>
        <div 
          id="char-counter"
          className={`${styles.counter} ${
            isAtLimit ? styles.error : isNearLimit ? styles.warning : styles.normal
          }`}
        >
          {remainingChars} characters remaining
        </div>
        
        {error && (
          <div id="input-error" className={styles.errorMessage} role="alert">
            {error}
          </div>
        )}
      </div>
    </form>
  );
}