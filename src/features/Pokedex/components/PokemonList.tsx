import React from 'react';
import { PokemonDetails } from '../../../types';

interface PokemonListProps {
  loadingInitial: boolean;
  filteredPokemon: PokemonDetails[];
  listIndex: number;
  focusArea: string;
  listContainerRef: React.RefObject<HTMLDivElement>;
  setFocusArea: (area: string) => void;
  setListIndex: (index: number) => void;
  loadingMore: boolean;
  hasMore: boolean;
}

const PokemonList: React.FC<PokemonListProps> = ({
  loadingInitial,
  filteredPokemon,
  listIndex,
  focusArea,
  listContainerRef,
  setFocusArea,
  setListIndex,
  loadingMore,
  hasMore,
}) => {
  return (
    <div
      ref={listContainerRef}
      className={`pokemon-list-mini ${focusArea === 'keyboard' ? 'opacity-5 grayscale' : ''}`}
    >
      {loadingInitial ? (
        <div className="flex flex-col items-center justify-center h-full gap-2">
          <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
          <span className="gb-font text-[6px] opacity-40">PROCESSANDO...</span>
        </div>
      ) : filteredPokemon.length === 0 ? (
        <div className="text-center p-8 gb-font text-[6px] opacity-40">SEM REGISTROS</div>
      ) : (
        <>
          {filteredPokemon.map((p, idx) => (
            <div
              key={p.name}
              className={`mini-card ${idx === listIndex && focusArea === 'list' ? 'selected' : ''}`}
              onClick={() => {
                setFocusArea('list');
                setListIndex(idx);
              }}
            >
              <div className="w-8 h-8 flex-shrink-0 mr-2 bg-white/60 rounded border border-black/5 flex items-center justify-center shadow-sm">
                <img
                  src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.id}.png`}
                  className="w-full h-full object-contain pixelated"
                  alt=""
                  loading="lazy"
                />
              </div>
              <div className="flex flex-col flex-1 min-w-0">
                <span className="text-[11px] font-black uppercase tracking-tighter truncate">
                  {p.name}
                </span>
                <div className="flex gap-1 overflow-hidden">
                  {p.types.map((t) => (
                    <span key={t.type.name} className="text-[5px] gb-font opacity-40">
                      {t.type.name}
                    </span>
                  ))}
                </div>
              </div>
              <div className="ml-2 flex flex-col items-end opacity-50 flex-shrink-0">
                <span className="text-[5px] gb-font">
                  HP:{p.stats.find((s) => s.stat.name === 'hp')?.base_stat}
                </span>
                <span className="text-[5px] gb-font">XP:{p.base_experience}</span>
              </div>
            </div>
          ))}

          {loadingMore && (
            <div className="flex items-center justify-center p-4 gap-2">
              <div className="w-3 h-3 border border-black/20 border-t-black rounded-full animate-spin"></div>
              <span className="gb-font text-[6px] opacity-40">CARREGANDO...</span>
            </div>
          )}

          {!hasMore && filteredPokemon.length > 0 && (
            <div className="text-center p-4 gb-font text-[6px] opacity-40">
              FIM DA LISTA
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PokemonList;
