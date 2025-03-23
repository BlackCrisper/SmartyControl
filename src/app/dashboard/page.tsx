"use client";

import { useState, useEffect } from "react";
import AdminDashboard from "@/components/admin-dashboard";
import ManagerDashboard from "@/components/manager-dashboard";
import UserDashboard from "@/components/user-dashboard";
import { useAuth } from "@/hooks/use-auth";

export default function Dashboard() {
  const { user, loading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [companyName, setCompanyName] = useState("Sistema de Controle de Estoque");

  useEffect(() => {
    // In a real app, you might fetch company details from an API
    if (!loading) {
      setIsLoading(false);
    }
  }, [loading]);

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Carregando...</div>;
  }

  // Render different dashboards based on user role
  if (user?.role === "admin") {
    return <AdminDashboard companyName={companyName} />;
  } else if (user?.role === "manager") {
    return <ManagerDashboard companyName={companyName} />;
  } else {
    return <UserDashboard companyName={companyName} />;
  }
}
