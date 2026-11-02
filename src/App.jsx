
import { useState, useRef, useEffect } from "react";
import "./App.css";

const layers = [
  "gramophone-base",
  "case-files",
  "cake",
  "pocket-watch",
];

const objects = [
    { id: "gramophone", name: "Gramophone", x: 71, y: 55, width: 20, height: 50},
    { id: "case-files", name: "Case Files", x: 19, y: 95, width: 16, height: 35 },
    { id: "cake", name: "Study Rewards", x: 39, y: 69, width: 14, height: 14 },
    { id: "pocket-watch", name: "Pocket Watch", x: 84, y: 88, width: 16, height: 20 },
];

const songs = [
  { title: "Bossa Nova I", artist: "alex morgan", file: "/music/bossa-1.mp3" },
  { title: "Bossa Nova II", artist: "alex morgan", file: "/music/bossa-2.mp3" },
  { title: "Bossa Nova III", artist: "andriih", file: "/music/bossa-3.mp3" },
]

function App() {
    const [active, setActive] = useState(null);
    const [currentSong, setCurrentSong] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [timerMode, setTimerMode] = useState("focus");
    const [timeLeft, setTimeLeft] = useState(25*60);
    const [timerRunning, setTimerRunning] = useState(false);
    const [studyStats, setStudyStats] = useState(() => {
      try {
        const saved = localStorage.getItem("case-1159-stats");

        return saved
          ? JSON.parse(saved)
          : {
            focusSessions: 0,
            totalMinutes: 0,
            history: [],
          };
      } catch {
        return {
          focusSessions: 0,
          totalMinutes: 0,
          history: [],
        };
      }
    });
    const [cakeSlices, setCakeSlices] = useState(() => {
      const saved = localStorage.getItem("case-1159-cake");
      return saved ? Number(saved) : 0;
    });
    const [tasks, setTasks] = useState(() =>{
      try {
        const savedTasks = localStorage.getItem("case-1159-tasks");
        return savedTasks ? JSON.parse(savedTasks) : [];
      } catch {
        return [];
      }
    });
    const [newTask, setNewTask] = useState("");
    const audioRef = useRef(null);

    useEffect(() => {
      localStorage.setItem("case-1159-tasks", JSON.stringify(tasks));
    }, [tasks]);

    useEffect(() => {
      if (!timerRunning) return;

      const interval = setInterval(() => {
        setTimeLeft((prev) => Math.max(prev - 1, 0));
      }, 1000);

      return () => clearInterval(interval);
    }, [timerRunning]);

    useEffect (() => {
      if (timeLeft === 0 && timerRunning) {
        setTimerRunning(false);

        if (timerMode === "focus") {
          setCakeSlices((prev) => prev + 1);
          recordFocusSession();
        }
      }
    }, [timeLeft, timerRunning, timerMode]);

    useEffect(() => {
      localStorage.setItem("case-1159-cake", cakeSlices);
    }, [cakeSlices]);

    useEffect(() => {
      localStorage.setItem(
        "case-1159-stats",
        JSON.stringify(studyStats)
      );
    }, [studyStats]);

    function toggleMusic() {
      const audio = audioRef.current;

      if (!audio) return;

      if (audio.paused) {
      audio.play()
        .then(() => setIsPlaying(true))
        .catch((error) => console.error("playback failed:", error));
      } else {
        audio.pause();
        setIsPlaying(false);
      }
    }

    function addTask() {
      if (!newTask.trim()) return;

      const task = {
        id: Date.now(),
        text: newTask.trim(),
        completed: false,
      };

      setTasks([...tasks, task]);
      setNewTask("");
    }

    function toggleTask(id) {
      const task = tasks.find((task) => task.id === id);
      if (!task) return;

      if (!task.completed && !task.rewarded) {
        setCakeSlices((prev) => prev + 1);
      }

      setTasks(
        tasks.map((task) =>
        task.id === id
          ? {
              ...task,
              completed: !task.completed,
              rewarded: task.rewarded || !task.completed
            }
          : task
        
        )
      );
    }

    function deleteTask(id) {
      setTasks(tasks.filter((task) => task.id !== id ))
    }

    function recordFocusSession() {
      const session = {
        id: Date.now(),
        date: new Date().toISOString(),
        duration: 25,
      };

      setStudyStats((prev) => ({
        focusSessions: prev.focusSessions + 1,
        totalMinutes: prev.totalMinutes + 25,
        history: [...prev.history, session],
      }));
    }

    function switchTimerMode(mode) {
      setTimerRunning(false);
      setTimerMode(mode);
      setTimeLeft(mode === "focus" ? 25 * 60 : 5 * 60);
    }

    function resetTimer() {
      setTimerRunning(false);
      setTimeLeft(timerMode === "focus" ? 25 * 60 : 5 * 60);
    }

    function formatTime(seconds) {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;

      return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
    }

    function getWeeklyActivity() {
      const days = [];

      for (let i=6; i >= 0; i--) {
        const date = new Date();
        date.setHours(0,0,0,0);
        date.setDate(date.getDate() - i);

        const nextDate = new Date(date);
        nextDate.setDate(nextDate.getDate() + 1);

        const sessions = studyStats.history.filter((session) => {
          const sessionDate = new Date(session.date);
          return sessionDate >= date && sessionDate < nextDate;
        });

        days.push({
          label: date.toLocaleDateString("en-US", {
            weekday: "short",
          }),
          date: date.toLocaleDateString(),
          sessions: sessions.length,
          minutes: sessions.reduce(
            (total, session) => total + session.duration,
            0
          ),
        });
      }

      return days;
    }

    const weeklyActivity = getWeeklyActivity();
    const maxMinutes = Math.max(
      25,
      ...weeklyActivity.map((day) => day.minutes)
    );
    
    return (
      <div className="app">
        <audio
          ref={audioRef}
          src={songs[currentSong].file}
          onEnded={() => setIsPlaying(false)}
        />

        <div className="room">
          <img
            src="/room/background.png"
            className="room-layer"
            alt=""
          />

          {layers.map((layer) => (
            <img
              key={layer}
              src={`/room/${layer}.png`}
              className="room-layer"
              alt=""
            />
          ))}

          <div className={`spinning-record ${isPlaying ? "playing" : ""}`}>
            <img
              src={`/room/record-${currentSong + 1}.png`}
              alt=""
            />
          </div>

          <img
            src="/room/gramophone-needle.png"
            className="room-layer gramophone-needle"
            alt=""
          />

          {objects.map((obj) => (
            <button
              key={obj.id}
              className="hotspot"
              style={{
                left: `${obj.x}%`,
                top: `${obj.y}%`,
                width: `${obj.width}%`,
                height: `${obj.height}%`,
              }}
              onClick={() => setActive(obj)}
              aria-label={`Open ${obj.name}`}
            />
          ))}
        </div>

        {active && (
          <div
            className="overlay"
            onClick={() => setActive(null)}
          >
            <div
              className="popup"
              onClick={(e) => e.stopPropagation()}
            >
              <button onClick={() => setActive(null)}>
                X
              </button>

              <h2>{active.name}</h2>

              {active.id === "gramophone" ? (
                <div>
                  <h3>Record Collection</h3>

                  {songs.map((song, index) => (
                    <button
                      key={song.file}
                      onClick={() => {
                        audioRef.current?.pause();
                        setCurrentSong(index);
                        setIsPlaying(false);
                      }}
                    >
                      {song.title} - {song.artist}
                    </button>
                  ))}

                  <p>
                    Selected: {songs[currentSong].title}
                  </p>

                  <button onClick={toggleMusic}>
                    {isPlaying ? "Pause" : "Play"}
                  </button>
                </div>
              ) : active.id === "case-files" ? (
                <div className="case-files">
                  <h3>Open Cases</h3>

                  <div>
                    <input
                      type="text"
                      placeholder="New assignment..."
                      value={newTask}
                      onChange={(e) => setNewTask(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") addTask();
                      }}
                    />
                    <button onClick={addTask}>Add Case</button>
                  </div>

                  {tasks.length === 0 ? (
                    <p>No open cases... for now.</p>
                  ) : (
                    <ul>
                      {tasks.map((task) => (
                        <li key={task.id}>
                          <input
                            type="checkbox"
                            checked={task.completed}
                            onChange={() => toggleTask(task.id)}
                          />

                          <span
                            style={{
                              textDecoration: task.completed
                                ? "line-through"
                                : "none",
                            }}
                          >
                            {task.text}
                          </span>

                          <button onClick={() => deleteTask(task.id)}>
                            x
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
            </div>
              ) : active.id === "pocket-watch" ? (
                <div className="pocket-watch">
                  <h3>Time is Ticking...</h3>

                  <div className="timer-modes">
                    <button onClick={() => switchTimerMode("focus")}>
                      Focus
                    </button>

                    <button onClick={() => switchTimerMode("break")}>
                      Short Break
                    </button>
                  </div>

                  <h1 className="timer-display">
                    {formatTime(timeLeft)}
                  </h1>

                  <div className="timer-controls">
                    <button
                      onClick={() => setTimerRunning(!timerRunning)}
                      disabled={timeLeft === 0}
                    >
                      {timerRunning ? "Pause" : "Start"}
                    </button>

                    <button onClick={resetTimer}>
                      Reset
                    </button>
                  </div>

                  <div className="study-stats">
                    <h3>Investigation Log</h3>

                    <p>Focus Sessions Completed: {studyStats.focusSessions}</p>
                    <p>Total Study Time: {studyStats.totalMinutes} minutes</p>

                    <p>
                      Last Session: {
                        studyStats.history.length > 0
                          ? new Date(
                              studyStats.history[studyStats.history.length - 1].date
                            ).toLocaleString()
                          : "no sessions recorded yet"
                      }
                    </p>

                    <div className="activity-chart">
                      {weeklyActivity.map((day) => (
                        <div className="activity-day" key={day.date}>
                          <span className="activity-minutes">
                            {day.minutes}m
                          </span>

                          <div className="activity-bar-track">
                            <div
                              className="activity-bar"
                              style={{
                                height: `${(day.minutes / maxMinutes) * 100}%`,
                              }}
                              title={`${day.sessions} sessions`}
                            />
                          </div>

                          <span className="activity-label">{day.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : active.id === "cake" ? (
                <div className="cake-rewards">
                  <h3>Sweet Rewards</h3>
                  <p> every accomplishment deserves a treat!!!</p>

                  <h1>{cakeSlices}</h1>
                  <p>Cake Slices Earned</p>
                  <p>Complete an assignment: +1 slice</p>
                  <p>Finish a focus session: +1 slice</p>
                </div>
              ) : (
                <p>Coming Soon!</p>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  export default App;

