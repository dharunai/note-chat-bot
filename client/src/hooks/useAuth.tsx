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
    setLoading(true);
    try {
      // For now, create a mock user since we don't have authentication backend
      // In a real app, this would make an API call to your authentication service
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      setUser({ id: 'mock-user', email });
      toast({
        title: "Account Created",
        description: "Welcome to Note Bot AI!",
      });
      return { error: null };
    } catch (error) {
      toast({
        title: "Error creating account",
        description: "Please try again.",
        variant: "destructive",
      });
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      // Mock sign in
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      setUser({ id: 'mock-user', email });
      toast({
        title: "Signed In",
        description: "Welcome back!",
      });
      return { error: null };
    } catch (error) {
      toast({
        title: "Error signing in",
        description: "Please check your credentials and try again.",
        variant: "destructive",
      });
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate logout delay
      setUser(null);
      toast({
        title: "Signed Out",
        description: "Come back soon!",
      });
    } catch (error) {
      toast({
        title: "Error signing out",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
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