import React, { useCallback } from 'react';
import { TaskInput } from '@/components/TaskInput/TaskInput';
import { TaskList } from '@/components/TaskList/TaskList';
import { useTasks } from '@/hooks/useTasks';
import styles from './App.module.css';

function App() {
  const {
    tasks,
    loading,
    error,
    createNewTask,
    updateExistingTask,
    deleteExistingTask,
    toggleTaskCompletion,
    clearError
  } = useTasks();

  const handleAddTask = useCallback(async (description: string): Promise<boolean> => {
    const result = await createNewTask(description);
    return result !== null;
  }, [createNewTask]);

  const handleToggleTask = useCallback((id: string) => {
    toggleTaskCompletion(id);
  }, [toggleTaskCompletion]);

  const handleUpdateTask = useCallback((id: string, description: string) => {
    updateExistingTask(id, { description });
  }, [updateExistingTask]);

  const handleDeleteTask = useCallback((id: string) => {
    deleteExistingTask(id);
  }, [deleteExistingTask]);

  return (
    <div className={styles.app}>
      <div className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>ToDo</h1>
          <p className={styles.subtitle}>
            Stay organized and get things done
          </p>
        </header>

        <main className={styles.main}>
          <TaskInput
            onAddTask={handleAddTask}
            disabled={loading}
            error={error}
            onErrorClear={clearError}
          />

          <TaskList
            tasks={tasks}
            onToggleTask={handleToggleTask}
            onUpdateTask={handleUpdateTask}
            onDeleteTask={handleDeleteTask}
            loading={loading}
            disabled={loading}
          />
        </main>

        <footer className={styles.footer}>
          <p className={styles.footerText}>
            Double-click a task to edit • Hover to delete
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;