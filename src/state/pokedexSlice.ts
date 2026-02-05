import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { PokemonBase, PokemonDetails } from '../types';
import { fetchPokemonList, fetchPokemonDetailsBatch } from '../services/pokeService';

export const PAGE_SIZE = 30;
export const INITIAL_LOAD = 30;

interface PokedexState {
  pokemonList: PokemonBase[];
  detailedList: PokemonDetails[];
  loadingInitial: boolean;
  loadingMore: boolean;
  currentPage: number;
  hasMore: boolean;
  descriptionsCache: Record<string, string>;
  error: string | null;
}

const initialState: PokedexState = {
  pokemonList: [],
  detailedList: [],
  loadingInitial: false,
  loadingMore: false,
  currentPage: 0,
  hasMore: true,
  descriptionsCache: {},
  error: null,
};

export const loadInitialPokemon = createAsyncThunk(
  'pokedex/loadInitial',
  async () => {
    const baseData = await fetchPokemonList(INITIAL_LOAD, 0);
    const detailed = await fetchPokemonDetailsBatch(baseData, 10);

    const hasMore = baseData.length === INITIAL_LOAD;

    return {
      baseData,
      detailed,
      hasMore,
    };
  }
);

export const loadMorePokemon = createAsyncThunk(
  'pokedex/loadMore',
  async ({ nextPage }: { nextPage: number }) => {
    const offset = INITIAL_LOAD + (nextPage - 1) * PAGE_SIZE;
    const baseData = await fetchPokemonList(PAGE_SIZE, offset);

    if (baseData.length === 0) {
      return {
        baseData,
        detailed: [] as PokemonDetails[],
        nextPage: nextPage - 1,
        hasMore: false,
      };
    }

    const detailed = await fetchPokemonDetailsBatch(baseData, 10);

    return {
      baseData,
      detailed,
      nextPage,
      hasMore: baseData.length === PAGE_SIZE,
    };
  }
);

const pokedexSlice = createSlice({
  name: 'pokedex',
  initialState,
  reducers: {
    setDescriptionCacheEntry(
      state,
      action: PayloadAction<{ name: string; text: string }>
    ) {
      const { name, text } = action.payload;
      state.descriptionsCache[name] = text;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadInitialPokemon.pending, (state) => {
        state.loadingInitial = true;
        state.error = null;
      })
      .addCase(loadInitialPokemon.fulfilled, (state, action) => {
        state.loadingInitial = false;
        state.pokemonList = action.payload.baseData;
        state.detailedList = action.payload.detailed;
        state.hasMore = action.payload.hasMore;
        state.currentPage = 0;
      })
      .addCase(loadInitialPokemon.rejected, (state, action) => {
        state.loadingInitial = false;
        state.error = action.error.message || 'Erro ao carregar Pokémon.';
      })
      .addCase(loadMorePokemon.pending, (state) => {
        state.loadingMore = true;
        state.error = null;
      })
      .addCase(loadMorePokemon.fulfilled, (state, action) => {
        state.loadingMore = false;

        state.pokemonList = [...state.pokemonList, ...action.payload.baseData];
        state.detailedList = [
          ...state.detailedList,
          ...action.payload.detailed,
        ];

        state.currentPage = action.payload.nextPage;
        state.hasMore = action.payload.hasMore;
      })
      .addCase(loadMorePokemon.rejected, (state, action) => {
        state.loadingMore = false;
        state.error = action.error.message || 'Erro ao carregar mais Pokémon.';
      });
  },
});

export const { setDescriptionCacheEntry } = pokedexSlice.actions;

export default pokedexSlice.reducer;

