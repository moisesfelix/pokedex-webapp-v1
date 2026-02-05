import React from 'react';

interface HeaderProps {
  pokemonCount: number;
}

const Header: React.FC<HeaderProps> = ({ pokemonCount }) => {
  return (
    <div className="bg-black/10 p-2 border-b border-black/20 flex justify-between items-center">
      <span className="gb-font text-[7px] tracking-tight">POKÉDEX IA PRO</span>
      <span className="text-[8px] font-bold">{pokemonCount} PKMN</span>
    </div>
  );
};

export default Header;
