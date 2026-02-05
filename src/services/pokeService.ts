import { PokemonBase, PokemonDetails } from '../types';

// URL do Gateway (ajuste conforme seu ambiente)
const GATEWAY_URL = process.env.NEXT_PUBLIC_GATEWAY_URL || 'https://pokedex-gateway-v1.onrender.com';

// Cache em memória para evitar requisições duplicadas
const detailsCache = new Map<string, PokemonDetails>();
const listCache = new Map<string, PokemonBase[]>();

// Controle de requisições em andamento (deduplicação)
const pendingRequests = new Map<string, Promise<any>>();

/**
 * Busca lista de Pokémon com suporte a paginação
 */
export const fetchPokemonList = async (limit: number = 151, offset: number = 0): Promise<PokemonBase[]> => {
  const cacheKey = `list-${limit}-${offset}`;
  
  // Retorna do cache se disponível
  if (listCache.has(cacheKey)) {
    return listCache.get(cacheKey)!;
  }

  // Retorna requisição em andamento se existir
  if (pendingRequests.has(cacheKey)) {
    return pendingRequests.get(cacheKey)!;
  }

  const requestPromise = (async () => {
    try {
      const response = await fetch(`${GATEWAY_URL}/pokemon?limit=${limit}&offset=${offset}`);
      if (!response.ok) {
        throw new Error('Failed to fetch pokemon list');
      }
      const data = await response.json();
      
      // Armazena no cache
      listCache.set(cacheKey, data);
      
      return data;
    } catch (error) {
      console.error("Error fetching pokemon list:", error);
      throw error;
    } finally {
      pendingRequests.delete(cacheKey);
    }
  })();

  pendingRequests.set(cacheKey, requestPromise);
  return requestPromise;
};

/**
 * Busca detalhes de um Pokémon específico
 */
export const fetchPokemonDetails = async (nameOrId: string | number): Promise<PokemonDetails> => {
  const cacheKey = String(nameOrId).toLowerCase();
  
  // Retorna do cache se disponível
  if (detailsCache.has(cacheKey)) {
    return detailsCache.get(cacheKey)!;
  }

  // Retorna requisição em andamento se existir
  if (pendingRequests.has(cacheKey)) {
    return pendingRequests.get(cacheKey)!;
  }

  const requestPromise = (async () => {
    try {
      const response = await fetch(`${GATEWAY_URL}/pokemon/${nameOrId}/details`);
      if (!response.ok) {
        throw new Error('Failed to fetch pokemon details');
      }
      const data = await response.json();
      
      // Armazena no cache
      detailsCache.set(cacheKey, data);
      
      return data;
    } catch (error) {
      console.error(`Error fetching pokemon ${nameOrId}:`, error);
      throw error;
    } finally {
      pendingRequests.delete(cacheKey);
    }
  })();

  pendingRequests.set(cacheKey, requestPromise);
  return requestPromise;
};

/**
 * Busca detalhes em lote (batch) com limite de concorrência
 */
export const fetchPokemonDetailsBatch = async (
  pokemon: PokemonBase[], 
  concurrencyLimit: number = 10
): Promise<PokemonDetails[]> => {
  const results: PokemonDetails[] = [];
  
  // Processa em lotes para evitar sobrecarga
  for (let i = 0; i < pokemon.length; i += concurrencyLimit) {
    const batch = pokemon.slice(i, i + concurrencyLimit);
    const batchResults = await Promise.all(
      batch.map(p => fetchPokemonDetails(p.name))
    );
    results.push(...batchResults);
  }
  
  return results;
};

/**
 * Pré-carrega detalhes de Pokémon de forma otimizada
 */
export const prefetchPokemonDetails = async (
  names: string[], 
  concurrencyLimit: number = 5
): Promise<void> => {
  // Filtra apenas os que não estão em cache
  const uncached = names.filter(name => !detailsCache.has(name.toLowerCase()));
  
  if (uncached.length === 0) return;

  // Carrega em segundo plano sem bloquear
  for (let i = 0; i < uncached.length; i += concurrencyLimit) {
    const batch = uncached.slice(i, i + concurrencyLimit);
    Promise.all(batch.map(name => fetchPokemonDetails(name))).catch(err => {
      console.warn('Prefetch error:', err);
    });
  }
};

/**
 * Limpa o cache (útil para desenvolvimento)
 */
export const clearCache = () => {
  detailsCache.clear();
  listCache.clear();
};

