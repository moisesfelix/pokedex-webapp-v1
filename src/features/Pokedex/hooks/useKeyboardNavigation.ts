import { useState, useEffect, useCallback } from 'react';
import { PokemonDetails, TYPE_NAMES_PT } from '../../../types';

const KEYBOARD_LAYOUT = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ç'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M', '.', '-', ' '],
  ['DEL', 'LIMPAR', 'FECHAR'],
];

const FILTER_TYPES = ['TODOS', ...Object.keys(TYPE_NAMES_PT).map((k) => k.toUpperCase())];
const SORT_MODES = ['Nº', 'HP', 'PODER', 'NOME'];

export const useKeyboardNavigation = (
  selectedPokemon: PokemonDetails | null,
  modalActionRef: React.MutableRefObject<any>,
  filteredPokemon: PokemonDetails[],
  listIndex: number,
  setListIndex: (index: number) => void,
  handleSelectPokemon: (pokemon: PokemonDetails) => void,
  handleLoadMorePokemon: () => void,
  hasMore: boolean,
  loadingMore: boolean,
  activeType: string,
  setActiveType: (type: string) => void,
  sortMode: string,
  setSortMode: (mode: string) => void,
  searchTerm: string,
  setSearchTerm: (term: string) => void,
  focusArea: string,
  setFocusArea: (area: string) => void
) => {
  const [kbRow, setKbRow] = useState(0);
  const [kbCol, setKbCol] = useState(0);
  const [filterOptionIdx, setFilterOptionIdx] = useState(0);

  const handleDpad = (direction: 'up' | 'down' | 'left' | 'right') => {
    if (selectedPokemon && modalActionRef.current) {
      modalActionRef.current.onDpad(direction);
      return;
    }

    if (focusArea === 'list') {
      if (direction === 'up') {
        if (listIndex === 0) setFocusArea('search');
        else setListIndex(listIndex - 1);
      }
      if (direction === 'down') {
        if (listIndex < filteredPokemon.length - 1) setListIndex(listIndex + 1);
      }
    } else if (focusArea === 'search') {
      if (direction === 'down') setFocusArea('list');
      if (direction === 'up') setFocusArea('filter');
    } else if (focusArea === 'filter') {
      if (direction === 'down') setFocusArea('search');
      if (direction === 'left') setFilterOptionIdx(0);
      if (direction === 'right') setFilterOptionIdx(1);
    } else if (focusArea === 'keyboard') {
      if (direction === 'up') setKbRow((prev) => Math.max(0, prev - 1));
      if (direction === 'down') setKbRow((prev) => Math.min(KEYBOARD_LAYOUT.length - 1, prev + 1));
      if (direction === 'left') setKbCol((prev) => Math.max(0, prev - 1));
      if (direction === 'right') {
        const maxCol = KEYBOARD_LAYOUT[kbRow].length - 1;
        setKbCol((prev) => Math.min(maxCol, prev + 1));
      }
    }
  };

  const handleActionA = async () => {
    if (selectedPokemon && modalActionRef.current) {
      modalActionRef.current.onA();
      return;
    }

    if (focusArea === 'filter') {
      if (filterOptionIdx === 0) {
        const nextIdx = (FILTER_TYPES.indexOf(activeType) + 1) % FILTER_TYPES.length;
        setActiveType(FILTER_TYPES[nextIdx]);
      } else {
        const nextIdx = (SORT_MODES.indexOf(sortMode) + 1) % SORT_MODES.length;
        setSortMode(SORT_MODES[nextIdx]);
      }
      return;
    }

    if (focusArea === 'search') {
      setFocusArea('keyboard');
      return;
    }

    if (focusArea === 'keyboard') {
      const key = KEYBOARD_LAYOUT[kbRow][kbCol];
      if (key === 'FECHAR') setFocusArea('list');
      else if (key === 'DEL') setSearchTerm((prev) => prev.slice(0, -1));
      else if (key === 'LIMPAR') setSearchTerm('');
      else setSearchTerm((prev) => prev + key);
      return;
    }

    if (focusArea === 'list' && filteredPokemon[listIndex]) {
      handleSelectPokemon(filteredPokemon[listIndex]);
    }
  };

  const handleActionB = () => {
    if (selectedPokemon && modalActionRef.current) {
      modalActionRef.current.onB();
      return;
    }
    if (focusArea === 'keyboard') setFocusArea('search');
    else if (focusArea === 'search' || focusArea === 'list' || focusArea === 'filter') {
      if (searchTerm || activeType !== 'TODOS' || sortMode !== 'Nº') {
        setSearchTerm('');
        setActiveType('TODOS');
        setSortMode('Nº');
        setListIndex(0);
        setFocusArea('list');
      }
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
          handleDpad('up');
          break;
        case 'ArrowDown':
          handleDpad('down');
          break;
        case 'ArrowLeft':
          handleDpad('left');
          break;
        case 'ArrowRight':
          handleDpad('right');
          break;
        case 'z':
        case 'Enter':
          handleActionA();
          break;
        case 'x':
        case 'Escape':
          handleActionB();
          break;
        case 's':
          setFocusArea('search');
          break;
        case 'f':
          setFocusArea('filter');
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleDpad, handleActionA, handleActionB, setFocusArea]);

  return {
    kbRow,
    kbCol,
    filterOptionIdx,
    handleDpad,
    handleActionA,
    handleActionB,
  };
};
