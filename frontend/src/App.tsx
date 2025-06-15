import React from 'react';
import './App.css';
import GameScene from './components/Game/GameScene';

function App() {
  return (
    <div className="App">
      {/* The GameScene will take over the full viewport */}
      <GameScene />
    </div>
  );
}

export default App;
