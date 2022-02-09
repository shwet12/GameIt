import React, { useState, useEffect, useRef } from "react";


import './snake.css';


const getRandomCoordinates = () => {
    let min = 1;
    let max = 98;
    let x = Math.floor((Math.random() * (max - min + 1) + min) / 2) * 2;
    let y = Math.floor((Math.random() * (max - min + 1) + min) / 2) * 2;
    return [x, y]
}

const myPosData = [
    [0, 0],
    [2, 0]
];

const SnakeGame = ({ players, user, socket, data, onClose }) => {
    const speed = 500;
    const [foodPos, setFoodPos] = useState(getRandomCoordinates());
    const [mySnakePos, setMySnakePos] = useState(myPosData);

    const myPosRef = useRef(myPosData);
    const [oppSnakePos, setOppSnakePos] = useState([]);

    const oppPosRef = useRef([]);
    const intervalIdRef = useRef(null);

    const [winner, setWinner] = useState('');

    // const [mySnakeDir, setMySnakeDir] = useState('RIGHT');
    const myDirRef = useRef('RIGHT');

    useEffect(() => {

        let intervalId = null;
        if (data) {

            socket.emit('SnakeGameStarted', { user, isDataSet: true }, (error) => {
                if (error) {
                    alert(error);
                }
                // setConnection(socket);
            });

            const { oppSnakePos, foodPos } = data;

            setFoodPos(foodPos);

            setOppSnakePos(oppSnakePos);

            intervalId = setInterval(moveSnake, speed);
            intervalIdRef.current = intervalId;
            document.addEventListener('onKeydown', onKeyDown);

        }
        else {
            socket.emit('SnakeGameStarted', { user, mySnakePos, foodPos }, (error) => {
                if (error) {
                    alert(error);
                }
            });

            socket.on("SnakeGameBegin", (data) => {
                const { oppSnakePos, foodPos, isDataSet } = data;
                if (!isDataSet) {

                    setFoodPos(foodPos);
                    setOppSnakePos(oppSnakePos);
                }


                intervalId = setInterval(moveSnake, speed);
                intervalIdRef.current = intervalId;
                document.addEventListener('onKeydown', onKeyDown);

            });
        }

        socket.on("OppPositionData", (data) => {
            setOppSnakePos(data);
            oppPosRef.current = data;
        });

        socket.on("OppFoodEat", (data) => {
            const { foodPos, oppPosData } = data;
            console.log('oppFood', foodPos, oppPosData)
            setOppSnakePos(oppPosData);
            setFoodPos(foodPos);
        });

        socket.on("OppSnakeCrashed", () => {
            clearInterval(intervalIdRef.current);
            setWinner('You');
        });


        return () => {
            document.removeEventListener('onKeydown', onKeyDown);
            clearInterval(intervalId);
        }
    }, []);


    useEffect(() => {
        checkIfOutOfBorders();
        checkIfEat();
    }, [mySnakePos, oppSnakePos]);

    const moveSnake = () => {
        let dots = [...myPosRef.current];

        let head = dots[dots.length - 1];

        switch (myDirRef.current) {
            case 'RIGHT':
                head = [head[0] + 2, head[1]];
                break;
            case 'LEFT':
                head = [head[0] - 2, head[1]];
                break;
            case 'DOWN':
                head = [head[0], head[1] + 2];
                break;
            case 'UP':
                head = [head[0], head[1] - 2];
                break;
        }

        dots.push(head);
        dots.shift();
        myPosRef.current = dots;
        socket.emit("MyPositionData", ({ user, position: dots }), (error) => {
            if (error) {
                alert(error);
            }

        });
        setMySnakePos(dots);
    }

    const onKeyDown = (e) => {
        e = e || window.event;
        switch (e.keyCode) {
            case 38:
                myDirRef.current = 'UP';
                break;
            case 40:
                myDirRef.current = 'DOWN';
                break;
            case 37:
                myDirRef.current = 'LEFT';
                break;
            case 39:
                myDirRef.current = 'RIGHT';
                break;
        }

    }

    const checkIfEat = () => {
        let head = mySnakePos[mySnakePos.length - 1];
        let food = foodPos;
        if (head[0] == food[0] && head[1] == food[1]) {
            const foodPos = getRandomCoordinates();
            setFoodPos(foodPos);

            enlargeSnake(foodPos);
        }
    }

    const enlargeSnake = (foodPos) => {
        let newSnake = [...mySnakePos];
        newSnake.unshift([]);
        myPosRef.current = newSnake;

        socket.emit("MyFoodEat", ({ user, foodPos, mySnakePos: newSnake }), (error) => {
            if (error) {
                alert(error);
            }

        });
        setMySnakePos(newSnake);
    }
    const checkIfOutOfBorders = () => {
        let head = mySnakePos[mySnakePos.length - 1];
        if (head[0] >= 100 || head[1] >= 100 || head[0] < 0 || head[1] < 0) {
            onGameOver();

        }

    }

    // const checkIfCollapsed = () => {
    //     let snake = [...mySnakePos];
    //     let head = snake[snake.length - 1];
    //     snake.pop();
    //     snake.forEach(dot => {
    //         if (head[0] == dot[0] && head[1] == dot[1]) {
    //             onGameOver();
    //         }
    //     })
    // }

    const onGameOver = () => {
        console.log(`Game Over. Snake length is ${mySnakePos.length}`);
        clearInterval(intervalIdRef.current);

        socket.emit("SnakeCrashed", ({ user }), (error) => {
            if (error) {
                alert(error);
            }

        });

        setWinner('Opponent');
    }

    return (
        <div className="game__snake">
            <div className="header">
                <div className="header__status">
                    {winner && `${winner} is the winner`}
                </div>
                <button type="button" className="header__restart" onClick={() => onClose()}>
                    Back
                </button>
            </div>
            <div className="game__snake__board">
                {
                    mySnakePos.map((dot, i) => {
                        const style = {
                            left: `${dot[0]}%`,
                            top: `${dot[1]}%`
                        }
                        return (
                            <div className="snake__dot--user" key={i} style={style}></div>
                        )
                    })
                }

                {
                    oppSnakePos.map((dot, i) => {
                        const style = {
                            left: `${dot[0]}%`,
                            top: `${dot[1]}%`
                        }
                        return (
                            <div className="snake__dot--opponent" key={i} style={style}></div>
                        )
                    })
                }

                <div className="snake__food" style={{
                    left: `${foodPos[0]}%`,
                    top: `${foodPos[1]}%`
                }}></div>
            </div>
        </div>
    );
}


export default SnakeGame;