import React, { useEffect, useState } from "react";
import {
  ch_join,
  ch_login,
  ch_push,
  ch_reset,
  ch_user_playing,
  ch_user_ready,
} from "./socket";
import "../css/bulls.scss";

function JoinGame({ userName, setUserName }) {
  const [game_name, setGameName] = useState("");

  return (
    <div className="row">
      <div className="column">
        <div>Game Name</div>
        <input
          type="text"
          value={game_name}
          onChange={(ev) => setGameName(ev.target.value)}
        />
        <div>User Name</div>
        <input
          type="text"
          value={userName}
          onChange={(ev) => setUserName(ev.target.value)}
        />
      </div>
      <div className="column">
        <button onClick={() => ch_login(game_name, userName)}>Join Game</button>
      </div>
    </div>
  );
}

const containsOnlyDigits = (val) => {
  return /^\d*$/.test(val);
};

const onlyUniques = (val) => {
  const seen = new Set();
  for (let c of val) {
    if (seen.has(c)) {
      return false;
    }
    seen.add(c);
  }
  return true;
};

const guessLength = 4;

function Bulls() {
  const [state, setState] = useState({
    game_name: "",
    game_over: false,
    playing: false,
    users: {},
  });

  const [userName, setUserName] = useState("");
  const [text, setText] = useState("");

  let { game_name, last_winners, leaderboard, playing, users } = state;

  useEffect(() => {
    ch_join(setState);
  });

  function reset() {
    ch_reset();
  }

  function updateText(event) {
    const potentialGuess = event.target.value;
    if (
      potentialGuess.length <= guessLength &&
      containsOnlyDigits(potentialGuess) &&
      onlyUniques(potentialGuess)
    ) {
      setText(potentialGuess);
    }
  }

  function keyPress(ev) {
    if (ev.key === "Enter") {
      guess();
    }
  }

  function guess() {
    if (text.length === guessLength) {
      ch_push(text, userName);
      setText("");
    }
  }

  function changeUserReady() {
    let ready = users[userName].ready;
    ch_user_ready(!ready);
  }

  function changePlayingStatus() {
    let playing = users[userName].role === "player";
    ch_user_playing(!playing);
  }

  let body = null;

  if (!game_name) {
    body = <JoinGame userName={userName} setUserName={setUserName} />;
  } else if (!playing) {
    body = (
      <div>
        <h2>{game_name} Waiting Room</h2>
        <div className={"row"}>
          <div className={"column"}>
            Player
            <input
              type={"checkbox"}
              value={users[userName].role === "player"}
              onChange={changePlayingStatus}
            />
          </div>
          {users[userName].role === "player" ? (
            <div className={"column"}>
              Ready
              <input
                type={"checkbox"}
                value={users[userName].ready || false}
                onChange={changeUserReady}
              />
            </div>
          ) : null}
        </div>
        <div className="row">
          <div className="column">
            <p className="bold">Players:</p>
            <ul>
              {Object.keys(users).map((user, index) => (
                <li key={index}>{user}</li>
              ))}
            </ul>
          </div>
          <div className="column">
            {console.log(last_winners.length)}
            {last_winners.length > 0 ? 
            <div>
              <h4 className="bold"> Last Winner(s) </h4>
              <p> {last_winners} </p>
              <h4 className="bold"> Leaderboard </h4>
              {Object.entries(leaderboard).map((user, userIndex) => {
                return(
                  <p key={userIndex}>
                  {user[0]}: {user[1]}
                </p>
                )
                
              })}

            </div> : null}
          </div>
        </div>
      </div>
    );
  } else {
    body = (
      <div className="row">
        <div className="column">
          <h2>Four Digits Game</h2>
          {users[userName].role === "player" ? (
            <div>
              <input
                id="input-box"
                type="text"
                onKeyPress={keyPress}
                onChange={updateText}
                value={text}
              />
              <div className="row">
                <button className="button" onClick={guess}>
                  Guess
                </button>
              </div>
              <div className="column">
                <div className="row">
                  <h3>Current Guess</h3>
                </div>
                <div className="row" style={{ color: "blue" }}>
                  <p>{users[userName].current_guess || ""}</p>
                </div>
              </div>
            </div>
          ) : (
            <div>You are an observer</div>
          )}
        </div>

        <div className="column">
          <h2>Guesses</h2>
          <div className="row">
            {console.log(Object.entries(users))}
            {Object.entries(users).map((user, userIndex) => {
              return user[1].role === "player" ? (
                <div className="user_guesses" key={userIndex}>
                  <h4>{user[0]}</h4>
                  <ul>
                    {user[1].guesses.map((guess, index) => {
                      return (
                        <li key={index}>
                          {guess.guess_string} {guess.bulls} {guess.cows}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ) : null;
              // <ol key={userIndex}>
              //     {user.guesses.map((guess, index) => {
              //         return (
              //             <li key={index}>
              //                 {guess.guess_string} {guess.bulls} {guess.cows}
              //             </li>
              //         );
              //     })}
              // </ol>
            })}
          </div>
        </div>
      </div>
    );
  }

  return <div className="container">{body}</div>;
}

export default Bulls;
