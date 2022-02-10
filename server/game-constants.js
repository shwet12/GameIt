const SnakeEvents = {
    SNAKE_GAME_STARTED: 'SnakeGameStarted',
    SNAKE_GAME_BEGIN: 'SnakeGameBegin',
    MY_FOOD_EAT: 'MyFoodEat',
    OPP_FOOD_EAT: 'OppFoodEat',
    MY_POSITION_DATA: 'MyPositionData',
    SNAKE_CRASHED: 'SnakeCrashed',
    OPP_SNAKE_CRASHED: 'OppSnakeCrashed',
    OPP_POSITION_DATA: 'OppPositionData'
}

const PongGameEvents = {
    PONG_GAME_STARTED: 'PongGameStarted',
    PONG_GAME_BEGIN: 'PongGameBegin',
    MY_POS_DATA: 'MyPositionDataPong',
    OPP_POSITION_DATA: 'OppPositionDataPong',
    PONG_BALL_DIR: 'PongBallDirection',
    OPP_PONG_BALL_DIR: 'OppPongBallDirection',
    PONG_GAME_OVER: 'PongGameOver',
    OPP_PONG_GAME_OVER: 'PongGameOverOpponent'

}

const TicTacToeEvents = {
    USER_CLICKED: 'userClicked',
    OPP_TURN: 'opponentTurn',
    TIC_TAC_TOE_STARTED: 'tictactoeStarted',
    TIC_TAC_TOE_BEGIN: 'tictactoeBegin'
}

module.exports = { SnakeEvents, PongGameEvents, TicTacToeEvents };