import React, {useEffect, useState} from "react";
import {ch_join, ch_login, ch_push, ch_reset, ch_user_playing, ch_user_ready,} from "./socket";
import "../css/bulls.scss";

function JoinGame({userName, setUserName}) {
    const [game_name, setGameName] = useState("");

    return (
        <div className="row">
            <div className="column">
                <input
                    type="text"
                    value={game_name}
                    onChange={(ev) => setGameName(ev.target.value)}
                />
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

const containsOnlyDigits = val => {
    return /^\d*$/.test(val);
};

const onlyUniques = val => {
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

    let {game_name, game_over, playing, users} = state;
    console.log(state);

    useEffect(() => {
        ch_join(setState);
    });

    function reset() {
        ch_reset();
    }

    function updateText(event) {
        const potentialGuess = event.target.value;
        if (potentialGuess.length <= guessLength && containsOnlyDigits(potentialGuess) && onlyUniques(potentialGuess)) {
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
        console.log(!playing);
        ch_user_playing(!playing);
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

    if (!game_name) {
        body = <JoinGame userName={userName} setUserName={setUserName}/>;
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
                Players:
                <ul>
                    {Object.keys(users).map((user, index) => (
                        <li key={index}>{user}</li>
                    ))}
                </ul>
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
                                <button className="button" onClick={reset}>
                                    Reset Game
                                </button>
                                <button className="button" onClick={guess}>
                                    Guess
                                </button>
                            </div>
                            <div className="row">
                                <h3>Current Guess</h3>
                                <br></br>
                                <p>{users[userName].current_guess || ""}</p>
                            </div>
                        </div>
                    ) : null}
                </div>

                <div className="column">
                    <h2>Guesses</h2>
                    <ol className="guesses">
                        {Object.values(users).map((user, userIndex) => {
                            return (
                                <ol key={userIndex}>
                                    {user.guesses.map((guess, index) => {
                                        console.log(guess);
                                        return (
                                            <li key={index}>
                                                {guess.guess_string} {guess.bulls} {guess.cows}
                                            </li>
                                        );
                                    })}
                                </ol>
                            );
                        })}
                    </ol>
                </div>
            </div>
        );
    }

    return <div className="container">{body}</div>;
}

export default Bulls;
