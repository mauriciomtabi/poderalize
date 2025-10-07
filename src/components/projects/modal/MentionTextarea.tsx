import { useState, useRef, useEffect } from 'react';
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Member } from "@/types/projects";
import { cn } from "@/lib/utils";
import { User } from "lucide-react";

interface MentionTextareaProps {
  value: string;
  onChange: (value: string) => void;
  onMentionsChange: (mentions: string[]) => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  placeholder?: string;
  members: Member[];
  className?: string;
}

interface Suggestion {
  id: string;
  name: string;
  type: 'member';
  email?: string;
}

export const MentionTextarea = ({
  value,
  onChange,
  onMentionsChange,
  onKeyDown,
  placeholder,
  members,
  className
}: MentionTextareaProps) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [mentionStart, setMentionStart] = useState<number>(-1);
  const [displayValue, setDisplayValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Convert internal format to display format
  const convertToDisplay = (text: string): string => {
    return text.replace(/@\[([^\]]+)\]\(([^:]+):([^)]+)\)/g, '@$1');
  };

  // Keep display value in sync with actual value
  useEffect(() => {
    setDisplayValue(convertToDisplay(value));
  }, [value]);

  const getAllSuggestions = (query: string): Suggestion[] => {
    const normalizedQuery = query.toLowerCase();
    
    const memberSuggestions: Suggestion[] = members
      .filter(m => m.name.toLowerCase().includes(normalizedQuery))
      .map(m => ({
        id: m.id,
        name: m.name,
        type: 'member' as const,
        email: m.email
      }));

    return memberSuggestions;
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newDisplayValue = e.target.value;
    setDisplayValue(newDisplayValue);
    
    const cursorPosition = e.target.selectionStart || 0;
    const textBeforeCursor = newDisplayValue.substring(0, cursorPosition);
    const lastAtSymbol = textBeforeCursor.lastIndexOf('@');

    // Reconstruct the actual value by preserving existing mentions
    let newValue = newDisplayValue;
    const existingMentions = value.match(/@\[([^\]]+)\]\(([^:]+):([^)]+)\)/g) || [];
    
    // Replace simple @ mentions back with full format if they exist
    existingMentions.forEach(mention => {
      const nameMatch = mention.match(/@\[([^\]]+)\]/);
      if (nameMatch) {
        const simpleMention = `@${nameMatch[1]}`;
        if (newDisplayValue.includes(simpleMention) && !newDisplayValue.includes(mention)) {
          newValue = newValue.replace(simpleMention, mention);
        }
      }
    });

    onChange(newValue);

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

    // Extract all mentions from the actual value
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
    
    // Calculate position based on display value
    const beforeMention = displayValue.substring(0, mentionStart);
    const afterMention = displayValue.substring(cursorPosition);
    
    // Format: @[Name](id:type) for internal value
    const mentionText = `@[${suggestion.name}](${suggestion.id}:${suggestion.type})`;
    const newValue = beforeMention + mentionText + ' ' + afterMention;
    
    onChange(newValue);
    
    // Update display value to show only @Name
    const displayMention = `@${suggestion.name}`;
    const newDisplayValue = beforeMention + displayMention + ' ' + afterMention;
    setDisplayValue(newDisplayValue);
    
    // Update cursor position based on display text
    setTimeout(() => {
      const newPosition = beforeMention.length + displayMention.length + 1;
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

  return (
    <div className="relative">
      <Textarea
        ref={textareaRef}
        value={displayValue}
        onChange={handleTextChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={cn("min-h-[80px] resize-none", className)}
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
                  <User className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                </div>
                {suggestion.email && (
                  <span className="text-xs text-muted-foreground truncate block">
                    {suggestion.email}
                  </span>
                )}
              </div>
              <span className="text-xs text-muted-foreground">
                Membro
              </span>
            </div>
          ))}
        </div>
      )}
      
      <div className="mt-2 text-xs text-muted-foreground">
        Digite @ para mencionar membros da equipe
      </div>
    </div>
  );
};
