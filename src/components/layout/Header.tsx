import { Search, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuthContext } from "@/contexts/AuthContext";
import { NotificationsDropdown } from "./NotificationsDropdown";
interface HeaderProps {
  title: string;
}
export const Header = ({
  title
}: HeaderProps) => {
  const {
    user,
    signOut
  } = useAuthContext();
  const handleSignOut = () => {
    signOut();
  };
  return <header className="bg-card border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-foreground">{title}</h1>
        </div>

        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
            <Input placeholder="Buscar..." className="pl-9 w-64 bg-background" />
          </div>

          {/* Notifications */}
          <NotificationsDropdown />

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <User size={16} className="text-primary-foreground" />
                </div>
                <span className="font-medium">{user?.full_name || user?.email || 'Usuário'}</span>
                <Badge variant="outline" className="text-xs">
                  {user?.role === 'admin' ? 'Admin' : user?.role === 'colaborador' ? 'Colaborador' : 'Pendente'}
                </Badge>
              </Button>
            </DropdownMenuTrigger>
            
          </DropdownMenu>
        </div>
      </div>
    </header>;
};