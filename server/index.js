const express = require('express');
const socketio = require('socket.io');
const http = require('http');

const { addPlayer, removePlayer, getPlayer, getPlayersInRoom } = require('./Players');

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
        if (error) return callback(error);

        socket.join(player.room);

        io.to(player.room).emit('roomData', { room: player.room, players: getPlayersInRoom(player.room) });

        callback();
    });
    socket.on('userClicked', ({ user, symbol, index }, callback) => {
        const players = getPlayersInRoom(user.room);
        const player = players.find((value) => value.id === socket.id);
        const opponent = players.find((value) => value.id !== socket.id);
        io.to(opponent.id).emit('opponentTurn', { user: player.name, index: index, symbol: symbol });

        // callback();
    });
    socket.on('tictactoeStarted', ({ user }, callback) => {
        const players = getPlayersInRoom(user.room);
        const player = players.find((value) => value.id === socket.id);
        const opponent = players.find((value) => value.id !== socket.id);

        // io.to(player.id).emit('tictactoeBegin', { symbol: 'X' });
        io.to(opponent.id).emit('tictactoeBegin', { symbol: 'O' });

        // callback();
    });

    socket.on('SnakeGameStarted', ({ user, mySnakePos, foodPos, isDataSet }, callback) => {

        const players = getPlayersInRoom(user.room);
        console.log(players);
        // const player = players.find((value) => value.id === socket.id);
        const opponent = players.find((value) => value.id !== socket.id);
        const data = {
            oppSnakePos: mySnakePos ? mySnakePos : [],
            foodPos: foodPos ? foodPos : [],
            isDataSet: isDataSet
        }
        io.to(opponent.id).emit('SnakeGameBegin', data);


        // callback();
    });




    socket.on('MyFoodEat', ({ user, foodPos, mySnakePos }, callback) => {

        const players = getPlayersInRoom(user.room);
        const opponent = players.find((value) => value.id !== socket.id);

        io.to(opponent.id).emit('OppFoodEat', { foodPos, oppPosData: mySnakePos });

        // callback();
    });

    socket.on('MyPositionData', ({ user, position }, callback) => {

        const players = getPlayersInRoom(user.room);
        const opponent = players.find((value) => value.id !== socket.id);

        io.to(opponent.id).emit('OppPositionData', position);

        // callback();
    });

    socket.on('PongGameStarted', ({ user, position }, callback) => {

        const players = getPlayersInRoom(user.room);
        // const player = players.find((value) => value.id === socket.id);
        const opponent = players.find((value) => value.id !== socket.id);

        io.to(opponent.id).emit('PongGameBegin', position);


        // callback();
    });

    socket.on('MyPositionDataPong', ({ user, position }, callback) => {

        const players = getPlayersInRoom(user.room);
        const opponent = players.find((value) => value.id !== socket.id);

        io.to(opponent.id).emit('OppPositionDataPong', position);

        // callback();
    });

    socket.on('PongBallDirection', ({ user, direction }, callback) => {

        const players = getPlayersInRoom(user.room);
        const opponent = players.find((value) => value.id !== socket.id);

        io.to(opponent.id).emit('OppPongBallDirection', direction);

        // callback();
    });

    socket.on('PongGameOver', ({ user }, callback) => {

        const players = getPlayersInRoom(user.room);
        const opponent = players.find((value) => value.id !== socket.id);

        io.to(opponent.id).emit('PongGameOverOpponent');

        // callback();
    });


    socket.on('SnakeCrashed', ({ user }, callback) => {

        const players = getPlayersInRoom(user.room);
        const opponent = players.find((value) => value.id !== socket.id);

        io.to(opponent.id).emit('OppSnakeCrashed');

        // callback();
    });


})
app.use(router);

server.listen(PORT, () => console.log("server started"));