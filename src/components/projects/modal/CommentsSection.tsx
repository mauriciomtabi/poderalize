import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageCircle, Send } from "lucide-react";
import { ProjectCard, Comment } from "@/types/projects";
import { useProjects } from "@/contexts/ProjectsContext";
import { generateId } from "@/hooks/useUuid";

interface CommentsSectionProps {
  card: ProjectCard;
}

export const CommentsSection = ({ card }: CommentsSectionProps) => {
  const { actions, state } = useProjects();
  const [newComment, setNewComment] = useState('');
  const currentUser = actions.getCurrentUser();

  const handleAddComment = () => {
    if (newComment.trim() && currentUser) {
      const comment: Comment = {
        id: generateId(),
        text: newComment.trim(),
        author: currentUser.id,
        authorName: currentUser.name,
        createdAt: new Date().toISOString(),
        mentions: []
      };

      actions.updateCard({
        ...card,
        comments: [...card.comments, comment]
      });
      actions.addActivity(card.id, 'comment', 'adicionou um comentário', { commentId: comment.id });

      setNewComment('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAddComment();
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'agora';
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    return date.toLocaleDateString('pt-BR');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <MessageCircle className="h-4 w-4" />
        <h3 className="font-medium">Comentários</h3>
        {card.comments.length > 0 && (
          <span className="text-sm text-muted-foreground">({card.comments.length})</span>
        )}
      </div>

      {/* Add new comment */}
      {currentUser && (
        <div className="flex gap-3" onClick={(e) => e.stopPropagation()}>
          <Avatar className="h-8 w-8">
            <AvatarImage src={currentUser.name} />
            <AvatarFallback className="text-xs">
              {currentUser.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-2">
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Escrever um comentário..."
              className="min-h-[80px] resize-none"
            />
            <div className="flex justify-end">
              <Button 
                onClick={(e) => { e.stopPropagation(); handleAddComment(); }}
                disabled={!newComment.trim()}
                size="sm"
              >
                <Send className="h-4 w-4 mr-2" />
                Comentar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Comments list */}
      <div className="space-y-4">
        {card.comments.map(comment => (
          <div key={comment.id} className="flex gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs">
                {comment.authorName.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">{comment.authorName}</span>
                <span className="text-xs text-muted-foreground">
                  {formatDate(comment.createdAt)}
                </span>
              </div>
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-sm whitespace-pre-wrap">{comment.text}</p>
              </div>
            </div>
          </div>
        ))}

        {card.comments.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Nenhum comentário ainda</p>
            <p className="text-xs">Seja o primeiro a comentar neste cartão</p>
          </div>
        )}
      </div>
    </div>
  );
};