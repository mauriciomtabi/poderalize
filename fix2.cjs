const fs = require('fs');

function replaceRegex(path, regex, replace) {
  let content = fs.readFileSync(path, 'utf8');
  content = content.replace(regex, replace);
  fs.writeFileSync(path, content);
}

// 1. AddLeadToFunnelDialog.tsx
replaceRegex('src/components/crm/AddLeadToFunnelDialog.tsx', /Nenhum lead disponível fora de funis/g, 'Nenhum lead disponível');

// 2. LeadForm.tsx
replaceRegex('src/components/crm/LeadForm.tsx', /description: "Preencha todos os campos obrigatórios.*?Produto de Interesse\)",/g, 'description: "O campo Nome é obrigatório",');

// 3. useLeads.ts
replaceRegex('src/hooks/useLeads.ts', /empresa: z\.string\(\)\.trim\(\)\.min\(1, "Empresa é obrigatória"\)\.max\(100, "Empresa deve ter no máximo 100 caracteres"\),/g, 'empresa: z.string().trim().max(100, "Empresa deve ter no máximo 100 caracteres").optional().or(z.literal("")),');

replaceRegex('src/hooks/useLeads.ts', /email: z\.string\(\)\.trim\(\)\.email\("Email inválido"\)\.max\(255, "Email deve ter no máximo 255 caracteres"\),/g, 'email: z.string().trim().email("Email inválido").max(255, "Email deve ter no máximo 255 caracteres").optional().or(z.literal("")),');

replaceRegex('src/hooks/useLeads.ts', /fonte: z\.string\(\)\.trim\(\)\.min\(1, "Fonte é obrigatória"\)\.max\(50, "Fonte deve ter no máximo 50 caracteres"\),/g, 'fonte: z.string().trim().max(50, "Fonte deve ter no máximo 50 caracteres").optional().or(z.literal("")),');

replaceRegex('src/hooks/useLeads.ts', /produto_interesse: z\.string\(\)\.trim\(\)\.min\(1, "Produto de interesse é obrigatório"\),/g, 'produto_interesse: z.string().trim().optional().or(z.literal("")),');

// 4. useFunnelLeads.ts
const useFunnelLeadsOriginal = /const \{ data: leads, error \} = await supabase[\s\S]*?\.order\('created_at', \{ ascending: false \}\);/g;
const useFunnelLeadsReplacement = let query = supabase
        .from('leads')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (funnelId) {
        query = query.or('funnel_id.is.null,funnel_id.neq.' + funnelId);
      } else {
        query = query.is('funnel_id', null);
      }

      const { data: leads, error } = await query;;

replaceRegex('src/hooks/useFunnelLeads.ts', useFunnelLeadsOriginal, useFunnelLeadsReplacement);

