import { useState } from "react";
import { User, LogOut, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuthContext } from "@/contexts/AuthContext";
import { NotificationsDropdown } from "./NotificationsDropdown";
import { ProfileDialog } from "./ProfileDialog";
import { getInitials } from "@/lib/utils";
import { useSidebarContext } from "./Layout";
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
  const { setMobileOpen } = useSidebarContext();
  const [profileOpen, setProfileOpen] = useState(false);
  
  const handleSignOut = () => {
    signOut();
  };
  return <header className="bg-card border-b border-border px-3 py-3 sm:px-4 sm:py-3 md:px-6 md:py-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center space-x-2 sm:space-x-4 flex-1 min-w-0">
          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen(true)}
            className="md:hidden flex-shrink-0"
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground truncate">{title}</h1>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
          {/* Notifications */}
          <NotificationsDropdown />

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                <Avatar className="w-7 h-7 sm:w-8 sm:h-8">
                  {user?.avatar_url ? (
                    <AvatarImage src={user.avatar_url} alt={user.full_name || 'Avatar'} />
                  ) : (
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {getInitials(user?.full_name || user?.email || 'U')}
                    </AvatarFallback>
                  )}
                </Avatar>
                <span className="font-medium hidden md:inline">{user?.full_name || user?.email || 'Usuário'}</span>
                <Badge variant="outline" className="text-xs hidden md:inline-flex">
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