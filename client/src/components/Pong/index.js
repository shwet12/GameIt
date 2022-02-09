import React, { useState, useEffect, useRef } from "react";


import './pong.css';

// const pongData = 

const INITIAL_VELOCITY = 0.021;

function randomNumberBetween(min, max) {
    return Math.random() * (max - min) + min
}


const Pong = ({ players, user, socket, data, onClose }) => {

    const [myPaddlePos, setPaddlePos] = useState(40);
    const myPaddleRef = useRef(40);
    const [oppPaddlePos, setOppPaddlePos] = useState(null);
    const [ballPos, setBallPos] = useState({ x: 49, y: 40 });
    const ballPosRef = useRef({ x: 49, y: 40 });
    const direction = useRef({ x: 0, y: 0 });
    const rafRef = useRef();
    const previousTimeRef = useRef();
    const [winner, setWinner] = useState('');
    // const oppPaddleRef = useRef(null)

    useEffect(() => {

        if (data) {

            socket.emit('PongGameStarted', { user, position: myPaddlePos }, (error) => {
                if (error) {
                    alert(error);
                }
            });
            setOppPaddlePos(data);
            // let lastTime;
            rafRef.current = window.requestAnimationFrame(function animate(time) {

                // console.log(time, lastTime);
                if (previousTimeRef.current && rafRef.current != null) {
                    const delta = time - previousTimeRef.current
                    // console.log('delta', delta);
                    animateBall(delta);
                }

                previousTimeRef.current = time
                if (rafRef.current != null) {
                    rafRef.current = window.requestAnimationFrame(animate)
                }
            });

        }
        else {
            socket.emit('PongGameStarted', { user, position: myPaddlePos }, (error) => {
                if (error) {
                    alert(error);
                }
            });

            socket.on("PongGameBegin", (data) => {
                console.log(data);
                setOppPaddlePos(data);
                rafRef.current = window.requestAnimationFrame(function animate(time) {

                    console.log(rafRef.current);
                    if (previousTimeRef.current && rafRef.current != null) {
                        const delta = time - previousTimeRef.current
                        // console.log('delta', delta);
                        animateBall(delta);
                    }

                    previousTimeRef.current = time
                    if (rafRef.current != null) {
                        rafRef.current = window.requestAnimationFrame(animate)
                    }

                });

            });

        }

        initializeBall();

        // let lastTime = null;


        document.addEventListener('keydown', onKeyDown);
        socket.on("OppPositionDataPong", (data) => {
            setOppPaddlePos(data);
            // oppPosRef.current = data;
        });

        socket.on("OppPongBallDirection", (data) => {
            direction.current = data;
            // oppPosRef.current = data;
        });

        socket.on("PongGameOverOpponent", (data) => {
            direction.current = data;
            // clearInterval(intervalIdRef.current);
            rafRef.current = null;
            setWinner('You');
        });


        return () => {
            window.cancelAnimationFrame(rafRef.current);
            document.removeEventListener("keydown", onKeyDown);
        }
    }, []);

    const animateBall = (time) => {

        const pos = { ...ballPosRef.current };
        pos.x += direction.current.x * INITIAL_VELOCITY * time;
        pos.y += direction.current.y * INITIAL_VELOCITY * time;
        // console.log(pos);
        ballPosRef.current = pos
        // pos.x >= 95 || pos.x <= 0
        if (isCollided(ballPosRef.current)) {
            console.log('shwet');
            direction.current = { ...direction.current, x: -1 * direction.current.x };
            socket.emit("PongBallDirection", ({ user, direction: { x: direction.current.x * -1, y: direction.current.y * -1 } }), (error) => {
                if (error) {
                    alert(error);
                }

            });

        }
        // pos.x >= 95 || 
        else if (pos.x <= 0) {
            console.log('close', rafRef.current);
            rafRef.current = null;
            setWinner('Opponent');
            socket.emit("PongGameOver", ({ user }), (error) => {
                if (error) {
                    alert(error);
                }

            });

        }
        else if (pos.y >= 96 || pos.y <= 0) {
            direction.current = { ...direction.current, y: -1 * direction.current.y };
        }
        setBallPos(pos);
    }

    const isCollided = (ballPos) => {
        return ballPos.x <= 2 && (Math.abs(myPaddleRef.current - ballPos.y) <= 8)
    }

    const initializeBall = () => {
        // direction = { x: 0 }
        let x = 0;
        let y;
        while (
            Math.abs(x) <= 0.2 ||
            Math.abs(x) >= 0.9
        ) {
            const heading = randomNumberBetween(0, 2 * Math.PI);
            x = Math.cos(heading);
            y = Math.sin(heading);
        }

        // console.log(x, y);
        direction.current = { x, y }

        socket.emit("PongBallDirection", ({ user, direction: { x: direction.current.x * -1, y: direction.current.y * -1 } }), (error) => {
            if (error) {
                alert(error);
            }

        });
        // setDirection({ x, y })
    }

    const onKeyDown = (e) => {
        // console.log(myPaddleRef.current);
        e = e || window.event;

        if (myPaddleRef.current > 0 && e.keyCode === 38) {
            setPaddlePos((x) => {
                myPaddleRef.current = x - 2;
                emitPosition(myPaddleRef.current);
                return x - 2
            });

        }
        else if (myPaddleRef.current < 90 && e.keyCode === 40) {
            setPaddlePos((x) => {
                myPaddleRef.current = x + 2;
                emitPosition(myPaddleRef.current);
                return x + 2
            });
        }
        else {
            return;
        }

    }

    const emitPosition = (pos) => {
        socket.emit("MyPositionDataPong", ({ user, position: pos }), (error) => {
            if (error) {
                alert(error);
            }

        });
    }




    return (
        <div className="game__pong">
            <div className="header">
                <div className="header__status">
                    {winner && `${winner} is the winner`}
                </div>
                <button type="button" className="header__restart" onClick={() => onClose()}>
                    Back
                </button>
            </div>
            <div className="game__pong__board">
                <div className="ball" id="ball" style={{ top: `${ballPosRef.current.y}%`, left: `${ballPosRef.current.x}%` }}></div>
                <div className="paddle_user" id="player-user" style={{ top: `${myPaddlePos}%` }}></div>
                {oppPaddlePos >= 0 && <div className="paddle_opponent" id="player-opponent" style={{ top: `${oppPaddlePos}%` }}></div>}
            </div>

        </div>
    );
}


export default Pong;