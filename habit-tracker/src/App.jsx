import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [habits, setHabits] = useState(() => {
    const savedHabits = localStorage.getItem("habits");

    return savedHabits ? JSON.parse(savedHabits) : [];
  });

  const [habitText, setHabitText] = useState("");

  useEffect(() => {
    localStorage.setItem("habits", JSON.stringify(habits));
  }, [habits]);

  const addHabit = (e) => {
    e.preventDefault();

    if (!habitText.trim()) return;

    const newHabit = {
      id: Date.now(),
      name: habitText.trim(),
      completed: false,
    };

    setHabits((currentHabits) => [
      ...currentHabits,
      newHabit,
    ]);

    setHabitText("");
  };

  const toggleHabit = (id) => {
    setHabits((currentHabits) =>
      currentHabits.map((habit) =>
        habit.id === id
          ? { ...habit, completed: !habit.completed }
          : habit
      )
    );
  };

  const deleteHabit = (id) => {
    setHabits((currentHabits) =>
      currentHabits.filter((habit) => habit.id !== id)
    );
  };

  const completedCount = habits.filter(
    (habit) => habit.completed
  ).length;

  return (
    <div className="app">

      <h1>Daily Habit Tracker</h1>

      <p className="date">
        {new Date().toDateString()}
      </p>

      <form onSubmit={addHabit} className="habit-form">

        <input
          type="text"
          value={habitText}
          onChange={(e) => setHabitText(e.target.value)}
          placeholder="Enter a habit"
        />

        <button type="submit">
          Add Habit
        </button>

      </form>

      <div className="progress">
        Completed: {completedCount} / {habits.length}
      </div>

      {habits.length === 0 ? (
        <p className="empty">
          No habits added yet.
        </p>
      ) : (
        <ul className="habit-list">

          {habits.map((habit) => (

            <li key={habit.id} className="habit">

              <label>

                <input
                  type="checkbox"
                  checked={habit.completed}
                  onChange={() => toggleHabit(habit.id)}
                />

                <span
                  className={
                    habit.completed ? "completed" : ""
                  }
                >
                  {habit.name}
                </span>

              </label>

              <button
                className="delete"
                onClick={() => deleteHabit(habit.id)}
              >
                Delete
              </button>

            </li>

          ))}

        </ul>
      )}

    </div>
  );
}

export default App;