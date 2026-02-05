import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import PokemonCard from '../src/components/PokemonCard';
import { PokemonBase, PokemonDetails } from '../src/types';
import * as pokeService from '../src/services/pokeService';

const mockPokemonBase: PokemonBase = {
  name: 'bulbasaur',
  url: 'https://pokeapi.co/api/v2/pokemon/1/',
};

const mockPokemonDetails: PokemonDetails = {
  id: 1,
  name: 'bulbasaur',
  types: [{ type: { name: 'grass' } }],
  sprites: {
    other: {
      'official-artwork': {
        front_default: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png',
      },
    },
  },
  abilities: [],
  stats: [],
  height: 7,
  weight: 69,
};

vi.mock('../src/services/pokeService', () => ({
  fetchPokemonDetails: vi.fn(),
}));

describe('PokemonCard', () => {
  it('renders loading state initially and then pokemon details', async () => {
    (pokeService.fetchPokemonDetails as vi.Mock).mockResolvedValue(mockPokemonDetails);

    const handleClick = vi.fn();
    render(<PokemonCard pokemon={mockPokemonBase} onClick={handleClick} />);

    expect(screen.getByRole('img', { name: /bulbasaur/i })).toBeInTheDocument;

    await waitFor(() => {
      expect(screen.getByText(/bulbasaur/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/#001/i)).toBeInTheDocument();
    expect(screen.getByText(/grass/i)).toBeInTheDocument();

    fireEvent.click(screen.getByText(/bulbasaur/i));
    expect(handleClick).toHaveBeenCalledWith(mockPokemonDetails);
  });
});
