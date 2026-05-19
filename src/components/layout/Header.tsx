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

export const Header = ({ title }: HeaderProps) => {
  const { user, signOut } = useAuthContext();
  const { setMobileOpen } = useSidebarContext();
  const [profileOpen, setProfileOpen] = useState(false);
  
  return (
    <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border px-4 py-3 sm:px-6 h-16 flex items-center shrink-0">
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center space-x-4 flex-1 min-w-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen(true)}
            className="md:hidden flex-shrink-0"
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <h1 className="text-xl sm:text-2xl font-bold text-secondary tracking-tight">{title}</h1>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
          <NotificationsDropdown />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="flex items-center space-x-2 h-auto py-1 px-2 rounded-full hover:bg-accent">
                <Avatar className="w-8 h-8 ring-2 ring-background">
                  {user?.avatar_url ? (
                    <AvatarImage src={user.avatar_url} alt={user.full_name || 'Avatar'} />
                  ) : (
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
                      {getInitials(user?.full_name || user?.email || 'U')}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="hidden lg:flex flex-col items-start ml-2 text-left">
                  <span className="font-semibold text-sm leading-none text-secondary">
                    {user?.full_name || user?.email || 'Usuário'}
                  </span>
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1">
                    {user?.role === 'admin' ? 'Administrador' : user?.role === 'colaborador' ? 'Colaborador' : 'Pendente'}
                  </span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setProfileOpen(true)}>
                <User size={16} className="mr-2" />
                Meu Perfil
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={signOut} className="text-destructive focus:text-destructive">
                <LogOut size={16} className="mr-2" />
                Sair do sistema
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <ProfileDialog open={profileOpen} onOpenChange={setProfileOpen} />
        </div>
      </div>
    </header>
  );
};
