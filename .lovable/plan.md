# Plano: Acesso ao CRM (Gabrielly) + Remodelagem visual

## Parte 1 — Bug: Gabrielly não vê o funil no CRM

### Causa raiz (confirmada via consulta no Postgres)
As policies de RLS das tabelas `funnels` e `funnel_stages` exigem `auth.uid() = user_id`, ou seja, **só o criador do funil enxerga**. Já a tabela `leads` usa `user_has_page_permission(auth.uid(), 'leads') OR has_role('admin')`. Por isso Gabrielly tem permissão de CRM mas o seletor de funil aparece vazio (como na imagem 422), e quem criou o funil (admin) vê normalmente (imagem 423).

### Correção
Nova migration alinhando `funnels` e `funnel_stages` ao mesmo modelo de permissão de página usado em `leads`:

- `funnels`: SELECT/INSERT/UPDATE/DELETE permitidos quando `user_has_page_permission(auth.uid(), 'leads') OR has_role(auth.uid(), 'admin')`. INSERT continua forçando `user_id = auth.uid()` no WITH CHECK, para preservar autoria.
- `funnel_stages`: mesmas regras, validando via EXISTS no funil pai (sem exigir ownership).
- Manter DELETE/UPDATE de funil restrito ao dono **ou** admin (evita um colaborador apagar funil alheio). SELECT é compartilhado.

Nada muda no frontend — `useFunnels` já faz `select * from funnels` e vai passar a retornar os registros visíveis pela nova policy.

## Parte 2 — Remodelagem visual do CRM (essência Poderalize)

### Diagnóstico do estado atual
Olhando as imagens 421 e 423:
- Header azul-marinho sólido grande demais, sem respiro.
- KPIs em cards brancos planos, ícones coloridos aleatórios (roxo/verde/laranja/azul) sem hierarquia.
- Tipografia uniforme — nada guia o olho (números do KPI competem com labels).
- Kanban com colunas brancas sobre fundo branco → sem profundidade, bullets laranja repetidos.
- Laranja Poderalize aparece só em detalhes pontuais (badge Admin, bullets), perdendo identidade.
- Espaçamentos inconsistentes entre seções (KPIs colados na barra, filtros apertados).

### Direção (essência preservada)
Manter: laranja Poderalize como acento principal, azul-marinho como base institucional, layout funcional kanban.
Elevar: tipografia editorial, contraste por superfície (não por cor crua), microinterações sutis, hierarquia clara KPI → filtro → board.

### Escopo desta entrega
Refatorar **apenas a página CRM** (`CRMHeader`, `CRMContent`, `FunnelKanban`, `LeadCard`, KPIs) como piloto do novo sistema visual. Se aprovado, replicamos para Colaboradores, Projetos, Financeiro em entregas seguintes.

### O que será feito no piloto
1. Atualizar tokens em `index.css` (superfícies em camadas, sombras suaves, gradiente sutil de marca, raio consistente).
2. Reconstruir KPIs: card maior, número display, label discreto, ícone monocromático em pill, variação (delta) quando houver.
3. Reconstruir barra de filtros: seletor de funil com chip de status, busca centralizada com largura controlada, ações à direita agrupadas.
4. Kanban: colunas com superfície `card`, header de coluna com bullet da cor da etapa + contagem como badge neutra, divisor sutil, scroll horizontal com sombra de borda.
5. Lead card: avatar/inicial, nome em destaque, empresa em muted, valor formatado, tags compactas, hover elevation.
6. Microanimações com a `animate-*` já existente (fade/slide curtos).

### Antes de implementar (Parte 2)
Vou abrir uma rodada de **3 perguntas visuais** (paleta refinada, par tipográfico, densidade de layout) para você escolher a direção exata antes de tocar nos componentes. A correção do bug (Parte 1) pode seguir imediatamente após aprovação deste plano, sem depender da escolha visual.

## Detalhes técnicos
- Migration SQL nova em `supabase/migrations/` (não editar as antigas).
- Sem mudança em `useFunnels.ts`, `CRMContext.tsx` ou tipos.
- Redesign restrito a: `src/index.css`, `src/components/crm/CRMHeader.tsx`, `src/components/crm/CRMContent.tsx`, `src/components/crm/FunnelKanban.tsx`, `src/components/crm/LeadCard.tsx`. Sem mexer em lógica de dados.
