"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import {
  LayoutDashboard,
  ClipboardList,
  ArrowDownCircle,
  ArrowUpCircle,
  History,
  User,
  LogOut,
  Notebook,
  PackagePlus,
  PackageMinus,
  Clock,
  Database,
  Settings,
  Users,
  ShieldAlert,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Company logo component
const Logo = () => (
  <div className="flex items-center gap-2 px-2 py-4 border-b">
    <div className="w-10 h-10 bg-green-500 rounded-md flex items-center justify-center text-white">
      <div className="w-6 h-6">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
          <path d="M3 8H21" stroke="currentColor" strokeWidth="2" />
          <path d="M8 8V21" stroke="currentColor" strokeWidth="2" />
          <path d="M6 13H10" stroke="currentColor" strokeWidth="2" />
          <path d="M6 17H10" stroke="currentColor" strokeWidth="2" />
          <path d="M14 13H18" stroke="currentColor" strokeWidth="2" />
          <path d="M14 17H18" stroke="currentColor" strokeWidth="2" />
        </svg>
      </div>
    </div>
    <div>
      <div className="font-bold text-sm">Estoque</div>
      <div className="text-xs text-gray-500">Sistema Inteligente</div>
    </div>
  </div>
);

// Navigation item component
const NavItem = ({
  href,
  icon: Icon,
  label,
  isActive,
}: {
  href: string;
  icon: React.ElementType;
  label: string;
  isActive: boolean;
}) => (
  <Link href={href} className={`flex items-center gap-3 px-3 py-2 rounded-md ${
    isActive
      ? "bg-gray-100"
      : "hover:bg-gray-100"
  }`}>
    <Icon
      size={20}
      className={isActive
        ? "text-blue-600"
        : "text-gray-500"
      }
    />
    <span className={isActive
      ? "font-medium"
      : "text-gray-700"
    }>
      {label}
    </span>
  </Link>
);

// User profile component
const UserProfile = () => {
  const { user, logout } = useAuth();

  const userEmail = user?.email || "usuário";
  const userName = user?.name || "Usuário";
  const userImage = user?.image;

  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="p-4 border-t flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Avatar className="w-8 h-8">
          <AvatarImage src={userImage || ""} alt={userName} />
          <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="text-xs">
          <div className="font-medium">{userName}</div>
          <div className="text-gray-500 text-xs">{userEmail}</div>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <Link
          href="/perfil"
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600"
        >
          <Settings size={16} />
          <span>Perfil</span>
        </Link>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700"
        >
          <LogOut size={16} />
          <span>Sair</span>
        </button>
      </div>
    </div>
  );
};

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const isManager = user?.role === "manager" || isAdmin;

  // Base navigation items (available to all users)
  const baseNavigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Cadastros", href: "/cadastros", icon: Notebook },
    { name: "Entrada", href: "/entrada", icon: PackagePlus },
    { name: "Saída", href: "/saida", icon: PackageMinus },
    { name: "Histórico", href: "/historico", icon: Clock },
  ];

  // Technical navigation items (available to managers and admins)
  const technicalNavigation = [
    { name: "Banco de Dados", href: "/database", icon: Database },
  ];

  // Admin navigation items (only available to admins)
  const adminNavigation = [
    { name: "Gerenciar Usuários", href: "/admin/users", icon: Users },
  ];

  // Combine navigation items based on user role
  const navigation = [
    ...baseNavigation,
    ...(isManager ? technicalNavigation : []),
    ...(isAdmin ? adminNavigation : []),
  ];

  return (
    <div className="w-56 h-full border-r bg-white flex flex-col">
      <Logo />

      <div className="py-4 flex flex-col gap-1">
        {navigation.map((item) => (
          <NavItem
            key={item.name}
            href={item.href}
            icon={item.icon}
            label={item.name}
            isActive={pathname === item.href}
          />
        ))}
      </div>

      {isAdmin && (
        <div className="mt-2 px-3">
          <div className="flex items-center gap-1 text-xs text-red-500 font-medium mb-1">
            <ShieldAlert size={14} />
            <span>Área Administrativa</span>
          </div>
        </div>
      )}

      <div className="mt-auto">
        <UserProfile />
      </div>
    </div>
  );
}
