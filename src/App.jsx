import React, { useState } from 'react';
import TerminalIntro from './components/TerminalIntro.jsx';
import SciFiCockpit from './SciFiCockpit.jsx';
import { zenAudio } from './utils/zenAudio.js';

export default function App() {
  const [started, setStarted] = useState(false);

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-black">
      {!started ? (
        <TerminalIntro
          onStart={() => {
            zenAudio.start();
            setStarted(true);
          }}
        />
      ) : (
        <SciFiCockpit
          onExitToTerminal={() => {
            zenAudio.stop();
            setStarted(false);
          }}
        />
      )}
    </main>
  );
}
