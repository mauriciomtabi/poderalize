const fs = require('fs');

function replaceRegex(path, regex, replace) {
  let content = fs.readFileSync(path, 'utf8');
  content = content.replace(regex, replace);
  fs.writeFileSync(path, content);
}

// 4. useFunnelLeads.ts
let useFunnelLeadsOriginal = "    try {\n      const { data: leads, error } = await supabase\n        .from('leads')\n        .select('*')\n        .eq('user_id', user.id)\n        .is('funnel_id', null)\n        .order('created_at', { ascending: false });";

let useFunnelLeadsReplacement = "    try {\n      let query = supabase\n        .from('leads')\n        .select('*')\n        .eq('user_id', user.id)\n        .order('created_at', { ascending: false });\n\n      if (funnelId) {\n        query = query.or('funnel_id.is.null,funnel_id.neq.' + funnelId);\n      } else {\n        query = query.is('funnel_id', null);\n      }\n\n      const { data: leads, error } = await query;";

let content = fs.readFileSync('src/hooks/useFunnelLeads.ts', 'utf8');
content = content.replace(useFunnelLeadsOriginal, useFunnelLeadsReplacement);
fs.writeFileSync('src/hooks/useFunnelLeads.ts', content);

