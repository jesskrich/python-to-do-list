import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch tasks from Flask backend
  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/tasks');
      if (!response.ok) {
        throw new Error('Failed to fetch tasks');
      }
      const data = await response.json();
      setTasks(data.tasks || []);
      setError('');
    } catch (err) {
      setError('Error loading tasks: ' + err.message);
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  // Add a new task
  const addTask = async (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;

    try {
      setLoading(true);
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ task: newTask.trim() }),
      });

      if (!response.ok) {
        throw new Error('Failed to add task');
      }

      setNewTask('');
      await fetchTasks(); // Refresh the task list
      setError('');
    } catch (err) {
      setError('Error adding task: ' + err.message);
      console.error('Error adding task:', err);
    } finally {
      setLoading(false);
    }
  };

  // Delete a task
  const deleteTask = async (taskId) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete task');
      }

      await fetchTasks(); // Refresh the task list
      setError('');
    } catch (err) {
      setError('Error deleting task: ' + err.message);
      console.error('Error deleting task:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load tasks when component mounts
  useEffect(() => {
    fetchTasks();
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>📋 My To-Do List</h1>
      </header>

      <main className="App-main">
        {/* Add Task Form */}
        <form onSubmit={addTask} className="add-task-form">
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="Enter a new task..."
            className="task-input"
            disabled={loading}
          />
          <button type="submit" className="add-button" disabled={loading || !newTask.trim()}>
            {loading ? '⏳' : '➕'} Add Task
          </button>
        </form>

        {/* Error Message */}
        {error && (
          <div className="error-message">
            ❌ {error}
          </div>
        )}

        {/* Loading Indicator */}
        {loading && (
          <div className="loading">
            ⏳ Loading...
          </div>
        )}

        {/* Task List */}
        <div className="task-list">
          {tasks.length === 0 && !loading ? (
            <div className="no-tasks">
              🎉 No tasks yet! Add one above to get started.
            </div>
          ) : (
            tasks.map((task, index) => (
              <div key={task.id || index} className="task-item">
                <span className="task-text">{task.task}</span>
                <button
                  onClick={() => deleteTask(task.id)}
                  className="delete-button"
                  disabled={loading}
                  title="Delete task"
                >
                  🗑️
                </button>
              </div>
            ))
          )}
        </div>

        {/* Task Count */}
        {tasks.length > 0 && (
          <div className="task-count">
            📊 Total tasks: {tasks.length}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
