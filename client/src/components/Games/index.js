import React, { useState, useEffect, useRef } from "react";
import queryString from 'query-string';
import Modal from '../Modal';
import io from "socket.io-client";
import { Link } from 'react-router-dom';


import './games.css';
import TicTacToe from "../Tic-tac-toe";
import SnakeGame from "../Snake-game";
import Pong from "../Pong";

const games = [
    {
        name: 'Tic-Tac-Toe'

    },
    {
        name: 'Ping-Pong'

    },
    {
        name: 'Snake-game'
    },

]

let socket;
const ENDPOINT = 'localhost:5000';
const Games = ({ location }) => {

    const [user, setUser] = useState({});
    const [players, setPlayers] = useState('');
    const [game, setGame] = useState('');
    const [connection, setConnection] = useState({});
    const [ticTacToeData, setTicTacToeData] = useState(null);
    const [snakeGameData, setSnakeGameData] = useState(null);
    const [pongGameData, setPongGameData] = useState(null);

    const getGame = () => {
        switch (game) {
            case 'Tic-Tac-Toe':
                return <TicTacToe players={players} user={user} socket={connection} data={ticTacToeData} onClose={handleClose} />
            case 'Ping-Pong':
                return <Pong players={players} user={user} socket={connection} data={pongGameData} onClose={handleClose} />
            case 'Snake-game':
                return <SnakeGame players={players} user={user} socket={connection} data={snakeGameData} onClose={handleClose} />;
            default:
                break;
        }
    }

    const handleClose = () => {
        setGame('');
        setTicTacToeData(null);
    }

    const handleModalClose = () => {
        console.log('asdsad');
    }
    // console.log(players);
    useEffect(() => {
        const { name, room } = queryString.parse(location.search);

        setUser({ ...user, name, room });
        socket = io(ENDPOINT);

        socket.emit('join', { name, room }, (error) => {
            if (error) {
                console.log(error);
            }
            setConnection(socket);
        });

        socket.on("tictactoeBegin", ({ symbol }) => {
            // setPlayers(users);
            console.log('symbol', symbol);
            const data = { symbol };
            setTicTacToeData(data);
            // setSymbol(symbol);
        });
        socket.on("SnakeGameBegin", (data) => {
            console.log(data);
            if (!data.isDataSet) {
                setSnakeGameData(data);
            }
            console.log(snakeGameData);
        });

        socket.on("PongGameBegin", (data) => {
            console.log(data);
            setPongGameData(data);
        });
        socket.on("roomData", ({ players }) => {
            setPlayers(players);
        });

    }, [ENDPOINT, location.search]);

    // useEffect(() => {

    //   }, []);

    return (
        <>

            {
                game ? getGame() :
                    <div className="games__list">
                        <h1 className="games__list__heading">Welcome to GameIt</h1>
                        {ticTacToeData && <Modal title='Tic-Tac-Toe' onClose={handleModalClose} onStartgame={() => setGame('Tic-Tac-Toe')} />}
                        {snakeGameData && <Modal title='Snake Game' onClose={handleModalClose} onStartgame={() => setGame('Snake-game')} />}
                        {pongGameData && <Modal title='Pong Game' onClose={handleModalClose} onStartgame={() => setGame('Ping-Pong')} />}
                        {
                            games.map((value,) => <button key={value.name} className='games__list__link' type="button" onClick={() => setGame(value.name)}>{value.name}</button>)
                        }
                    </div>

            }
        </>

    );
}


export default Games;