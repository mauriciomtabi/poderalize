interface ButtonsTabProps {
  boardId: string | null;
}

export const ButtonsTab = ({ boardId }: ButtonsTabProps) => {
  return (
    <div className="text-center py-12 text-muted-foreground">
      <p className="text-lg font-medium mb-2">Em breve</p>
      <p className="text-sm">
        Funcionalidade de botões personalizados será implementada em breve
      </p>
    </div>
  );
};
