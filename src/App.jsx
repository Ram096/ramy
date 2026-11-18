import React, { useState } from 'react';
import TerminalIntro from './components/TerminalIntro.jsx';
import SciFiCockpit from './SciFiCockpit.jsx';

export default function App() {
  const [started, setStarted] = useState(false);

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-black">
      {!started ? (
        <TerminalIntro onStart={() => setStarted(true)} />
      ) : (
        <SciFiCockpit onExitToTerminal={() => setStarted(false)} />
      )}
    </main>
  );
}
