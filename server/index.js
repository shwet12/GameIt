const express = require('express');
const socketio = require('socket.io');
const http = require('http');

const { addPlayer, getPlayersInRoom } = require('./Players');

const { SnakeEvents, PongGameEvents, TicTacToeEvents } = require('./game-constants');

const PORT = process.env.PORT || 5000;
const router = require('./router');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

io.on('connection', (socket) => {
    console.log('we have a new connection 1');

    socket.on('join', ({ name, room }, callback) => {
        console.log(name, room);

        const { error, player } = addPlayer({ id: socket.id, name, room });

        console.log(error, player)
        if (error) {
            callback(error);
            return;
        }

        socket.join(player.room);

        io.to(player.room);

        callback();
    });
    socket.on(TicTacToeEvents.USER_CLICKED, ({ user, symbol, index }, callback) => {
        const players = getPlayersInRoom(user.room);
        const player = players.find((value) => value.id === socket.id);
        const opponent = players.find((value) => value.id !== socket.id);
        io.to(opponent.id).emit(TicTacToeEvents.OPP_TURN, { user: player.name, index: index, symbol: symbol });

        // callback();
    });
    socket.on(TicTacToeEvents.TIC_TAC_TOE_STARTED, ({ user }, callback) => {
        const players = getPlayersInRoom(user.room);
        const player = players.find((value) => value.id === socket.id);
        const opponent = players.find((value) => value.id !== socket.id);

        // io.to(player.id).emit('tictactoeBegin', { symbol: 'X' });
        io.to(opponent.id).emit(TicTacToeEvents.TIC_TAC_TOE_BEGIN, { symbol: 'O' });

        // callback();
    });

    socket.on(SnakeEvents.SNAKE_GAME_STARTED, ({ user, mySnakePos, foodPos, isDataSet }, callback) => {

        const players = getPlayersInRoom(user.room);
        console.log(players);
        // const player = players.find((value) => value.id === socket.id);
        const opponent = players.find((value) => value.id !== socket.id);
        const data = {
            oppSnakePos: mySnakePos ? mySnakePos : [],
            foodPos: foodPos ? foodPos : [],
            isDataSet: isDataSet
        }
        io.to(opponent.id).emit(SnakeEvents.SNAKE_GAME_BEGIN, data);


        // callback();
    });




    socket.on(SnakeEvents.MY_FOOD_EAT, ({ user, foodPos, mySnakePos }, callback) => {

        const players = getPlayersInRoom(user.room);
        const opponent = players.find((value) => value.id !== socket.id);

        io.to(opponent.id).emit(SnakeEvents.OPP_FOOD_EAT, { foodPos, oppPosData: mySnakePos });

        // callback();
    });

    socket.on(SnakeEvents.MY_POSITION_DATA, ({ user, position }, callback) => {

        const players = getPlayersInRoom(user.room);
        const opponent = players.find((value) => value.id !== socket.id);

        io.to(opponent.id).emit(SnakeEvents.OPP_POSITION_DATA, position);

        // callback();
    });

    socket.on(SnakeEvents.SNAKE_CRASHED, ({ user }, callback) => {

        const players = getPlayersInRoom(user.room);
        const opponent = players.find((value) => value.id !== socket.id);

        io.to(opponent.id).emit(SnakeEvents.OPP_SNAKE_CRASHED);

        // callback();
    });

    
    socket.on(PongGameEvents.PONG_GAME_STARTED, ({ user, position }, callback) => {

        const players = getPlayersInRoom(user.room);
        // const player = players.find((value) => value.id === socket.id);
        const opponent = players.find((value) => value.id !== socket.id);

        io.to(opponent.id).emit(PongGameEvents.PONG_GAME_BEGIN, position);


        // callback();
    });

    socket.on(PongGameEvents.MY_POS_DATA, ({ user, position }, callback) => {

        const players = getPlayersInRoom(user.room);
        const opponent = players.find((value) => value.id !== socket.id);

        io.to(opponent.id).emit(PongGameEvents.OPP_POSITION_DATA, position);

        // callback();
    });

    socket.on(PongGameEvents.PONG_BALL_DIR, ({ user, direction }, callback) => {

        const players = getPlayersInRoom(user.room);
        const opponent = players.find((value) => value.id !== socket.id);

        io.to(opponent.id).emit(PongGameEvents.OPP_PONG_BALL_DIR, direction);

        // callback();
    });

    socket.on(PongGameEvents.PONG_GAME_OVER, ({ user }, callback) => {

        const players = getPlayersInRoom(user.room);
        const opponent = players.find((value) => value.id !== socket.id);

        io.to(opponent.id).emit(PongGameEvents.OPP_PONG_GAME_OVER);

        // callback();
    });


 


})
app.use(router);

server.listen(PORT, () => console.log("server started"));