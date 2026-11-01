
import { useState } from "react";
import "./App.css";

const objects = [
    { id: "gramophone", name: "Gramophone", x: 30, y: 55 },
    { id: "notebook", name: "Case Files", x: 55, y: 65 },
    { id: "clock", name: "Pocket Watch", x: 75, y: 45 },
    { id: "bookshelf", name: "Bookshelf", x: 10, y: 25 },
];

function App() {
    const [active, setActive] = useState(null);

    return (
        <div className="app">
        <div className="room">
            {objects.map((obj) => (
            <button
                key={obj.id}
                className="object"
                style={{
                left: `${obj.x}%`,
                top: `${obj.y}%`,
                }}
                onClick={() => setActive(obj)}
            >
                {obj.name}
            </button>
            ))}
        </div>

        {active && (
            <div className="overlay" onClick={() => setActive(null)}>
            <div
                className="popup"
                onClick={(e) => e.stopPropagation()}
            >
                <button onClick={() => setActive(null)}>X</button>
                <h2>{active.name}</h2>
                <p>Coming soon!</p>
            </div>
            </div>
        )}
        </div>
    );
}

export default App;
