import { createContext, useContext, ReactNode } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { type User } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: ReturnType<typeof useLoginMutation>["mutate"];
  register: ReturnType<typeof useRegisterMutation>["mutate"];
  logout: ReturnType<typeof useLogoutMutation>["mutate"];
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useQuery({
    queryKey: [api.auth.check.path],
    queryFn: async () => {
      const res = await fetch(api.auth.check.path, { credentials: "include" });
      if (res.status === 401) return null;
      if (!res.ok) throw new Error("Failed to check auth");
      return res.json() as Promise<User>;
    },
    retry: false,
  });

  const loginMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch(api.auth.login.path, {
        method: api.auth.login.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Login failed");
      }
      return res.json() as Promise<User>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.auth.check.path] });
      toast({ title: "Welcome back", description: "Successfully logged in." });
    },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const registerMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch(api.auth.register.path, {
        method: api.auth.register.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Registration failed");
      }
      return res.json() as Promise<User>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.auth.check.path] });
      toast({ title: "Welcome to Zest", description: "Your account has been created." });
    },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await fetch(api.auth.logout.path, { method: api.auth.logout.method, credentials: "include" });
    },
    onSuccess: () => {
      queryClient.setQueryData([api.auth.check.path], null);
      queryClient.clear();
      toast({ title: "Goodbye", description: "You have been logged out." });
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user: user || null,
        isLoading,
        login: loginMutation.mutate,
        register: registerMutation.mutate,
        logout: logoutMutation.mutate,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}

// Separate mutation hook factories for internal types
function useLoginMutation() { return useMutation({ mutationFn: async () => {} }); }
function useRegisterMutation() { return useMutation({ mutationFn: async () => {} }); }
function useLogoutMutation() { return useMutation({ mutationFn: async () => {} }); }
