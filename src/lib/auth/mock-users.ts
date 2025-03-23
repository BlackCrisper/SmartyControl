// This is a mock users database for demonstration purposes
// In a real app, you would store users in a database

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  image: string;
  role?: string;
}

// Mock user data for testing
export const users: User[] = [
  {
    id: "1",
    name: "Admin User",
    email: "blackcrisper@gmail.com",
    password: "admin", // Note: In production, this would be hashed
    image: "https://ui-avatars.com/api/?name=Admin+User&background=0D8ABC&color=fff",
    role: "admin"
  },
  {
    id: "2",
    name: "Test User",
    email: "test@example.com",
    password: "password123", // Note: In production, this would be hashed
    image: "https://ui-avatars.com/api/?name=Test+User&background=BC0D3A&color=fff",
    role: "user"
  }
];
