import React, { useState, useEffect, useRef } from "react";


import './tictactoe.css';


const boardData = [
    '', '', '', '', '', '', '', '', ''
]
const TicTacToe = ({ players, user, socket, data, onClose }) => {

    const [disabled, setDisabled] = useState(true);
    const [board, setBoard] = useState(boardData);
    const [symbol, setSymbol] = useState('');
    const [winner, setWinner] = useState('');

    useEffect(() => {

        if (!data) {
            setSymbol('X');
            socket.emit('tictactoeStarted', { user }, (error) => {
                if (error) {
                    alert(error);
                }
                // setConnection(socket);
            });
            socket.on("tictactoeBegin", ({ symbol }) => {
                setDisabled(false);
            });
        }
        else {
            setSymbol(data.symbol);
            setDisabled(false);
        }

    }, []);

    useEffect(() => {
        if (findWinner()) {
            const { combination, winner } = findWinner();
            setWinner(winner);
            setDisabled(true);
        }
        socket.on("opponentTurn", ({ user, index, symbol }) => {
            const newBoradData = [...board];
            newBoradData[index] = symbol;
            setBoard(newBoradData);
            setDisabled(false);
        });

    }, [board]);

    const handleBoxClick = (e) => {
        const index = e.target.dataset.index;
        const newBoradData = [...board];
        newBoradData[index] = symbol;
        setBoard(newBoradData);
        setDisabled(true);
        socket.emit('userClicked', { user, symbol, index }, (error) => {
            if (error) {
                alert(error);
            }
        });
    }

    const findWinner = () => {
        const winningCombinations = [
            [0, 1, 2],
            [3, 4, 5],
            [6, 7, 8],
            [0, 3, 6],
            [1, 4, 7],
            [2, 5, 8],
            [0, 4, 8],
            [2, 4, 6]
        ];
        let combination = null, winner;
        winningCombinations.forEach((value) => {
            const [x, y, z] = value;
            if (board[x] && board[x] === board[y] && board[x] === board[z]) {
                if (board[x] === symbol) {
                    winner = 'You';
                }
                else {
                    winner = 'Opponent';
                }
                combination = value;
            }
        })
        return combination ? { combination, winner } : null;
    }
    return (
        <div className="game__tictactoe">
            <div className="header">
                <div className="header__status">
                    {winner && `${winner} is the winner`}
                </div>
                <button type="button" className="header__restart" onClick={() => onClose()}>
                    Back
                </button>
            </div>
            <div className={disabled ? 'board--disabled' : 'board'} onClick={handleBoxClick}>
                {
                    board.map((value, index) => <div key={index} className="board__tile" data-index={index}>{value}</div>)
                }
            </div>
        </div>
    );
}


export default TicTacToe;