import jwt from 'jsonwebtoken';

// Tipos para payloads de token
export interface TokenPayload {
  id: string;
  email: string;
  name: string;
  role: string;
  image?: string;
}

export interface RefreshTokenPayload {
  id: string;
  tokenVersion: number;
}

// Usar a variável de ambiente definida em Next Auth ou definir uma própria
const JWT_SECRET = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET || 'seu_segredo_jwt_super_secreto';

// Configuração das durações dos tokens
const ACCESS_TOKEN_EXPIRY = '2h';         // Token de acesso: 2 horas
const REFRESH_TOKEN_EXPIRY = '30d';       // Token de atualização: 30 dias

/**
 * Gera um token de acesso JWT contendo informações do usuário
 *
 * @param payload Dados do usuário a serem incluídos no token
 * @returns Token JWT assinado
 */
export function generateAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRY
  });
}

/**
 * Gera um token de atualização para permitir a renovação de tokens de acesso
 * sem exigir nova autenticação
 *
 * @param payload Dados mínimos para identificar o usuário
 * @returns Token JWT assinado com validade mais longa
 */
export function generateRefreshToken(payload: RefreshTokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRY
  });
}

/**
 * Verifica e decodifica um token JWT
 *
 * @param token Token JWT a ser verificado
 * @returns Payload decodificado ou null se inválido
 */
export function verifyToken<T>(token: string): T | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as T;
    return decoded;
  } catch (error) {
    console.error('Erro ao verificar token JWT:', error);
    return null;
  }
}

/**
 * Função para extrair informações do usuário de um token
 *
 * @param token Token JWT completo para extrair informações do usuário
 * @returns Informações do usuário ou null se o token for inválido
 */
export function extractUserFromToken(token: string): TokenPayload | null {
  return verifyToken<TokenPayload>(token);
}
