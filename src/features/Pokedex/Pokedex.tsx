import React, { useState, useRef, useCallback, useEffect } from 'react';
import { PokemonDetails } from '../../types';
import { getProfessorInsight } from '../../services/geminiService';
import PokemonDetailsModal from '../../components/PokemonDetailsModal';
import { useAppDispatch, useAppSelector } from '../../state/store';
import { setDescriptionCacheEntry } from '../../state/pokedexSlice';
import { usePokemonData } from './hooks/usePokemonData';
import { useKeyboardNavigation } from './hooks/useKeyboardNavigation';
import Header from './components/Header';
import FilterControls from './components/FilterControls';
import SearchBar from './components/SearchBar';
import PokemonList from './components/PokemonList';
import VirtualKeyboard from './components/VirtualKeyboard';
import GameboyControls from './components/GameboyControls';

const Pokedex: React.FC = () => {
  const dispatch = useAppDispatch();
  const { descriptionsCache } = useAppSelector((state) => state.pokedex);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPokemon, setSelectedPokemon] = useState<PokemonDetails | null>(null);
  const [focusArea, setFocusArea] = useState('list');
  const [listIndex, setListIndex] = useState(0);

  const {
    detailedList,
    loadingInitial,
    loadingMore,
    hasMore,
    filteredPokemon,
    handleLoadMorePokemon,
    activeType,
    setActiveType,
    sortMode,
    setSortMode,
  } = usePokemonData(searchTerm);

  const modalActionRef = useRef<{
    onDpad: (dir: 'up' | 'down' | 'left' | 'right') => void;
    onA: () => void;
    onB: () => void;
  } | null>(null);
  const listContainerRef = useRef<HTMLDivElement>(null);

  const prefetchRelatedInsights = useCallback(
    (pokemon: PokemonDetails) => {
      const mainType = pokemon.types[0].type.name;
      const related = detailedList
        .filter((p) => p.types.some((t) => t.type.name === mainType) && p.id !== pokemon.id)
        .slice(0, 6);

      related.forEach((p) => {
        if (!descriptionsCache[p.name]) {
          getProfessorInsight(p).then((insight) => {
            dispatch(setDescriptionCacheEntry({ name: p.name, text: insight }));
          });
        }
      });
    },
    [detailedList, descriptionsCache, dispatch],
  );

  const handleSelectPokemon = useCallback(
    (pokemon: PokemonDetails) => {
      setSelectedPokemon(pokemon);
      prefetchRelatedInsights(pokemon);
    },
    [prefetchRelatedInsights],
  );

  const { kbRow, kbCol, filterOptionIdx, handleDpad, handleActionA, handleActionB } =
    useKeyboardNavigation(
      selectedPokemon,
      modalActionRef,
      filteredPokemon,
      listIndex,
      setListIndex,
      handleSelectPokemon,
      handleLoadMorePokemon,
      hasMore,
      loadingMore,
      activeType,
      setActiveType,
      sortMode,
      setSortMode,
      searchTerm,
      setSearchTerm,
      focusArea,
      setFocusArea,
    );

  useEffect(() => {
    if (listIndex >= filteredPokemon.length && filteredPokemon.length > 0) {
      setListIndex(0);
    }
  }, [filteredPokemon, listIndex]);

  useEffect(() => {
    if (focusArea === 'list' && filteredPokemon.length > 0) {
      const threshold = Math.max(filteredPokemon.length - 10, 0);
      if (listIndex >= threshold && hasMore && !loadingMore) {
        handleLoadMorePokemon();
      }
    }
  }, [listIndex, filteredPokemon.length, focusArea, hasMore, loadingMore, handleLoadMorePokemon]);

  useEffect(() => {
    if (!selectedPokemon && focusArea === 'list') {
      const activeEl = document.querySelector('.mini-card.selected');
      if (activeEl) activeEl.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
  }, [listIndex, selectedPokemon, focusArea]);

  return (
    <div className="gb-body">
      <div className="gb-screen-frame">
        <div className="power-light"></div>
        <div className="gb-lcd">
          <div className="pokedex-screen-content">
            <Header pokemonCount={filteredPokemon.length} />
            <FilterControls
              focusArea={focusArea}
              filterOptionIdx={filterOptionIdx}
              activeType={activeType}
              sortMode={sortMode}
            />
            <SearchBar focusArea={focusArea} searchTerm={searchTerm} />
            <VirtualKeyboard
              focusArea={focusArea}
              searchTerm={searchTerm}
              kbRow={kbRow}
              kbCol={kbCol}
            />
            <PokemonList
              loadingInitial={loadingInitial}
              filteredPokemon={filteredPokemon}
              listIndex={listIndex}
              focusArea={focusArea}
              listContainerRef={listContainerRef}
              setFocusArea={setFocusArea}
              setListIndex={setListIndex}
              loadingMore={loadingMore}
              hasMore={hasMore}
            />
            <div className="bg-black/10 p-1 text-center border-t border-black/20 text-[6px] gb-font">
              A:VER | B:RESET | SELECT:FILTRO
            </div>
          </div>
          {selectedPokemon && (
            <div className="absolute inset-0 bg-white z-50 overflow-hidden p-2 animate-in fade-in slide-in-from-bottom-4 duration-200">
              <PokemonDetailsModal
                pokemon={selectedPokemon}
                allPokemon={detailedList}
                onClose={() => setSelectedPokemon(null)}
                initialInsight={descriptionsCache[selectedPokemon.name]}
                isGameBoyMode={true}
                actionRef={modalActionRef}
                onSelectOther={(other) => handleSelectPokemon(other)}
              />
            </div>
          )}
        </div>
        <div className="gb-logo">
          GAME BOY{' '}
          <span className="gb-color-text">
            <span>C</span>
            <span>O</span>
            <span>L</span>
            <span>O</span>
            <span>R</span>
          </span>
        </div>
      </div>
      <GameboyControls
        handleDpad={handleDpad}
        handleActionA={handleActionA}
        handleActionB={handleActionB}
        setFocusArea={setFocusArea}
      />
      <div className="speaker">
        {[...Array(12)].map((_, i) => (
          <div key={i} className="speaker-hole"></div>
        ))}
      </div>
      <style>{`
        .pixelated { image-rendering: pixelated; }
        .mini-card.selected { border-color: black; background: rgba(255,255,255,0.4); }
        @keyframes bounce-x {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(-3px); }
        }
      `}</style>
    </div>
  );
};

export default Pokedex;
