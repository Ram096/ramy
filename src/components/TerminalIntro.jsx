import React, { useState, useEffect } from 'react';

function playTerminalBeep(freq = 600, duration = 0.06) {
  if (typeof window === 'undefined') return;
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(freq, now);
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + duration);
    setTimeout(() => ctx.close(), 150);
  } catch {}
}

export default function TerminalIntro({ onStart }) {
  const [booting, setBooting] = useState(false);
  const [bootLog, setBootLog] = useState([]);
  const [typedTitle, setTypedTitle] = useState('');
  const [showSub, setShowSub] = useState(false);

  const fullTitle = 'Ramy Kassam Portfolio Showcase 2026';

  // Typewriter effect for the main title line
  useEffect(() => {
    let index = 0;
    const timer = setInterval(() => {
      index += 1;
      setTypedTitle(fullTitle.slice(0, index));
      if (index >= fullTitle.length) {
        clearInterval(timer);
        setTimeout(() => setShowSub(true), 250);
      }
    }, 38);

    return () => clearInterval(timer);
  }, []);

  // Keyboard shortcut: Pressing Enter or Space triggers START
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.key === 'Enter' || e.key === ' ') && !booting && showSub) {
        e.preventDefault();
        handleTriggerStart();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [booting, showSub]);

  const handleTriggerStart = () => {
    if (booting) return;
    setBooting(true);
    playTerminalBeep(750, 0.08);

    const logs = [
      'C:\\Users\\Ramy> start orbital_bridge.exe --target "Space Station"',
      '> Loading telemetry modules... [OK]',
      '> Initializing cockpit neural link... [OK]',
      '> Entering 3D Space Station Deck...'
    ];

    logs.forEach((log, i) => {
      setTimeout(() => {
        setBootLog((prev) => [...prev, log]);
        playTerminalBeep(450 + i * 120, 0.04);
      }, (i + 1) * 220);
    });

    setTimeout(() => {
      if (onStart) onStart();
    }, logs.length * 220 + 350);
  };

  return (
    <div className="relative h-screen w-screen bg-black text-white font-mono flex items-center justify-center p-4 sm:p-8 select-none overflow-hidden">
      {/* Subtle CRT / Terminal Scanline Background */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.10] z-10"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)',
          backgroundSize: '100% 4px, 4px 100%'
        }}
      />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_center,transparent_45%,rgba(0,0,0,0.85)_100%)] z-10" />

      {/* Main Terminal Window Frame (Styled to match the reference image) */}
      <div className="relative z-20 w-full max-w-2xl bg-black border-[3px] sm:border-4 border-white shadow-[0_0_50px_rgba(255,255,255,0.08)]">
        {/* Terminal Interior Body */}
        <div className="p-8 sm:p-14 min-h-[300px] sm:min-h-[340px] flex flex-col justify-between text-sm sm:text-base leading-relaxed">
          {/* Command Prompt Line & Title */}
          <div className="space-y-4">
            <div className="text-neutral-400 text-xs sm:text-sm">
              <span className="text-neutral-500">C:\Users\Ramy&gt;</span>{' '}
              <span className="text-neutral-300">portfolio_showcase.exe</span>
            </div>

            {/* Main Showcase Title */}
            <div className="pt-2">
              <h1 className="text-white font-bold text-base sm:text-xl md:text-2xl tracking-wide">
                {typedTitle}
                {!showSub && <span className="inline-block w-2.5 h-5 bg-white ml-1 align-middle animate-pulse" />}
              </h1>

              {/* Subtitle: "Click start to begin" */}
              <div
                className={`pt-2 transition-opacity duration-300 ${
                  showSub ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <p className="text-neutral-300 text-sm sm:text-lg flex items-center gap-2">
                  <span>Click start to begin</span>
                  <span className="inline-block w-2 h-4 sm:w-2.5 sm:h-5 bg-white animate-pulse" />
                </p>
              </div>
            </div>
          </div>

          {/* Center Boxed START Button (Matching reference image) */}
          <div className="py-8 flex flex-col items-center justify-center">
            {!booting ? (
              <button
                onClick={handleTriggerStart}
                className="group relative px-8 sm:px-10 py-2 sm:py-2.5 bg-black text-white hover:bg-white hover:text-black border-[3px] border-white font-bold tracking-widest uppercase text-base sm:text-lg transition-all duration-150 cursor-pointer active:scale-95 shadow-[0_0_15px_rgba(255,255,255,0.15)] hover:shadow-[0_0_25px_rgba(255,255,255,0.4)]"
              >
                <span>START</span>
              </button>
            ) : (
              <div className="w-full bg-neutral-950 border border-neutral-700 p-4 font-mono text-xs sm:text-sm text-neutral-300 space-y-1.5 animate-fadeIn">
                {bootLog.map((log, i) => (
                  <p key={i} className="flex items-center gap-2">
                    <span className="text-neutral-500">&gt;</span>
                    <span className={i === bootLog.length - 1 ? 'text-white font-bold' : 'text-neutral-300'}>
                      {log}
                    </span>
                  </p>
                ))}
              </div>
            )}
          </div>

          {/* Footer Line */}
          <div className="pt-4 border-t border-neutral-900 flex items-center justify-between text-xs text-neutral-600">
            <span>[ SYSTEM: READY ]</span>
            <span>PRESS [ENTER] OR CLICK START</span>
          </div>
        </div>
      </div>
    </div>
  );
}
