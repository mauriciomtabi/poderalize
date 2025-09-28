import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Activity, Clock } from "lucide-react";
import { ProjectCard } from "@/types/projects";
import { useProjects } from "@/contexts/ProjectsContext";
import { useState, useEffect } from "react";

interface ActivityHistoryProps {
  card: ProjectCard;
}

export const ActivityHistory = ({ card }: ActivityHistoryProps) => {
  const { actions } = useProjects();
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadActivities = async () => {
      setLoading(true);
      const cardActivities = await actions.loadCardActivities(card.id);
      setActivities(cardActivities);
      setLoading(false);
    };
    
    loadActivities();
  }, [card.id, actions]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'agora';
    if (diffInMinutes < 60) return `${diffInMinutes} minutos atrás`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} horas atrás`;
    if (diffInMinutes < 43200) return `${Math.floor(diffInMinutes / 1440)} dias atrás`;
    
    return date.toLocaleDateString('pt-BR', {
      day: 'numeric',
      month: 'short',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'create':
        return '➕';
      case 'update':
        return '✏️';
      case 'move':
        return '🔀';
      case 'comment':
        return '💬';
      case 'assign':
        return '👥';
      case 'due_date':
        return '📅';
      case 'complete':
        return '✅';
      case 'attachment':
        return '📎';
      case 'checklist':
        return '☑️';
      case 'archive':
        return '📦';
      default:
        return '📝';
    }
  };

  // Activities are now loaded from the database

  return (
    <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
      <div className="flex items-center gap-2">
        <Activity className="h-4 w-4" />
        <h3 className="font-medium">Atividades</h3>
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-6 text-muted-foreground">
            <Activity className="h-8 w-8 mx-auto mb-2 opacity-50 animate-spin" />
            <p className="text-sm">Carregando atividades...</p>
          </div>
        ) : activities.map(activity => (
          <div key={activity.id} className="flex gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-sm">
              {getActivityIcon(activity.type)}
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <span className="font-medium text-sm">{activity.author_name}</span>
                  <span className="text-sm ml-1">{activity.description}</span>
                </div>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatDate(activity.created_at)}
                </span>
              </div>
              {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                <div className="text-xs text-muted-foreground">
                  {JSON.stringify(activity.metadata)}
                </div>
              )}
            </div>
          </div>
        ))}

        {!loading && activities.length === 0 && (
          <div className="text-center py-6 text-muted-foreground">
            <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Nenhuma atividade registrada</p>
          </div>
        )}
      </div>
    </div>
  );
};