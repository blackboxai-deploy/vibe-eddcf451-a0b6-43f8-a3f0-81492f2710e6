"use client";

import { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "todos-v1";

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export default function Page() {
  const [todos, setTodos] = useState([]);
  const [text, setText] = useState("");
  const [filter, setFilter] = useState("all"); // all | active | completed

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setTodos(parsed);
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
    } catch {}
  }, [todos]);

  const remaining = useMemo(() => todos.filter(t => !t.done).length, [todos]);

  const filtered = useMemo(() => {
    if (filter === "active") return todos.filter(t => !t.done);
    if (filter === "completed") return todos.filter(t => t.done);
    return todos;
  }, [todos, filter]);

  function addTodo(e) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    setTodos(prev => [
      { id: uid(), text: trimmed, done: false, createdAt: Date.now() },
      ...prev
    ]);
    setText("");
  }

  function toggleTodo(id) {
    setTodos(prev => prev.map(t => (t.id === id ? { ...t, done: !t.done } : t)));
  }

  function removeTodo(id) {
    setTodos(prev => prev.filter(t => t.id !== id));
  }

  function clearCompleted() {
    setTodos(prev => prev.filter(t => !t.done));
  }

  function startEdit(id) {
    setTodos(prev => prev.map(t => (t.id === id ? { ...t, editing: true } : t)));
  }

  function commitEdit(id, newText) {
    const trimmed = newText.trim();
    if (!trimmed) {
      removeTodo(id);
      return;
    }
    setTodos(prev => prev.map(t => (t.id === id ? { ...t, text: trimmed, editing: false } : t)));
  }

  function cancelEdit(id) {
    setTodos(prev => prev.map(t => (t.id === id ? { ...t, editing: false } : t)));
  }

  return (
    <div className="card">
      <form onSubmit={addTodo} className="addRow">
        <input
          aria-label="Add todo"
          placeholder="What needs to be done?"
          value={text}
          onChange={e => setText(e.target.value)}
          className="input"
        />
        <button type="submit" className="button primary">Add</button>
      </form>

      <div className="toolbar">
        <div className="filters">
          <button
            className={"chip" + (filter === "all" ? " active" : "")}
            onClick={() => setFilter("all")}
          >All</button>
          <button
            className={"chip" + (filter === "active" ? " active" : "")}
            onClick={() => setFilter("active")}
          >Active</button>
          <button
            className={"chip" + (filter === "completed" ? " active" : "")}
            onClick={() => setFilter("completed")}
          >Completed</button>
        </div>
        <div className="meta">
          <span>{remaining} left</span>
          <button className="link" onClick={clearCompleted}>Clear completed</button>
        </div>
      </div>

      <ul className="list">
        {filtered.length === 0 && (
          <li className="empty">No items</li>
        )}
        {filtered.map(t => (
          <li key={t.id} className="item">
            <label className="left">
              <input
                type="checkbox"
                checked={!!t.done}
                onChange={() => toggleTodo(t.id)}
              />
              {t.editing ? (
                <EditField
                  initial={t.text}
                  onCancel={() => cancelEdit(t.id)}
                  onCommit={val => commitEdit(t.id, val)}
                />
              ) : (
                <span className={"text" + (t.done ? " done" : "")}>{t.text}</span>
              )}
            </label>
            <div className="actions">
              {!t.editing && (
                <button className="icon" onClick={() => startEdit(t.id)} aria-label="Edit">✏️</button>
              )}
              <button className="icon danger" onClick={() => removeTodo(t.id)} aria-label="Delete">🗑️</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function EditField({ initial, onCommit, onCancel }) {
  const [val, setVal] = useState(initial);
  useEffect(() => setVal(initial), [initial]);

  function commit() {
    onCommit(val);
  }

  return (
    <span className="editWrapper">
      <input
        className="input inline"
        value={val}
        onChange={e => setVal(e.target.value)}
        onKeyDown={e => {
          if (e.key === "Enter") commit();
          if (e.key === "Escape") onCancel();
        }}
        autoFocus
      />
      <button className="button small" onClick={commit}>Save</button>
      <button className="button small ghost" onClick={onCancel}>Cancel</button>
    </span>
  );
}
