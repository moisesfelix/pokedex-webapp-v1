import React from 'react';

interface GameboyControlsProps {
  handleDpad: (direction: 'up' | 'down' | 'left' | 'right') => void;
  handleActionA: () => void;
  handleActionB: () => void;
  setFocusArea: (area: string) => void;
}

const GameboyControls: React.FC<GameboyControlsProps> = ({
  handleDpad,
  handleActionA,
  handleActionB,
  setFocusArea,
}) => {
  return (
    <>
      <div className="dpad">
        <div className="dpad-btn dpad-up" onClick={() => handleDpad('up')}></div>
        <div className="dpad-btn dpad-down" onClick={() => handleDpad('down')}></div>
        <div className="dpad-btn dpad-left" onClick={() => handleDpad('left')}></div>
        <div className="dpad-btn dpad-right" onClick={() => handleDpad('right')}></div>
      </div>

      <div className="action-btns">
        <div className="btn-circle" onClick={handleActionB}>
          B
        </div>
        <div className="btn-circle" onClick={handleActionA}>
          A
        </div>
      </div>

      <div className="system-btns">
        <div className="btn-pill" title="SELECT" onClick={() => setFocusArea('filter')}></div>
        <div className="btn-pill" title="START" onClick={() => setFocusArea('search')}></div>
      </div>
    </>
  );
};

export default GameboyControls;
