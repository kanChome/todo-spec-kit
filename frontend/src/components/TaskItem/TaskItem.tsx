import React, { useState, useCallback, useRef, useEffect, KeyboardEvent } from 'react';
import type { Task } from '@/lib/task-manager/types';
import styles from './TaskItem.module.css';

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onUpdate: (id: string, description: string) => void;
  onDelete: (id: string) => void;
  disabled?: boolean;
}

export function TaskItem({ task, onToggle, onUpdate, onDelete, disabled = false }: TaskItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(task.description);
  const [isHovered, setIsHovered] = useState(false);
  const [isOperating, setIsOperating] = useState(false);
  const editInputRef = useRef<HTMLInputElement>(null);

  const handleToggle = useCallback(() => {
    if (!disabled && !isOperating) {
      setIsOperating(true);
      onToggle(task.id);
      setTimeout(() => setIsOperating(false), 100);
    }
  }, [task.id, onToggle, disabled, isOperating]);

  const handleDelete = useCallback(() => {
    if (!disabled && !isOperating) {
      setIsOperating(true);
      onDelete(task.id);
      setTimeout(() => setIsOperating(false), 100);
    }
  }, [task.id, onDelete, disabled, isOperating]);

  const startEditing = useCallback(() => {
    if (!disabled) {
      setIsEditing(true);
      setEditValue(task.description);
    }
  }, [task.description, disabled]);

  const cancelEditing = useCallback(() => {
    setIsEditing(false);
    setEditValue(task.description);
  }, [task.description]);

  const saveEdit = useCallback(() => {
    const trimmedValue = editValue.trim();
    
    if (trimmedValue.length === 0) {
      // Show error or revert to original
      cancelEditing();
      return;
    }

    if (trimmedValue !== task.description) {
      onUpdate(task.id, trimmedValue);
    }
    
    setIsEditing(false);
  }, [editValue, task.id, task.description, onUpdate, cancelEditing]);

  const handleEditKeyDown = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      saveEdit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      cancelEditing();
    }
  }, [saveEdit, cancelEditing]);

  const handleEditBlur = useCallback(() => {
    saveEdit();
  }, [saveEdit]);

  const handleEditChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (newValue.length <= 100) {
      setEditValue(newValue);
    }
  }, []);

  // Focus edit input when editing starts
  useEffect(() => {
    if (isEditing && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [isEditing]);

  return (
    <li 
      className={`${styles.taskItem} ${task.completed ? styles.completed : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={styles.content}>
        <label className={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={task.completed}
            onChange={handleToggle}
            disabled={disabled}
            className={styles.checkbox}
            aria-label={`Mark "${task.description}" as ${task.completed ? 'incomplete' : 'complete'}`}
          />
          <span className={styles.checkboxCustom} aria-hidden="true">
            {task.completed && (
              <svg className={styles.checkIcon} viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
          </span>
        </label>

        <div className={styles.description}>
          {isEditing ? (
            <input
              ref={editInputRef}
              type="text"
              value={editValue}
              onChange={handleEditChange}
              onKeyDown={handleEditKeyDown}
              onBlur={handleEditBlur}
              className={styles.editInput}
              maxLength={100}
              aria-label="Edit task description"
            />
          ) : (
            <span
              className={`${styles.descriptionText} ${task.completed ? styles.completedText : ''}`}
              onDoubleClick={startEditing}
              tabIndex={0}
              role="button"
              aria-label="Double-click to edit task"
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  startEditing();
                }
              }}
            >
              {task.description}
            </span>
          )}
        </div>

        {(isHovered || isEditing) && !isEditing && (
          <button
            onClick={handleDelete}
            disabled={disabled}
            className={styles.deleteButton}
            aria-label={`Delete "${task.description}"`}
            type="button"
          >
            <svg className={styles.deleteIcon} viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>

      <div className={styles.metadata}>
        <time className={styles.timestamp} dateTime={task.createdAt}>
          {new Date(task.createdAt).toLocaleDateString()}
        </time>
        {task.updatedAt !== task.createdAt && (
          <span className={styles.updated} title={`Updated: ${new Date(task.updatedAt).toLocaleString()}`}>
            •
          </span>
        )}
      </div>
    </li>
  );
}