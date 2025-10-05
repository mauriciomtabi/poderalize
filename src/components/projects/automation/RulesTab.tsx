interface RulesTabProps {
  boardId: string | null;
}

export const RulesTab = ({ boardId }: RulesTabProps) => {
  return (
    <div className="text-center py-12 text-muted-foreground">
      <p className="text-lg font-medium mb-2">Em breve</p>
      <p className="text-sm">
        Funcionalidade de regras de automação será implementada em breve
      </p>
    </div>
  );
};
