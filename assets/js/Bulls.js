import React, {useEffect, useState} from "react";
import {ch_join, ch_login, ch_push, ch_reset} from "./socket";
import "../css/bulls.scss";

function JoinGame({userName, setUserName}) {
    const [game_name, setGameName] = useState("");

    return (
        <div className="row">
            <div className="column">
                <input type="text"
                       value={game_name}
                       onChange={(ev) => setGameName(ev.target.value)}/>
                <input type="text"
                       value={userName}
                       onChange={(ev) => setUserName(ev.target.value)}/>
            </div>
            <div className="column">
                <button onClick={() => ch_login(game_name, userName)}>
                    Join Game
                </button>
            </div>
        </div>
    );
}

function Bulls() {
    const [state, setState] = useState({
        game_name: "",
        game_over: false,
        playing: false,
        users: {},
    });

    const [userName, setUserName] = useState("");
    const [userPlayer, setUserPlayer] = useState(false);
    const [userReady, setUserReady] = useState(false);
    const [text, setText] = useState("");

    let {game_name, game_over, playing, users} = state;
    console.log(state);

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
        ch_push(text, userName);
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

    if (!game_name) {
        body = <JoinGame userName={userName} setUserName={setUserName}/>;
    } else if (!playing) {
        body = (
            <div>
                <h2>{game_name} Waiting Room</h2>
                <div className={"row"}>
                    <div className={"column"}>
                        Player
                        <input type={"checkbox"} value={userPlayer} onChange={() => setUserPlayer(!userPlayer)}/>
                    </div>
                    {userPlayer ?
                        <div className={"column"}>
                            Ready
                            <input type={"checkbox"} value={userReady} onChange={() => setUserReady(!userReady)}/>
                        </div> : null}
                </div>
                Players:
                <ul>
                    {Object.keys(users).map((user, index) => <li key={index}>{user}</li>)}
                </ul>
            </div>
        )
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
                </div>

                <div className="column">
                    <h2>Guesses</h2>
                    <ol className="guesses">
                        {Object.values(users).map((user, userIndex) => {
                            console.log(user);
                            return (
                                <ol>
                                    {user.guesses.map((guess, index) => {
                                        console.log(guess);
                                        return <li>{guess.guess_string} {guess.bulls} {guess.cows}</li>
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
