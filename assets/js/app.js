// We need to import the CSS so that webpack will load it.
// The MiniCssExtractPlugin is used to separate it out into
// its own CSS file.
import "../css/app.scss"

// webpack automatically bundles all modules in your
// entry points. Those entry points can be configured
// in "webpack.config.js".
//
// Import deps with the dep name or local files with a relative path, for example:
//
//     import {Socket} from "phoenix"
//     import socket from "./socket"
//
import "phoenix_html"

import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import Bulls from './Bulls';

function App() {
    const [state, setState] = useState({
        secret: 0,
        guesses: [],
    })

    const [secret, setSecret] = useState(1234);
    const [guesses, setGuesses] = useState([]);
    const [text, setText] = useState("");
    const [lives, setLives] = useState(8);
    const [message, setMessage] = useState("Game over, you lost");
    const [lastGuessInvalid, setLastGuessInvalid] = useState(false);
  
    // called each time the user guesses to check if they won or
    // ran out of lives
    function check_game_over(text) {
      if (text == secret) {
        setMessage("You Won!");
        setLives(0);
      } else {
        setLives(lives - 1);
      }
    }
  
    // called when a user hits enter or selects the guess button
    // first validates the guess and then adds it to guess list
    function guess(ev) {
      let valid_guess = validateGuess(text);
      setText("");
      if (valid_guess) {
        let ng = guesses.concat(text);
        console.log("ng", ng);
        setLastGuessInvalid(false);
        setGuesses(ng);
        check_game_over(text);
      } else {
        console.log("invalid guess");
        setLastGuessInvalid(true);
      }
    }
  
    // ensures that a guess is 4 unique digits and has not been
    // already guessed
    function validateGuess(guess) {
      if (guesses.includes(guess)) {
        return false;
      }
      let valid_guess_digit = new Set([
        "0",
        "1",
        "2",
        "3",
        "4",
        "5",
        "6",
        "7",
        "8",
        "9",
      ]);
      let used_digits = new Set();
      if (guess.length == 4) {
        for (let i = 0; i < guess.length; i++) {
          if (valid_guess_digit.has(guess[i]) && !used_digits.has(guess[i])) {
            used_digits.add(guess[i]);
          } else {
            return false;
          }
        }
      } else {
        return false;
      }
  
      return true;
    }
  
    function keyPress(ev) {
      if (ev.key == "Enter") {
        guess(ev);
      }
    }
  
    function updateText(ev) {
      setText(ev.target.value);
      console.log(text);
    }
  
    // resets the game back to an initial state
    function reset() {
      setVal();
      setGuesses([]);
      setLives(8);
      setMessage("Game over, you lost");
    }
  
    function setVal() {
      let val = "";
      let digitSet = new Set();
      while (val.length < 4) {
        let digit = Math.floor(Math.random() * 10);
        if (!digitSet.has(digit)) {
          digitSet.add(digit);
          val = val + digit;
        }
      }
  
      setSecret(val);
      console.log(val);
    }
  
    // calculates the "bulls" and "cows" for a guess
    function getResult(text) {
      let guess_text = text.split("");
      let actual_text = secret.split("");
  
      var i;
      let wrong_place = 0;
      let correct_place = 0;
      for (i = 0; i < 4; i++) {
        if (guess_text[i] == actual_text[i]) {
          correct_place += 1;
        } else if (actual_text.includes(guess_text[i])) {
          wrong_place += 1;
        }
      }
      return correct_place + " bulls; " + wrong_place + " cows";
    }
  
    // the screen that is displayed when a game is over
    function GameOver() {
      return (
        <div>
          <p>{message}</p>
          <button className="button" onClick={reset}>
            Reset Game
          </button>
        </div>
      );
    }
  
    let body = null;
  
    if (lives > 0) {
      body = (
        <div className="row">
          <div className="column">
            <h2>{lives} Lives left!</h2>
            <input
              id="input-box"
              type="text"
              onKeyPress={keyPress}
              onChange={updateText}
              value={text}
            />
            <button className="button" onClick={guess}>
              Guess
            </button>
            <br />
            <br />
            <p className="alert">
              {lastGuessInvalid
                ? "Guesses must consist of 4 unique digits \n and be unique from previous guesses."
                : " "}
            </p>
            <button className="button" onClick={reset}>
              Reset Game
            </button>
          </div>
          <div className="column">
            <h2>Guesses</h2>
            <ol className="guesses">
              {guesses.map((value, index) => {
                return <li key={index}>{value + " " + getResult(value)}</li>;
              })}
            </ol>
          </div>
        </div>
      );
    } else {
      body = (
        <div>
          <GameOver />
        </div>
      );
    }
  
    return (
      <div className="App">
        <h1>4 Digits Game</h1>
        {body}
      </div>
    );
  }
  
  export default App;

function Demo(_) {
    const [count, setCount] = useState(0);

    return (
        <div>
          <p>Count: {count}</p>
          <p><button onClick={() => setCount(count + 1)}>+1</button></p>
        </div>
    )
}

ReactDOM.render(
  <React.StrictMode>
    <Bulls />
  </React.StrictMode>,
  document.getElementById('root')
);
