import React, { useEffect, useState } from 'react';
import { PokemonBase, PokemonDetails, TYPE_COLORS, TYPE_NAMES_PT } from '../types';
import { fetchPokemonDetails } from '../services/pokeService';

interface PokemonCardProps {
  pokemon: PokemonBase;
  onClick: (details: PokemonDetails) => void;
}

const PokemonCard: React.FC<PokemonCardProps> = ({ pokemon, onClick }) => {
  const [details, setDetails] = useState<PokemonDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDetails = async () => {
      try {
        const data = await fetchPokemonDetails(pokemon.name);
        setDetails(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    loadDetails();
  }, [pokemon.name]);

  if (loading || !details) {
    return (
      <div className="bg-white rounded-2xl p-4 animate-pulse h-64 flex flex-col items-center justify-center space-y-3">
        <div className="w-32 h-32 bg-slate-200 rounded-full"></div>
        <div className="w-24 h-4 bg-slate-200 rounded"></div>
        <div className="w-16 h-4 bg-slate-200 rounded"></div>
      </div>
    );
  }

  const mainType = details.types[0].type.name;
  const cardBg = TYPE_COLORS[mainType] || 'bg-slate-200';

  return (
    <div 
      onClick={() => onClick(details)}
      className="pokemon-card bg-white rounded-2xl p-6 cursor-pointer flex flex-col items-center relative overflow-hidden group border border-slate-100"
    >
      <div className={`absolute top-0 right-0 w-32 h-32 ${cardBg} opacity-10 rounded-bl-full transform translate-x-8 -translate-y-8 group-hover:scale-150 transition-transform duration-500`}></div>
      
      <span className="absolute top-4 left-4 text-slate-300 font-bold text-lg">
        #{details.id.toString().padStart(3, '0')}
      </span>

      <img 
        src={details.sprites.other['official-artwork'].front_default} 
        alt={details.name}
        className="w-32 h-32 object-contain z-10 drop-shadow-xl transform transition-transform duration-300 group-hover:scale-110"
      />

      <h3 className="mt-4 text-xl font-bold text-slate-800 capitalize z-10">
        {details.name}
      </h3>

      <div className="flex gap-2 mt-2 z-10">
        {details.types.map((t) => (
          <span 
            key={t.type.name} 
            className={`${TYPE_COLORS[t.type.name]} text-white text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm`}
          >
            {TYPE_NAMES_PT[t.type.name] || t.type.name}
          </span>
        ))}
      </div>
    </div>
  );
};

export default PokemonCard;

