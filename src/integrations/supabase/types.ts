export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      agendamentos_avaliacao: {
        Row: {
          atleta_id: string | null
          avaliador_responsavel: string | null
          created_at: string | null
          data_agendamento: string
          duracao_minutos: number | null
          id: string
          local_avaliacao: string | null
          observacoes: string | null
          resultado_avaliacao: string | null
          status: string | null
          tipo_avaliacao: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          atleta_id?: string | null
          avaliador_responsavel?: string | null
          created_at?: string | null
          data_agendamento: string
          duracao_minutos?: number | null
          id?: string
          local_avaliacao?: string | null
          observacoes?: string | null
          resultado_avaliacao?: string | null
          status?: string | null
          tipo_avaliacao: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          atleta_id?: string | null
          avaliador_responsavel?: string | null
          created_at?: string | null
          data_agendamento?: string
          duracao_minutos?: number | null
          id?: string
          local_avaliacao?: string | null
          observacoes?: string | null
          resultado_avaliacao?: string | null
          status?: string | null
          tipo_avaliacao?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agendamentos_avaliacao_atleta_id_fkey"
            columns: ["atleta_id"]
            isOneToOne: false
            referencedRelation: "atletas"
            referencedColumns: ["id"]
          },
        ]
      }
      atletas: {
        Row: {
          altura: number | null
          apelido: string | null
          avaliadores_envolvidos: string | null
          bairro: string | null
          categoria: string | null
          cidade: string
          clube_atual: string | null
          clubes_anteriores: string | null
          contato_responsavel: string | null
          created_at: string | null
          data_lesao: string | null
          data_nascimento: string | null
          estado: string
          foto_url: string | null
          id: string
          idade: number | null
          ja_teve_lesao: boolean | null
          nivel_tecnico: number | null
          nome_completo: string
          nome_responsavel: string | null
          observacoes: string | null
          pais: string | null
          pe_dominante: string | null
          perfil_comportamental: string[] | null
          periodo_avaliacao_fim: string | null
          periodo_avaliacao_inicio: string | null
          periodo_efetivo_fim: string | null
          periodo_efetivo_inicio: string | null
          peso: number | null
          posicao_principal: string
          posicao_secundaria: string | null
          potencial_tecnico: number | null
          responsavel_captacao: string | null
          status: string | null
          tempo_parado: string | null
          tipo_lesao: string | null
          tipo_programa: string | null
          tratamento_realizado: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          altura?: number | null
          apelido?: string | null
          avaliadores_envolvidos?: string | null
          bairro?: string | null
          categoria?: string | null
          cidade: string
          clube_atual?: string | null
          clubes_anteriores?: string | null
          contato_responsavel?: string | null
          created_at?: string | null
          data_lesao?: string | null
          data_nascimento?: string | null
          estado: string
          foto_url?: string | null
          id?: string
          idade?: number | null
          ja_teve_lesao?: boolean | null
          nivel_tecnico?: number | null
          nome_completo: string
          nome_responsavel?: string | null
          observacoes?: string | null
          pais?: string | null
          pe_dominante?: string | null
          perfil_comportamental?: string[] | null
          periodo_avaliacao_fim?: string | null
          periodo_avaliacao_inicio?: string | null
          periodo_efetivo_fim?: string | null
          periodo_efetivo_inicio?: string | null
          peso?: number | null
          posicao_principal: string
          posicao_secundaria?: string | null
          potencial_tecnico?: number | null
          responsavel_captacao?: string | null
          status?: string | null
          tempo_parado?: string | null
          tipo_lesao?: string | null
          tipo_programa?: string | null
          tratamento_realizado?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          altura?: number | null
          apelido?: string | null
          avaliadores_envolvidos?: string | null
          bairro?: string | null
          categoria?: string | null
          cidade?: string
          clube_atual?: string | null
          clubes_anteriores?: string | null
          contato_responsavel?: string | null
          created_at?: string | null
          data_lesao?: string | null
          data_nascimento?: string | null
          estado?: string
          foto_url?: string | null
          id?: string
          idade?: number | null
          ja_teve_lesao?: boolean | null
          nivel_tecnico?: number | null
          nome_completo?: string
          nome_responsavel?: string | null
          observacoes?: string | null
          pais?: string | null
          pe_dominante?: string | null
          perfil_comportamental?: string[] | null
          periodo_avaliacao_fim?: string | null
          periodo_avaliacao_inicio?: string | null
          periodo_efetivo_fim?: string | null
          periodo_efetivo_inicio?: string | null
          peso?: number | null
          posicao_principal?: string
          posicao_secundaria?: string | null
          potencial_tecnico?: number | null
          responsavel_captacao?: string | null
          status?: string | null
          tempo_parado?: string | null
          tipo_lesao?: string | null
          tipo_programa?: string | null
          tratamento_realizado?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      avaliacoes_detalhadas: {
        Row: {
          agendamento_id: string | null
          atleta_id: string | null
          avaliador_responsavel: string | null
          biotipo: string | null
          caracteristicas_posicao: Json | null
          coletivo_disciplina: number | null
          coletivo_espirito_equipe: number | null
          coletivo_responsabilidade: number | null
          created_at: string
          id: string
          intensidade_constancia: number | null
          intensidade_recuperacao: number | null
          intensidade_resistencia: number | null
          maturacao_desenvolvimento_fisico: number | null
          maturacao_margem_evolucao: number | null
          maturacao_potencial_crescimento: number | null
          media_geral: number | null
          media_intensidade: number | null
          media_velocidade: number | null
          observacoes_perfil: string | null
          perfil_composicao_corporal: number | null
          perfil_estatura_adequada: number | null
          perfil_membros_simetricos: number | null
          pressao_concentracao: number | null
          pressao_controle_emocional: number | null
          pressao_tomada_decisao: number | null
          status_final: string | null
          updated_at: string
          user_id: string | null
          velocidade_aceleracao: number | null
          velocidade_maxima: number | null
          velocidade_mudanca_direcao: number | null
        }
        Insert: {
          agendamento_id?: string | null
          atleta_id?: string | null
          avaliador_responsavel?: string | null
          biotipo?: string | null
          caracteristicas_posicao?: Json | null
          coletivo_disciplina?: number | null
          coletivo_espirito_equipe?: number | null
          coletivo_responsabilidade?: number | null
          created_at?: string
          id?: string
          intensidade_constancia?: number | null
          intensidade_recuperacao?: number | null
          intensidade_resistencia?: number | null
          maturacao_desenvolvimento_fisico?: number | null
          maturacao_margem_evolucao?: number | null
          maturacao_potencial_crescimento?: number | null
          media_geral?: number | null
          media_intensidade?: number | null
          media_velocidade?: number | null
          observacoes_perfil?: string | null
          perfil_composicao_corporal?: number | null
          perfil_estatura_adequada?: number | null
          perfil_membros_simetricos?: number | null
          pressao_concentracao?: number | null
          pressao_controle_emocional?: number | null
          pressao_tomada_decisao?: number | null
          status_final?: string | null
          updated_at?: string
          user_id?: string | null
          velocidade_aceleracao?: number | null
          velocidade_maxima?: number | null
          velocidade_mudanca_direcao?: number | null
        }
        Update: {
          agendamento_id?: string | null
          atleta_id?: string | null
          avaliador_responsavel?: string | null
          biotipo?: string | null
          caracteristicas_posicao?: Json | null
          coletivo_disciplina?: number | null
          coletivo_espirito_equipe?: number | null
          coletivo_responsabilidade?: number | null
          created_at?: string
          id?: string
          intensidade_constancia?: number | null
          intensidade_recuperacao?: number | null
          intensidade_resistencia?: number | null
          maturacao_desenvolvimento_fisico?: number | null
          maturacao_margem_evolucao?: number | null
          maturacao_potencial_crescimento?: number | null
          media_geral?: number | null
          media_intensidade?: number | null
          media_velocidade?: number | null
          observacoes_perfil?: string | null
          perfil_composicao_corporal?: number | null
          perfil_estatura_adequada?: number | null
          perfil_membros_simetricos?: number | null
          pressao_concentracao?: number | null
          pressao_controle_emocional?: number | null
          pressao_tomada_decisao?: number | null
          status_final?: string | null
          updated_at?: string
          user_id?: string | null
          velocidade_aceleracao?: number | null
          velocidade_maxima?: number | null
          velocidade_mudanca_direcao?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "avaliacoes_detalhadas_agendamento_id_fkey"
            columns: ["agendamento_id"]
            isOneToOne: false
            referencedRelation: "agendamentos_avaliacao"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "avaliacoes_detalhadas_atleta_id_fkey"
            columns: ["atleta_id"]
            isOneToOne: false
            referencedRelation: "atletas"
            referencedColumns: ["id"]
          },
        ]
      }
      avaliacoes_tecnicas: {
        Row: {
          atleta_id: string | null
          avaliador_id: string | null
          created_at: string | null
          data_avaliacao: string
          id: string
          nota_fisica: number
          nota_psicologica: number
          nota_tatica: number
          nota_tecnica: number
          observacoes: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          atleta_id?: string | null
          avaliador_id?: string | null
          created_at?: string | null
          data_avaliacao: string
          id?: string
          nota_fisica: number
          nota_psicologica: number
          nota_tatica: number
          nota_tecnica: number
          observacoes?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          atleta_id?: string | null
          avaliador_id?: string | null
          created_at?: string | null
          data_avaliacao?: string
          id?: string
          nota_fisica?: number
          nota_psicologica?: number
          nota_tatica?: number
          nota_tecnica?: number
          observacoes?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "avaliacoes_tecnicas_atleta_id_fkey"
            columns: ["atleta_id"]
            isOneToOne: false
            referencedRelation: "atletas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "avaliacoes_tecnicas_avaliador_id_fkey"
            columns: ["avaliador_id"]
            isOneToOne: false
            referencedRelation: "captadores"
            referencedColumns: ["id"]
          },
        ]
      }
      captadores: {
        Row: {
          ativo: boolean | null
          created_at: string | null
          email: string
          id: string
          nome: string
          regiao_atuacao: string | null
          telefone: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string | null
          email: string
          id?: string
          nome: string
          regiao_atuacao?: string | null
          telefone?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          ativo?: boolean | null
          created_at?: string | null
          email?: string
          id?: string
          nome?: string
          regiao_atuacao?: string | null
          telefone?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      categorias: {
        Row: {
          cor: string | null
          created_at: string
          id: string
          nome: string
          tipo: string
          updated_at: string
          user_id: string
        }
        Insert: {
          cor?: string | null
          created_at?: string
          id?: string
          nome: string
          tipo: string
          updated_at?: string
          user_id: string
        }
        Update: {
          cor?: string | null
          created_at?: string
          id?: string
          nome?: string
          tipo?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      colaboradores: {
        Row: {
          avatar_url: string | null
          created_at: string
          data_contratacao: string | null
          departamento: string | null
          email: string
          funcao: string
          id: string
          nome: string
          status: string
          telefone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          data_contratacao?: string | null
          departamento?: string | null
          email: string
          funcao: string
          id?: string
          nome: string
          status?: string
          telefone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          data_contratacao?: string | null
          departamento?: string | null
          email?: string
          funcao?: string
          id?: string
          nome?: string
          status?: string
          telefone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      contas_bancarias: {
        Row: {
          ativa: boolean
          banco: string
          cor: string
          created_at: string
          icone: string | null
          id: string
          nome: string
          saldo_atual: number
          saldo_inicial: number
          tipo_conta: string
          updated_at: string
          user_id: string
        }
        Insert: {
          ativa?: boolean
          banco: string
          cor?: string
          created_at?: string
          icone?: string | null
          id?: string
          nome: string
          saldo_atual?: number
          saldo_inicial?: number
          tipo_conta?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          ativa?: boolean
          banco?: string
          cor?: string
          created_at?: string
          icone?: string | null
          id?: string
          nome?: string
          saldo_atual?: number
          saldo_inicial?: number
          tipo_conta?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      emprestimos: {
        Row: {
          created_at: string
          data_emprestimo: string
          data_pagamento: string | null
          data_prevista_pagamento: string | null
          id: string
          juros: number | null
          observacao: string | null
          parcelas: number | null
          pessoa: string
          status: string
          tipo: string
          updated_at: string
          user_id: string
          valor: number
          valor_pago: number | null
        }
        Insert: {
          created_at?: string
          data_emprestimo?: string
          data_pagamento?: string | null
          data_prevista_pagamento?: string | null
          id?: string
          juros?: number | null
          observacao?: string | null
          parcelas?: number | null
          pessoa: string
          status?: string
          tipo: string
          updated_at?: string
          user_id: string
          valor: number
          valor_pago?: number | null
        }
        Update: {
          created_at?: string
          data_emprestimo?: string
          data_pagamento?: string | null
          data_prevista_pagamento?: string | null
          id?: string
          juros?: number | null
          observacao?: string | null
          parcelas?: number | null
          pessoa?: string
          status?: string
          tipo?: string
          updated_at?: string
          user_id?: string
          valor?: number
          valor_pago?: number | null
        }
        Relationships: []
      }
      metas: {
        Row: {
          ativo: boolean
          categoria: string
          created_at: string
          data_fim: string | null
          data_inicio: string
          id: string
          meta_pai_id: string | null
          periodo: string
          recorrencia_ate: string | null
          recorrencia_tipo: string | null
          recorrente: boolean
          sequencia: number | null
          tipo: string
          updated_at: string
          user_id: string
          valor_atual: number
          valor_meta: number
        }
        Insert: {
          ativo?: boolean
          categoria: string
          created_at?: string
          data_fim?: string | null
          data_inicio?: string
          id?: string
          meta_pai_id?: string | null
          periodo: string
          recorrencia_ate?: string | null
          recorrencia_tipo?: string | null
          recorrente?: boolean
          sequencia?: number | null
          tipo: string
          updated_at?: string
          user_id: string
          valor_atual?: number
          valor_meta: number
        }
        Update: {
          ativo?: boolean
          categoria?: string
          created_at?: string
          data_fim?: string | null
          data_inicio?: string
          id?: string
          meta_pai_id?: string | null
          periodo?: string
          recorrencia_ate?: string | null
          recorrencia_tipo?: string | null
          recorrente?: boolean
          sequencia?: number | null
          tipo?: string
          updated_at?: string
          user_id?: string
          valor_atual?: number
          valor_meta?: number
        }
        Relationships: [
          {
            foreignKeyName: "metas_meta_pai_id_fkey"
            columns: ["meta_pai_id"]
            isOneToOne: false
            referencedRelation: "metas"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      transacoes: {
        Row: {
          categoria: string
          conta_id: string | null
          created_at: string
          data: string
          descricao: string
          id: string
          modo_pagamento: string
          modo_pagamento_outro: string | null
          observacao: string | null
          tipo: string
          updated_at: string
          user_id: string
          valor: number
        }
        Insert: {
          categoria: string
          conta_id?: string | null
          created_at?: string
          data?: string
          descricao: string
          id?: string
          modo_pagamento?: string
          modo_pagamento_outro?: string | null
          observacao?: string | null
          tipo: string
          updated_at?: string
          user_id: string
          valor: number
        }
        Update: {
          categoria?: string
          conta_id?: string | null
          created_at?: string
          data?: string
          descricao?: string
          id?: string
          modo_pagamento?: string
          modo_pagamento_outro?: string | null
          observacao?: string | null
          tipo?: string
          updated_at?: string
          user_id?: string
          valor?: number
        }
        Relationships: []
      }
      transferencias: {
        Row: {
          conta_destino_id: string
          conta_origem_id: string
          created_at: string
          data_transferencia: string
          descricao: string
          id: string
          transacao_destino_id: string | null
          transacao_origem_id: string | null
          updated_at: string
          user_id: string
          valor: number
        }
        Insert: {
          conta_destino_id: string
          conta_origem_id: string
          created_at?: string
          data_transferencia?: string
          descricao?: string
          id?: string
          transacao_destino_id?: string | null
          transacao_origem_id?: string | null
          updated_at?: string
          user_id: string
          valor: number
        }
        Update: {
          conta_destino_id?: string
          conta_origem_id?: string
          created_at?: string
          data_transferencia?: string
          descricao?: string
          id?: string
          transacao_destino_id?: string | null
          transacao_origem_id?: string | null
          updated_at?: string
          user_id?: string
          valor?: number
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          created_at: string
          id: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["user_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      user_role: "admin" | "colaborador" | "pending"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      user_role: ["admin", "colaborador", "pending"],
    },
  },
} as const
