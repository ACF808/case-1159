
import { useState, useRef } from "react";
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
    const audioRef = useRef(null);

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
              ) : (
                <p>Coming soon!</p>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  export default App;
