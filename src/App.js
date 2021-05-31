import React from 'react';

const App = () => {

  const updateBadge = (count) => {
    if (count > 0 ) {
      const notification = new Notification('Electron-React Boilerplate');
      window.electron.updateBadge(1);
    }
    else {
      window.electron.updateBadge(0);
    }
  }

  // Main
  return (
    <div className="App">
      <h1>Electron-React Boilerplate</h1>
      <button onClick={() => updateBadge(1)}>Count</button>{' '}
      <button onClick={() => updateBadge(0)}>Reset</button>
      <p>*macOS</p>
    </div>
  );
}

export default App;
