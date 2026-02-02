import { PokemonDetails } from "../types";

const GATEWAY_URL = process.env.NEXT_PUBLIC_GATEWAY_URL || 'https://pokedex-gateway-v1.onrender.com';

export const getProfessorInsight = async (pokemon: PokemonDetails): Promise<string> => {
  try {
    // Chamamos a rota específica de insight criada no Gateway
    const response = await fetch(`${GATEWAY_URL}/pokemon/${pokemon.name}/insight`);

    if (!response.ok) {
      throw new Error(`Gateway returned status: ${response.status}`);
    }

    const data = await response.json();
    
    // Assume que a API retorna um objeto { insight: "Texto..." }
    return data.text;

  } catch (error) {
    console.error("Gateway Error:", error);
    // Mantém a mensagem de fallback original
    return "O Professor Carvalho está ocupado no laboratório agora. Por favor, volte mais tarde!";
  }
};