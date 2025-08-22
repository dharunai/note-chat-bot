import { useState, createContext, useContext } from 'react';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const signUp = async (email: string, password: string) => {
    // For now, create a mock user since we don't have authentication backend
    // In a real app, this would make an API call to your authentication service
    setUser({ id: 'mock-user', email });
    
    toast({
      title: "Account Created",
      description: "Welcome to Note Bot AI!",
    });

    return { error: null };
  };

  const signIn = async (email: string, password: string) => {
    // Mock sign in
    setUser({ id: 'mock-user', email });
    
    toast({
      title: "Signed In",
      description: "Welcome back!",
    });

    return { error: null };
  };

  const signOut = async () => {
    setUser(null);
    toast({
      title: "Signed Out",
      description: "Come back soon!",
    });
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      signUp,
      signIn,
      signOut,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};