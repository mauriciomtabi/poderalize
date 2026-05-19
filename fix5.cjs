const fs = require('fs');

let content = fs.readFileSync('src/hooks/useFunnelLeads.ts', 'utf8');

const regex = /const \{ data: leads, error \} = await supabase\s*\.from\('leads'\)\s*\.select\('\*'\)\s*\.eq\('user_id', user\.id\)\s*\.is\('funnel_id', null\)\s*\.order\('created_at', \{ ascending: false \}\);/g;

const replacement = "let query = supabase\n        .from('leads')\n        .select('*')\n        .eq('user_id', user.id)\n        .order('created_at', { ascending: false });\n\n      if (funnelId) {\n        query = query.or('funnel_id.is.null,funnel_id.neq.' + funnelId);\n      } else {\n        query = query.is('funnel_id', null);\n      }\n\n      const { data: leads, error } = await query;";

content = content.replace(regex, replacement);
fs.writeFileSync('src/hooks/useFunnelLeads.ts', content);

