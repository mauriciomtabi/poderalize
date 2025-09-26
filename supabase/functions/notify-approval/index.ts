import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotifyApprovalRequest {
  email: string;
  name: string;
  appUrl: string;
  adminName?: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("Notify approval function called");
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, name, appUrl, adminName }: NotifyApprovalRequest = await req.json();
    console.log("Processing approval notification for:", email);

    // Create Supabase client with service role for admin operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Generate password recovery link
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email: email,
      options: {
        redirectTo: `${appUrl}/auth?reset=1`
      }
    });

    if (linkError) {
      console.error("Error generating recovery link:", linkError);
      throw new Error(`Erro ao gerar link de recuperação: ${linkError.message}`);
    }

    console.log("Recovery link generated successfully");

    // Send approval email
    const emailResponse = await resend.emails.send({
      from: "Poderalize <onboarding@resend.dev>",
      to: [email],
      subject: "🎉 Acesso Aprovado - Poderalize",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 30px;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🎉 Acesso Aprovado!</h1>
          </div>
          
          <div style="background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <h2 style="color: #1f2937; margin-bottom: 20px;">Olá, ${name}!</h2>
            
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
              Sua solicitação de acesso ao sistema <strong>Poderalize</strong> foi aprovada por ${adminName || 'um administrador'}! 
              Agora você pode acessar todas as funcionalidades do sistema.
            </p>

            <div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 20px; margin: 25px 0; border-radius: 8px;">
              <h3 style="color: #1e40af; margin: 0 0 15px 0; font-size: 18px;">
                🔐 Configure sua senha
              </h3>
              <p style="color: #1e40af; margin: 0; font-size: 14px; line-height: 1.5;">
                Para acessar o sistema, você precisa definir uma senha. Clique no botão abaixo para configurar:
              </p>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${linkData.properties?.action_link}" 
                 style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        color: white; text-decoration: none; padding: 15px 30px; border-radius: 8px; 
                        font-weight: bold; font-size: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                🚀 Definir Senha e Acessar
              </a>
            </div>

            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 25px 0;">
              <h4 style="color: #374151; margin: 0 0 10px 0;">📧 Seus dados de acesso:</h4>
              <p style="color: #6b7280; margin: 5px 0; font-size: 14px;"><strong>Email:</strong> ${email}</p>
              <p style="color: #6b7280; margin: 5px 0; font-size: 14px;"><strong>Sistema:</strong> Poderalize</p>
            </div>

            <p style="color: #6b7280; font-size: 14px; line-height: 1.5; margin-top: 25px;">
              Se você não conseguir clicar no botão, copie e cole este link no seu navegador:<br>
              <a href="${linkData.properties?.action_link}" style="color: #3b82f6; word-break: break-all;">
                ${linkData.properties?.action_link}
              </a>
            </p>

            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            
            <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">
              Este email foi enviado automaticamente pelo sistema Poderalize.<br>
              Se você não solicitou acesso, pode ignorar este email.
            </p>
          </div>
        </div>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Email de aprovação enviado com sucesso"
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in notify-approval function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);