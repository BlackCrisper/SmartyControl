import * as argon2 from 'argon2';

/**
 * Options para o algoritmo Argon2
 * Ajustando para balancear segurança e desempenho
 */
const argon2Options = {
  // Argon2id (recomendado para senhas)
  type: argon2.argon2id,
  // Memória: 65536 KiB (64 MB)
  memoryCost: 65536,
  // Iterações: 3
  timeCost: 3,
  // Paralelismo: 4 threads
  parallelism: 4,
  // Tamanho do hash: 32 bytes
  hashLength: 32
};

/**
 * Gera um hash seguro usando Argon2id para uma senha
 *
 * @param password A senha em texto plano para gerar o hash
 * @returns A senha com hash no formato Argon2
 */
export async function hashPassword(password: string): Promise<string> {
  try {
    // O salt é gerado automaticamente pelo Argon2
    return await argon2.hash(password, argon2Options);
  } catch (error) {
    console.error('Erro ao gerar hash da senha:', error);
    throw new Error('Falha ao criptografar senha');
  }
}

/**
 * Verifica se uma senha corresponde a um hash existente
 *
 * @param password Senha em texto plano a ser verificada
 * @param hashedPassword Hash armazenado para comparação
 * @returns Booleano indicando se a senha está correta
 */
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  try {
    return await argon2.verify(hashedPassword, password);
  } catch (error) {
    console.error('Erro ao verificar senha:', error);
    return false;
  }
}
