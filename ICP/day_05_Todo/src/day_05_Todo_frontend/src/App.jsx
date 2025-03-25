import { useState, useEffect } from 'react';
import { AuthClient } from '@dfinity/auth-client';
import { Actor, HttpAgent } from '@dfinity/agent';
import { idlFactory, canisterId } from '../../declarations/day_05_Todo_backend';

export default function TodoApp() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [actor, setActor] = useState(null);

  // Initialize auth client on mount
  useEffect(() => {
    async function initAuth() {
      try {
        const authClient = await AuthClient.create();
        if (await authClient.isAuthenticated()) {
          await handleAuthenticatedUser(authClient);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      }
    }
    initAuth();
  }, []);

  async function handleAuthenticatedUser(authClient) {
    try {
      const identity = authClient.getIdentity();
      const agent = new HttpAgent({ 
        host: 'http://ic0.app', 
    });
      
    
        await agent.fetchRootKey();
      

      const actorInstance = Actor.createActor(idlFactory, {
        agent,
        canisterId: canisterId
      });
      
      setActor(actorInstance);
      setIsAuthenticated(true);
      await fetchTasks(actorInstance);
    } catch (error) {
      console.error('Actor initialization error:', error);
      logout();
    }
  }

  async function authenticate() {
    try {
      const authClient = await AuthClient.create();
      const identityProvider = `https://identity.internetcomputer.org`;
        
      await authClient.login({
        identityProvider,
        onSuccess: async () => {
          await handleAuthenticatedUser(authClient);
        },
        onError: (error) => {
          console.error('Login failed:', error);
        }
      });
    } catch (error) {
      console.error('Authentication error:', error);
    }
  }

  async function logout() {
    const authClient = await AuthClient.create();
    await authClient.logout();
    setIsAuthenticated(false);
    setActor(null);
    setTasks([]);
  }

  async function fetchTasks(actorInstance) {
    try {
      const fetchedTasks = await actorInstance.list_tasks();
      setTasks(fetchedTasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  }

  async function addTask() {
    if (!actor) return;
    try {
      await actor.add_task(title, description);
      setTitle('');
      setDescription('');
      fetchTasks(actor);
    } catch (error) {
      console.error('Error adding task:', error);
    }
  }

  return (
    <div className="todo-container">
      {!isAuthenticated ? (
        <button className="auth-button" onClick={authenticate}>
          Connect with Internet Identity
        </button>
      ) : (
        <div className="app-content">
          <div className="header-row">
            <h1 className="app-title">To-Do List</h1>
            <button className="logout-button" onClick={logout}>
              Logout
            </button>
          </div>
          <div className="app-content">
          <h1 className="app-title">To-Do List</h1>
          <div className="input-group">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task Title"
              className="task-input"
            />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Task Description"
              className="task-input task-description"
            />
            <button className="add-button" onClick={addTask}>
              Add Task
            </button>
          </div>
          <ul className="task-list">
            {tasks.map((task) => (
              <li key={task.id} className="task-item">
                <strong className="task-title">{task.title}</strong>
                <span className="task-description">{task.description}</span>
                {task.completed && <span className="task-completed">✔️</span>}
              </li>
            ))}
          </ul>
        </div>
        </div>
      )}
    </div>
  );
}