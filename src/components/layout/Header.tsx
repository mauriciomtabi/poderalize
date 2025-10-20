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
  return <header className="sticky top-0 z-50 bg-gradient-secondary text-secondary-foreground border-b border-border px-3 py-3 landscape:py-1 sm:px-4 sm:py-3 md:px-6 md:py-4">
      <div className="flex items-center justify-between gap-2 landscape:gap-1">
        <div className="flex items-center space-x-2 landscape:space-x-1 sm:space-x-4 flex-1 min-w-0">
          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen(true)}
            className="md:hidden flex-shrink-0 h-8 w-8 landscape:h-6 landscape:w-6"
          >
            <Menu className="h-5 w-5 landscape:h-4 landscape:w-4" />
          </Button>
          
          <h1 className="text-xl landscape:text-lg sm:text-2xl md:text-3xl font-bold text-primary">{title}</h1>
        </div>

        <div className="flex items-center space-x-2 landscape:space-x-1 sm:space-x-4 flex-shrink-0">
          {/* Notifications */}
          <NotificationsDropdown />

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="flex items-center space-x-2 landscape:space-x-1 h-auto py-1 landscape:py-0.5">
                <Avatar className="w-7 h-7 landscape:w-6 landscape:h-6 sm:w-8 sm:h-8">
                  {user?.avatar_url ? (
                    <AvatarImage src={user.avatar_url} alt={user.full_name || 'Avatar'} />
                  ) : (
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs landscape:text-[10px]">
                      {getInitials(user?.full_name || user?.email || 'U')}
                    </AvatarFallback>
                  )}
                </Avatar>
                <span className="font-medium hidden md:inline text-sm landscape:text-xs">{user?.full_name || user?.email || 'Usuário'}</span>
                <Badge variant="outline" className="text-xs landscape:text-[10px] landscape:px-1 landscape:py-0 hidden md:inline-flex">
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