import React, { useState, useEffect } from "react";
import { ch_join, ch_push, ch_reset } from "./socket";
import "../css/bulls.scss";

function Bulls() {
  const [state, setState] = useState({
    secret: "",
    guesses: [],
    warning_str: "",
    lives: 8,
    won: false,
  });

  const [text, setText] = useState("");

  let { secret, guesses, warning_str, lives, won } = state;

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

  if (lives == 0) {
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
