import React from 'react';

const KEYBOARD_LAYOUT = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ç'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M', '.', '-', ' '],
  ['DEL', 'LIMPAR', 'FECHAR'],
];

interface VirtualKeyboardProps {
  focusArea: string;
  searchTerm: string;
  kbRow: number;
  kbCol: number;
}

const VirtualKeyboard: React.FC<VirtualKeyboardProps> = ({
  focusArea,
  searchTerm,
  kbRow,
  kbCol,
}) => {
  if (focusArea !== 'keyboard') {
    return null;
  }

  return (
    <div className="absolute inset-0 top-[85px] bg-slate-200 z-30 p-2 border-t-2 border-black flex flex-col animate-in slide-in-from-bottom duration-200">
      <div className="bg-white p-2 mb-2 border border-black/20 shadow-inner flex justify-between items-center">
        <span className="gb-font text-[10px]">{searchTerm || '_'}</span>
        <span className="text-[7px] text-slate-400">NOMES</span>
      </div>
      <div className="grid gap-1 flex-grow">
        {KEYBOARD_LAYOUT.map((row, rIdx) => (
          <div key={rIdx} className="flex gap-1 justify-center">
            {row.map((key, cIdx) => (
              <button
                key={key}
                className={`flex-1 p-1 text-[8px] gb-font border transition-all ${
                  kbRow === rIdx && kbCol === cIdx
                    ? 'bg-black text-white scale-110 z-10 shadow-lg'
                    : 'bg-white text-black border-black/10'
                }`}
              >
                {key}
              </button>
            ))}
          </div>
        ))}
      </div>
      <div className="mt-2 text-[6px] text-center font-bold text-slate-500 uppercase">
        A: INSERIR | B: VOLTAR
      </div>
    </div>
  );
};

export default VirtualKeyboard;
