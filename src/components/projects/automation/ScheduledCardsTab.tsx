interface ScheduledCardsTabProps {
  boardId: string | null;
}

export const ScheduledCardsTab = ({ boardId }: ScheduledCardsTabProps) => {
  return (
    <div className="text-center py-12 text-muted-foreground">
      <p className="text-lg font-medium mb-2">Em breve</p>
      <p className="text-sm">
        Funcionalidade de cards programados será implementada em breve
      </p>
    </div>
  );
};
