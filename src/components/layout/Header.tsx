import { useState } from "react";
import { Search, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuthContext } from "@/contexts/AuthContext";
import { NotificationsDropdown } from "./NotificationsDropdown";
import { ProfileDialog } from "./ProfileDialog";
import { getInitials } from "@/lib/utils";
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
  const [profileOpen, setProfileOpen] = useState(false);
  
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
                <Avatar className="w-8 h-8">
                  {user?.avatar_url ? (
                    <AvatarImage src={user.avatar_url} alt={user.full_name || 'Avatar'} />
                  ) : (
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {getInitials(user?.full_name || user?.email || 'U')}
                    </AvatarFallback>
                  )}
                </Avatar>
                <span className="font-medium">{user?.full_name || user?.email || 'Usuário'}</span>
                <Badge variant="outline" className="text-xs">
                  {user?.role === 'admin' ? 'Admin' : user?.role === 'colaborador' ? 'Colaborador' : 'Pendente'}
                </Badge>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setProfileOpen(true)}>
                <User size={16} className="mr-2" />
                Perfil
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                <LogOut size={16} className="mr-2" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          {/* Profile Dialog */}
          <ProfileDialog open={profileOpen} onOpenChange={setProfileOpen} />
        </div>
      </div>
    </header>;
};