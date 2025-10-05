import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageCircle, Send, User, Users } from "lucide-react";
import { ProjectCard, Comment } from "@/types/projects";
import { useProjects } from "@/contexts/ProjectsContext";
import { useClientes } from "@/hooks/useClientes";
import { generateId } from "@/hooks/useUuid";
import { MentionTextarea } from "./MentionTextarea";
import { Badge } from "@/components/ui/badge";

interface CommentsSectionProps {
  card?: ProjectCard;
  comments?: Comment[];
  onCommentsChange?: (comments: Comment[]) => void;
  isCreationMode?: boolean;
}

export const CommentsSection = ({ 
  card, 
  comments, 
  onCommentsChange,
  isCreationMode = false 
}: CommentsSectionProps) => {
  const { actions, state } = useProjects();
  const { clientes } = useClientes();
  const [newComment, setNewComment] = useState('');
  const [mentions, setMentions] = useState<string[]>([]);
  const currentUser = actions.getCurrentUser();
  
  // Use either card comments or provided comments
  const currentComments = isCreationMode ? (comments || []) : (card?.comments || []);
  
  // Get board members
  const boardMembers = state.currentBoard?.members || [];

  const handleAddComment = () => {
    if (newComment.trim() && currentUser) {
      const comment: Comment = {
        id: generateId(),
        text: newComment.trim(),
        author: currentUser.id,
        authorName: currentUser.name,
        createdAt: new Date().toISOString(),
        mentions: mentions
      };

      if (isCreationMode && onCommentsChange) {
        onCommentsChange([...currentComments, comment]);
      } else if (card) {
        actions.updateCard({
          ...card,
          comments: [...card.comments, comment]
        });
        actions.addActivity(card.id, 'comment', 'adicionou um comentário', { commentId: comment.id });
      }

      setNewComment('');
      setMentions([]);
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

  // Format comment text with mentions highlighted
  const formatCommentText = (text: string, commentMentions: string[]) => {
    const parts: (string | JSX.Element)[] = [];
    let lastIndex = 0;
    const mentionRegex = /@\[([^\]]+)\]\(([^:]+):([^)]+)\)/g;
    let match;

    while ((match = mentionRegex.exec(text)) !== null) {
      // Add text before mention
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }

      const name = match[1];
      const id = match[2];
      const type = match[3];

      // Add mention as badge
      parts.push(
        <Badge 
          key={`mention-${match.index}`}
          variant="secondary" 
          className="mx-1 font-normal"
        >
          {type === 'member' ? <User className="h-3 w-3 mr-1" /> : <Users className="h-3 w-3 mr-1" />}
          {name}
        </Badge>
      );

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return parts.length > 0 ? parts : text;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <MessageCircle className="h-4 w-4" />
        <h3 className="font-medium">Comentários</h3>
        {currentComments.length > 0 && (
          <span className="text-sm text-muted-foreground">({currentComments.length})</span>
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
            <MentionTextarea
              value={newComment}
              onChange={setNewComment}
              onMentionsChange={setMentions}
              onKeyDown={handleKeyDown}
              placeholder="Escrever um comentário... (use @ para mencionar)"
              members={boardMembers}
              clientes={clientes}
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
        {currentComments.map(comment => (
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
                <p className="text-sm whitespace-pre-wrap flex flex-wrap items-center gap-1">
                  {formatCommentText(comment.text, comment.mentions)}
                </p>
              </div>
            </div>
          </div>
        ))}

        {currentComments.length === 0 && (
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