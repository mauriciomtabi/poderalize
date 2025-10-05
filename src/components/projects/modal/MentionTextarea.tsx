import { useState, useRef, useEffect } from 'react';
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Member } from "@/types/projects";
import { Cliente } from "@/hooks/useClientes";
import { cn } from "@/lib/utils";
import { User, Users } from "lucide-react";

interface MentionTextareaProps {
  value: string;
  onChange: (value: string) => void;
  onMentionsChange: (mentions: string[]) => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  placeholder?: string;
  members: Member[];
  clientes: Cliente[];
  className?: string;
}

interface Suggestion {
  id: string;
  name: string;
  type: 'member' | 'client';
  email?: string;
}

export const MentionTextarea = ({
  value,
  onChange,
  onMentionsChange,
  onKeyDown,
  placeholder,
  members,
  clientes,
  className
}: MentionTextareaProps) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [mentionStart, setMentionStart] = useState<number>(-1);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const getAllSuggestions = (query: string): Suggestion[] => {
    const normalizedQuery = query.toLowerCase();
    
    const memberSuggestions: Suggestion[] = members
      .filter(m => m.name.toLowerCase().includes(normalizedQuery))
      .map(m => ({
        id: m.id,
        name: m.name,
        type: 'member',
        email: m.email
      }));

    const clientSuggestions: Suggestion[] = clientes
      .filter(c => c.nome.toLowerCase().includes(normalizedQuery))
      .map(c => ({
        id: c.id,
        name: c.nome,
        type: 'client',
        email: c.email
      }));

    return [...memberSuggestions, ...clientSuggestions];
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    
    const cursorPosition = e.target.selectionStart || 0;
    const textBeforeCursor = newValue.substring(0, cursorPosition);
    const lastAtSymbol = textBeforeCursor.lastIndexOf('@');

    if (lastAtSymbol !== -1) {
      const textAfterAt = textBeforeCursor.substring(lastAtSymbol + 1);
      
      // Check if there's a space after @ (which would end the mention)
      if (!textAfterAt.includes(' ') && !textAfterAt.includes('\n')) {
        const query = textAfterAt;
        const matchingSuggestions = getAllSuggestions(query);
        
        if (matchingSuggestions.length > 0) {
          setSuggestions(matchingSuggestions);
          setShowSuggestions(true);
          setMentionStart(lastAtSymbol);
          setSelectedIndex(0);
        } else {
          setShowSuggestions(false);
        }
      } else {
        setShowSuggestions(false);
      }
    } else {
      setShowSuggestions(false);
    }

    // Extract all mentions from the text
    const mentionRegex = /@\[([^\]]+)\]\(([^:]+):([^)]+)\)/g;
    const extractedMentions: string[] = [];
    let match;
    while ((match = mentionRegex.exec(newValue)) !== null) {
      extractedMentions.push(match[2]); // ID is in the second capture group
    }
    onMentionsChange(extractedMentions);
  };

  const insertMention = (suggestion: Suggestion) => {
    if (mentionStart === -1) return;

    const cursorPosition = textareaRef.current?.selectionStart || 0;
    const beforeMention = value.substring(0, mentionStart);
    const afterMention = value.substring(cursorPosition);
    
    // Format: @[Name](id:type)
    const mentionText = `@[${suggestion.name}](${suggestion.id}:${suggestion.type})`;
    const newValue = beforeMention + mentionText + ' ' + afterMention;
    
    onChange(newValue);
    
    // Update cursor position
    setTimeout(() => {
      const newPosition = beforeMention.length + mentionText.length + 1;
      textareaRef.current?.setSelectionRange(newPosition, newPosition);
      textareaRef.current?.focus();
    }, 0);

    setShowSuggestions(false);
    setMentionStart(-1);

    // Extract mentions
    const mentionRegex = /@\[([^\]]+)\]\(([^:]+):([^)]+)\)/g;
    const extractedMentions: string[] = [];
    let match;
    while ((match = mentionRegex.exec(newValue)) !== null) {
      extractedMentions.push(match[2]);
    }
    onMentionsChange(extractedMentions);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (showSuggestions) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % suggestions.length);
        return;
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length);
        return;
      } else if (e.key === 'Tab' || (e.key === 'Enter' && !e.shiftKey)) {
        e.preventDefault();
        insertMention(suggestions[selectedIndex]);
        return;
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setShowSuggestions(false);
        return;
      }
    }

    if (onKeyDown) {
      onKeyDown(e);
    }
  };

  useEffect(() => {
    if (showSuggestions && suggestionsRef.current) {
      const selectedElement = suggestionsRef.current.children[selectedIndex] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex, showSuggestions]);

  // Render overlay text masking mention IDs while showing only name and type
  const renderHighlightedText = () => {
    const parts: (string | JSX.Element)[] = [];
    let lastIndex = 0;
    const mentionRegex = /@\[([^\]]+)\]\(([^:]+):([^\)]+)\)/g;
    let match;

    while ((match = mentionRegex.exec(value)) !== null) {
      if (match.index > lastIndex) {
        parts.push(value.substring(lastIndex, match.index));
      }

      const name = match[1];
      const type = match[3] as 'member' | 'client';

      parts.push(
        <span
          key={`m-${match.index}`}
          className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-accent text-foreground/90 align-baseline"
        >
          {type === 'member' ? <User className="h-3 w-3" /> : <Users className="h-3 w-3" />}
          <span>{name}</span>
          <span className="text-xs opacity-70">({type === 'member' ? 'Membro' : 'Cliente'})</span>
        </span>
      );

      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < value.length) {
      parts.push(value.substring(lastIndex));
    }

    return parts;
  };

  return (
    <div className="relative">
      {/* Overlay that displays formatted text without IDs */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 px-3 py-2 text-sm whitespace-pre-wrap break-words"
      >
        {value ? renderHighlightedText() : (
          <span className="text-muted-foreground">{placeholder}</span>
        )}
      </div>

      <Textarea
        ref={textareaRef}
        value={value}
        onChange={handleTextChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={cn("min-h-[80px] resize-none bg-transparent text-transparent caret-foreground", className)}
      />
      
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-lg max-h-48 overflow-y-auto"
        >
          {suggestions.map((suggestion, index) => (
            <div
              key={`${suggestion.type}-${suggestion.id}`}
              className={cn(
                "flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-accent transition-colors",
                index === selectedIndex && "bg-accent"
              )}
              onClick={() => insertMention(suggestion)}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs">
                  {suggestion.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm truncate">{suggestion.name}</span>
                  {suggestion.type === 'member' ? (
                    <User className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                  ) : (
                    <Users className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                  )}
                </div>
                {suggestion.email && (
                  <span className="text-xs text-muted-foreground truncate block">
                    {suggestion.email}
                  </span>
                )}
              </div>
              <span className="text-xs text-muted-foreground">
                {suggestion.type === 'member' ? 'Membro' : 'Cliente'}
              </span>
            </div>
          ))}
        </div>
      )}
      
      <div className="mt-2 text-xs text-muted-foreground">
        Digite @ para mencionar membros ou clientes
      </div>
    </div>
  );
};
