import React, { useState, useRef } from 'react';

const App = () => {

  const [count, setCount] = useState(0);
  const notifications = useRef([]);

  const notify = (i) => {
    if (i > 0 ) {
      const notification = new Notification('Electron-React Boilerplate', {
        body: count + 1
      });
      notifications.current.push(notification);
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
      <button onClick={() => {
          const countElelemnt = window.document.getElementById('count');
          countElelemnt.innerText = count + 1;
          setCount(count + 1);
          notify(1);
        }}
      >Count</button>{' '}
      <button onClick={() => {
          const countElelemnt = window.document.getElementById('count');
          countElelemnt.innerText = 0;
          setCount(0);
          notify(0);
          notifications.current.forEach((n) => {
            n.close();
          });
        }}
      >Reset</button>
      <div id="count">{`${count}`}</div>
    </div>
  );
}

export default App;
