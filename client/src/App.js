import React from 'react';

import { BrowserRouter as Router, Route } from 'react-router-dom';
import Join from './components/Join/Join';
import Games from './components/Games';
import TicTacToe from './components/Tic-tac-toe';

const App = () => {
  return (
    <Router>
      <Route path="/" exact component={Join} />
      <Route path="/games" exact component={Games} />
      <Route path="/games/ticTacToe" component={TicTacToe} />
    </Router>
  );
};

export default App;