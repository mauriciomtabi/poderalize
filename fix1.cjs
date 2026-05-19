const fs = require('fs');

function replaceInFile(path, search, replace) {
  let content = fs.readFileSync(path, 'utf8');
  content = content.replace(search, replace);
  fs.writeFileSync(path, content);
}

replaceInFile('src/components/crm/AddLeadToFunnelDialog.tsx', 'Nenhum lead disponível fora de funis', 'Nenhum lead disponível');

replaceInFile('src/components/crm/LeadForm.tsx', 'if (!novoLead.nome || !novoLead.empresa || !novoLead.email || !novoLead.produtoInteresse) {', 'if (!novoLead.nome) {');
replaceInFile('src/components/crm/LeadForm.tsx', 'description: "Preencha todos os campos obrigatórios (Nome, Empresa, Email e Produto de Interesse)",', 'description: "O campo Nome é obrigatório",');
replaceInFile('src/components/crm/LeadForm.tsx', '<Label htmlFor="empresa">Empresa *</Label>', '<Label htmlFor="empresa">Empresa</Label>');
replaceInFile('src/components/crm/LeadForm.tsx', '<Label htmlFor="email">E-mail *</Label>', '<Label htmlFor="email">E-mail</Label>');
replaceInFile('src/components/crm/LeadForm.tsx', '<Label htmlFor="produtoInteresse">Produto de Interesse *</Label>', '<Label htmlFor="produtoInteresse">Produto de Interesse</Label>');

replaceInFile('src/components/crm/LeadForm.tsx', 'if (!novoLead.nome || !novoLead.empresa || !novoLead.email || !novoLead.produtoInteresse) {', 'if (!novoLead.nome) {');

replaceInFile('src/hooks/useLeads.ts', 'empresa: z.string().trim().min(1, "Empresa é obrigatória").max(100, "Empresa deve ter no máximo 100 caracteres"),', 'empresa: z.string().trim().max(100, "Empresa deve ter no máximo 100 caracteres").optional().or(z.literal("")),');
replaceInFile('src/hooks/useLeads.ts', 'email: z.string().trim().email("Email inválido").max(255, "Email deve ter no máximo 255 caracteres"),', 'email: z.string().trim().email("Email inválido").max(255, "Email deve ter no máximo 255 caracteres").optional().or(z.literal("")),');
replaceInFile('src/hooks/useLeads.ts', 'fonte: z.string().trim().min(1, "Fonte é obrigatória").max(50, "Fonte deve ter no máximo 50 caracteres"),', 'fonte: z.string().trim().max(50, "Fonte deve ter no máximo 50 caracteres").optional().or(z.literal("")),');
replaceInFile('src/hooks/useLeads.ts', 'produto_interesse: z.string().trim().min(1, "Produto de interesse é obrigatório"),', 'produto_interesse: z.string().trim().optional().or(z.literal("")),');

const searchFunnel = "      const { data: leads, error } = await supabase\n        .from('leads')\n        .select('*')\n        .eq('user_id', user.id)\n        .is('funnel_id', null)\n        .order('created_at', { ascending: false });";

const replaceFunnel = "      let query = supabase\n        .from('leads')\n        .select('*')\n        .eq('user_id', user.id)\n        .order('created_at', { ascending: false });\n\n      if (funnelId) {\n        query = query.or('funnel_id.is.null,funnel_id.neq.' + funnelId);\n      } else {\n        query = query.is('funnel_id', null);\n      }\n\n      const { data: leads, error } = await query;";

replaceInFile('src/hooks/useFunnelLeads.ts', searchFunnel, replaceFunnel);

