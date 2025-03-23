"use client";

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

// Interface para o usuário autenticado
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  image?: string;
}

// Interface para o resultado do token decodificado
interface DecodedToken {
  id: string;
  name: string;
  email: string;
  role: string;
  image?: string;
  exp: number;
  [key: string]: unknown; // Para outras propriedades que possam existir
}

// Interface para o contexto de autenticação
interface AuthContextType {
  user: AuthUser | null;
  accessToken: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
  isAuthenticated: boolean;
}

// Criar o contexto de autenticação
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Tempo (em ms) antes da expiração para tentar renovar o token
const TOKEN_REFRESH_MARGIN = 5 * 60 * 1000; // 5 minutos

// Provider de autenticação para envolver a aplicação
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [tokenExpiryTime, setTokenExpiryTime] = useState<number | null>(null);
  const router = useRouter();

  // Função para decodificar o payload do token JWT
  const decodeToken = (token: string): DecodedToken | null => {
    try {
      console.log("Decodificando token:", token.substring(0, 20) + "...");
      const base64Url = token.split('.')[1];
      if (!base64Url) {
        console.error("Token inválido: não contém payload");
        return null;
      }

      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        window.atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );

      const decoded = JSON.parse(jsonPayload) as DecodedToken;
      console.log("Token decodificado:", decoded);
      return decoded;
    } catch (error) {
      console.error('Erro ao decodificar token:', error);
      return null;
    }
  };

  // Função para definir o token e extrair informações do usuário
  const setToken = (token: string) => {
    console.log("Definindo token...");
    setAccessToken(token);
    localStorage.setItem('accessToken', token);

    const decoded = decodeToken(token);
    if (decoded) {
      // Em nosso caso, o payload contém diretamente os dados do usuário
      setUser({
        id: decoded.id,
        name: decoded.name,
        email: decoded.email,
        role: decoded.role,
        image: decoded.image
      });

      // Armazenar quando o token expira (convertendo de segundos para milissegundos)
      const expiryTime = decoded.exp * 1000;
      console.log("Token expira em:", new Date(expiryTime).toLocaleString());
      setTokenExpiryTime(expiryTime);
    }
  };

  // Função para fazer login
  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);
      console.log("Tentando login com email:", email);

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log("Resposta do login:", data);

      if (!response.ok) {
        console.error("Falha no login:", data.error);
        return { success: false, error: data.error || 'Erro ao fazer login' };
      }

      console.log("Login bem-sucedido, dados do usuário:", data.user);
      setToken(data.accessToken);
      setUser(data.user);

      return { success: true };
    } catch (error) {
      console.error('Erro completo no login:', error);
      return { success: false, error: 'Ocorreu um erro ao processar o login' };
    } finally {
      setLoading(false);
    }
  };

  // Função para atualizar o token
  const refreshToken = async (): Promise<boolean> => {
    try {
      console.log("Atualizando token...");
      const response = await fetch('/api/auth/refresh', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.error("Falha ao renovar token:", await response.text());
        throw new Error('Falha ao atualizar token');
      }

      const data = await response.json();
      console.log("Token renovado com sucesso");
      setToken(data.accessToken);
      return true;
    } catch (error) {
      console.error('Erro completo ao atualizar token:', error);
      // Em caso de falha na atualização, fazer logout
      await logout();
      return false;
    }
  };

  // Função para fazer logout
  const logout = async (): Promise<void> => {
    try {
      console.log("Fazendo logout...");
      // Chamar a API de logout para invalidar o token no servidor
      if (accessToken) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        });
        console.log("Logout no servidor concluído");
      }
    } catch (error) {
      console.error('Erro ao fazer logout no servidor:', error);
    } finally {
      // Limpar dados locais independentemente da resposta do servidor
      console.log("Limpando dados de autenticação local");
      setUser(null);
      setAccessToken(null);
      setTokenExpiryTime(null);
      localStorage.removeItem('accessToken');
      router.push('/login');
    }
  };

  // Verificar o token armazenado ao inicializar
  useEffect(() => {
    const initAuth = async () => {
      setLoading(true);
      console.log("Inicializando autenticação...");
      const storedToken = localStorage.getItem('accessToken');

      if (storedToken) {
        console.log("Token encontrado no armazenamento local");
        const decoded = decodeToken(storedToken);

        if (decoded) {
          const now = Date.now();
          const expiryTime = decoded.exp * 1000;
          console.log("Hora atual:", new Date(now).toLocaleString());
          console.log("Expiração do token:", new Date(expiryTime).toLocaleString());

          // Se o token ainda é válido
          if (expiryTime > now) {
            console.log("Token ainda é válido, utilizando-o");
            setToken(storedToken);
            setLoading(false);
            return;
          } else {
            console.log("Token expirado, tentando renovar");
          }
        } else {
          console.log("Token não pôde ser decodificado");
        }

        // Token inválido ou expirado, tentar renovar
        console.log("Tentando renovar token...");
        const refreshed = await refreshToken();
        if (!refreshed) {
          console.log("Falha ao renovar token, redirecionando para login");
          router.push('/login');
        } else {
          console.log("Token renovado com sucesso");
        }
      } else {
        console.log("Nenhum token encontrado no armazenamento local");
      }

      setLoading(false);
    };

    initAuth();
  }, [router]);

  // Configurar renovação automática do token antes de expirar
  useEffect(() => {
    if (!accessToken || !tokenExpiryTime) {
      console.log("Token ou tempo de expiração não definidos, não configurando renovação automática");
      return;
    }

    const now = Date.now();
    const timeUntilRefresh = tokenExpiryTime - now - TOKEN_REFRESH_MARGIN;
    console.log(`Configurando renovação automática do token em ${timeUntilRefresh / 1000} segundos`);

    if (timeUntilRefresh <= 0) {
      // Token já está próximo de expirar, renovar imediatamente
      console.log("Token próximo de expirar, renovando imediatamente");
      refreshToken();
      return;
    }

    // Configurar timer para renovar o token antes de expirar
    console.log(`Token será renovado em ${new Date(now + timeUntilRefresh).toLocaleString()}`);
    const refreshTimer = setTimeout(() => {
      console.log("Temporizador disparado, renovando token");
      refreshToken();
    }, timeUntilRefresh);

    return () => {
      console.log("Limpando temporizador de renovação do token");
      clearTimeout(refreshTimer);
    };
  }, [accessToken, tokenExpiryTime]);

  const contextValue = {
    user,
    accessToken,
    loading,
    login,
    logout,
    refreshToken,
    isAuthenticated: !!user,
  };

  console.log("Estado atual da autenticação:", {
    isAuthenticated: !!user,
    userEmail: user?.email,
    tokenPresent: !!accessToken,
    loading
  });

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook para usar o contexto de autenticação
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}
