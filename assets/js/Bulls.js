import React, { useState, useEffect } from "react";
import { ch_join, ch_push, ch_reset } from "./socket";
import "../css/bulls.scss";

function JoinGame({userName, setUserName}) {
  const [gameName, setGameName] = useState("");

  return (
    <div className="row">
      <div className="column">
        <input type="text"
               value={gameName}
               onChange={(ev) => setGameName(ev.target.value)} />
        <input type="text"
               value={userName}
               onChange={(ev) => setUserName(ev.target.value)} />
      </div>
      <div className="column">
      {/* //onClick={() => ch_login(gameName, userName)}> */}
        <button onClick={()=>console.log(gameName, userName)}>
          Join Game
        </button>
      </div>
    </div>
  );
}

function Bulls() {
  const [state, setState] = useState({
    gameName: "",
    users: [],
    secret: "",
    guesses: [],
    warning_str: "",
    lives: 8,
    won: false,
  });

  const [userName, setUserName] = useState("")
  const [text, setText] = useState("");

  let { gameName, users, secret, guesses, warning_str, lives, won } = state;

  useEffect(() => {
    ch_join(setState);
  });

  function reset() {
    ch_reset();
  }

  function updateText(ev) {
    setText(ev.target.value);
    console.log(text);
  }

  function keyPress(ev) {
    if (ev.key == "Enter") {
      guess();
    }
  }

  function guess() {
    // Inner function isn't a render function
    ch_push({ guess_digits: text });
    setText("");
  }

  function GameOver() {
    return (
      <div>
        <h2>Game Over!</h2>
        <p>{won ? "You Won" : "You Lost"}</p>
        <button className="button" onClick={reset}>
          Reset Game
        </button>
      </div>
    );
  }

  let body = null;

  if (!gameName){
    body = <JoinGame userName={userName} setUserName={setUserName}/>;
  }

  else if (lives == 0) {
    body = <GameOver />;
  } else {
    body = (
      <div className="row">
        <div className="column">
          <h2>Four Digits Game</h2>
          <input
            id="input-box"
            type="text"
            onKeyPress={keyPress}
            onChange={updateText}
            value={text}
          />
          <div className="row">
            <button className="button" onClick={reset}>
              Reset Game
            </button>
            <button className="button" onClick={guess}>
              Guess
            </button>
          </div>
          <p className="warning">{warning_str}</p>
        </div>

        <div className="column">
          <h2>Guesses</h2>
          <ol className="guesses">
            {guesses.map((value, index) => {
              return <li key={index}>{value}</li>;
            })}
          </ol>
        </div>
      </div>
    );
  }

  return <div className="container">{body}</div>;
}

export default Bulls;
