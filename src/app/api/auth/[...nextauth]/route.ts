import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { executeQuery } from "@/lib/db/sqlserver";
import bcrypt from "bcryptjs";

// Tipo para o usuário retornado do banco de dados
interface DatabaseUser {
  id: number;
  name: string;
  email: string;
  password: string;
  image_url?: string;
  role: string;
  created_at?: Date;
  updated_at?: Date;
}

// Função auxiliar para obter usuário por email
async function getUserByEmail(email: string): Promise<DatabaseUser | null> {
  try {
    const query = `
      SELECT id, name, email, password, image_url, role
      FROM Users
      WHERE email = @param0
    `;

    const users = await executeQuery(query, [email]);
    return users.length > 0 ? users[0] as DatabaseUser : null;
  } catch (error) {
    console.error("Database error when fetching user:", error);
    return null;
  }
}

// Função para comparar senha
async function verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(plainPassword, hashedPassword);
  } catch (error) {
    console.error("Error comparing passwords:", error);
    return false;
  }
}

// Configuração do NextAuth
const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            console.log("Missing credentials");
            return null;
          }

          console.log(`Login attempt for: ${credentials.email}`);

          const user = await getUserByEmail(credentials.email);

          if (!user) {
            console.log(`User not found: ${credentials.email}`);
            return null;
          }

          const isPasswordValid = await verifyPassword(
            credentials.password,
            user.password
          );

          if (!isPasswordValid) {
            console.log(`Invalid password for user: ${credentials.email}`);
            return null;
          }

          console.log(`User authenticated successfully: ${user.name}`);

          return {
            id: user.id.toString(),
            name: user.name,
            email: user.email,
            image: user.image_url,
            role: user.role,
          };
        } catch (error) {
          console.error("Error in authorize function:", error);
          return null;
        }
      },
    }),
  ],

  pages: {
    signIn: "/login",
    error: "/login",
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },

    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 dias
  },

  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
});

export { handler as GET, handler as POST };
