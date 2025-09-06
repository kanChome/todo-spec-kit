import { memo } from 'react';
import type { Task } from '@/lib/task-manager/types';
import { TaskItem } from '../TaskItem/TaskItem';
import styles from './TaskList.module.css';

interface TaskListProps {
  tasks: Task[];
  onToggleTask: (id: string) => void;
  onUpdateTask: (id: string, description: string) => void;
  onDeleteTask: (id: string) => void;
  loading?: boolean;
  disabled?: boolean;
  emptyMessage?: string;
}

export const TaskList = memo(function TaskList({
  tasks,
  onToggleTask,
  onUpdateTask,
  onDeleteTask,
  loading = false,
  disabled = false,
  emptyMessage = "No tasks yet. Add your first task above!"
}: TaskListProps) {
  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading} role="status" aria-label="Loading tasks">
          <div className={styles.loadingSpinner} aria-hidden="true"></div>
          <span className={styles.loadingText}>Loading tasks...</span>
        </div>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.empty}>
          <div className={styles.emptyIcon} aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" className={styles.emptyIconSvg}>
              <path
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h2 className={styles.emptyTitle}>No tasks yet</h2>
          <p className={styles.emptyMessage}>{emptyMessage}</p>
        </div>
      </div>
    );
  }

  const completedTasks = tasks.filter(task => task.completed);
  const incompleteTasks = tasks.filter(task => !task.completed);
  
  return (
    <div className={styles.container}>
      {incompleteTasks.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            Active Tasks ({incompleteTasks.length})
          </h2>
          <ul className={styles.taskList} role="list">
            {incompleteTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onToggle={onToggleTask}
                onUpdate={onUpdateTask}
                onDelete={onDeleteTask}
                disabled={disabled}
              />
            ))}
          </ul>
        </section>
      )}

      {completedTasks.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            Completed Tasks ({completedTasks.length})
          </h2>
          <ul className={styles.taskList} role="list">
            {completedTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onToggle={onToggleTask}
                onUpdate={onUpdateTask}
                onDelete={onDeleteTask}
                disabled={disabled}
              />
            ))}
          </ul>
        </section>
      )}

      {tasks.length > 0 && (
        <div className={styles.summary} role="region" aria-label="Task summary">
          <div className={styles.stats}>
            <span className={styles.stat}>
              <strong>{tasks.length}</strong> total
            </span>
            <span className={styles.stat}>
              <strong>{completedTasks.length}</strong> completed
            </span>
            <span className={styles.stat}>
              <strong>{incompleteTasks.length}</strong> remaining
            </span>
          </div>
          
          {completedTasks.length > 0 && (
            <div className={styles.progress}>
              <div className={styles.progressBar}>
                <div 
                  className={styles.progressFill}
                  style={{ width: `${Math.round((completedTasks.length / tasks.length) * 100)}%` }}
                  role="progressbar"
                  aria-valuenow={completedTasks.length}
                  aria-valuemin={0}
                  aria-valuemax={tasks.length}
                  aria-label={`${completedTasks.length} out of ${tasks.length} tasks completed`}
                />
              </div>
              <span className={styles.progressText}>
                {Math.round((completedTasks.length / tasks.length) * 100)}% complete
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
});