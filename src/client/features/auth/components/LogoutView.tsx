import { useMutation } from "@tanstack/react-query";
import { useEffect } from "react";
import { useLocation } from "wouter";
import * as authService from "../auth.service";

export const LogoutView = () => {
  const [, setLocation] = useLocation();

  const logoutMutation = useMutation({
    mutationFn: authService.logout,
    onSuccess: () => {
      setLocation("/login");
    },
    onError: (error) => {
      console.error("Logout error:", error);
      // Redirect to login anyway
      setLocation("/login");
    },
  });

  useEffect(() => {
    logoutMutation.mutate();
  }, []);

  return (
    <div className="hero min-h-screen bg-base-200">
      <div className="hero-content text-center">
        <div className="max-w-md">
          <div className="loading loading-spinner loading-lg"></div>
          <p className="mt-4">Logging out...</p>
        </div>
      </div>
    </div>
  );
};
