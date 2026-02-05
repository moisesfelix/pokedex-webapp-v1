import { useState, useMemo, useEffect, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../../state/store';
import { loadInitialPokemon, loadMorePokemon } from '../../../state/pokedexSlice';
import { PokemonDetails } from '../../../types';

export const usePokemonData = (searchTerm: string) => {
  const dispatch = useAppDispatch();
  const {
    detailedList,
    loadingInitial,
    loadingMore,
    currentPage,
    hasMore,
  } = useAppSelector((state) => state.pokedex);

  const [activeType, setActiveType] = useState('TODOS');
  const [sortMode, setSortMode] = useState('Nº');

  useEffect(() => {
    dispatch(loadInitialPokemon());
  }, [dispatch]);

  const handleLoadMorePokemon = useCallback(() => {
    if (loadingMore || !hasMore) return;

    const nextPage = currentPage + 1;
    dispatch(loadMorePokemon({ nextPage }));
  }, [currentPage, dispatch, hasMore, loadingMore]);

  const filteredPokemon = useMemo(() => {
    let result = [...detailedList];

    if (searchTerm) {
      result = result.filter((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }

    if (activeType !== 'TODOS') {
      result = result.filter((p) =>
        p.types.some((t) => t.type.name.toUpperCase() === activeType),
      );
    }

    result.sort((a, b) => {
      if (sortMode === 'HP')
        return (
          (b.stats.find((s) => s.stat.name === 'hp')?.base_stat || 0) -
          (a.stats.find((s) => s.stat.name === 'hp')?.base_stat || 0)
        );
      if (sortMode === 'PODER') return b.base_experience - a.base_experience;
      if (sortMode === 'NOME') return a.name.localeCompare(b.name);
      return a.id - b.id;
    });

    return result;
  }, [detailedList, searchTerm, activeType, sortMode]);

  return {
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
  };
};
