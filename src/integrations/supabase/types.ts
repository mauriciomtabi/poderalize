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
      checklist_template_items: {
        Row: {
          created_at: string
          id: string
          position: number
          template_id: string
          text: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          position?: number
          template_id: string
          text: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          position?: number
          template_id?: string
          text?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "checklist_template_items_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "checklist_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      checklist_templates: {
        Row: {
          board_id: string | null
          created_at: string
          description: string | null
          id: string
          is_global: boolean
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          board_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_global?: boolean
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          board_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_global?: boolean
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      clientes: {
        Row: {
          created_at: string
          data_fechamento: string
          email: string
          empresa: string
          facebook: string | null
          faturamento_atual: number | null
          faturamento_desejado: number | null
          fonte_original: string | null
          id: string
          instagram: string | null
          lead_id: string | null
          nome: string
          observacoes: string | null
          outras_redes_sociais: string | null
          site: string | null
          telefone: string | null
          updated_at: string
          user_id: string
          valor_fechamento: number | null
          vendedor_id: string | null
          vendedor_nome: string | null
        }
        Insert: {
          created_at?: string
          data_fechamento?: string
          email: string
          empresa: string
          facebook?: string | null
          faturamento_atual?: number | null
          faturamento_desejado?: number | null
          fonte_original?: string | null
          id?: string
          instagram?: string | null
          lead_id?: string | null
          nome: string
          observacoes?: string | null
          outras_redes_sociais?: string | null
          site?: string | null
          telefone?: string | null
          updated_at?: string
          user_id: string
          valor_fechamento?: number | null
          vendedor_id?: string | null
          vendedor_nome?: string | null
        }
        Update: {
          created_at?: string
          data_fechamento?: string
          email?: string
          empresa?: string
          facebook?: string | null
          faturamento_atual?: number | null
          faturamento_desejado?: number | null
          fonte_original?: string | null
          id?: string
          instagram?: string | null
          lead_id?: string | null
          nome?: string
          observacoes?: string | null
          outras_redes_sociais?: string | null
          site?: string | null
          telefone?: string | null
          updated_at?: string
          user_id?: string
          valor_fechamento?: number | null
          vendedor_id?: string | null
          vendedor_nome?: string | null
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
      follow_ups: {
        Row: {
          created_at: string
          data_agendada: string
          id: string
          lead_id: string
          lead_nome: string
          observacoes: string | null
          status: Database["public"]["Enums"]["follow_up_status"] | null
          template_mensagem: string | null
          tipo: Database["public"]["Enums"]["follow_up_type"]
          updated_at: string
          user_id: string
          vendedor_id: string | null
        }
        Insert: {
          created_at?: string
          data_agendada: string
          id?: string
          lead_id: string
          lead_nome: string
          observacoes?: string | null
          status?: Database["public"]["Enums"]["follow_up_status"] | null
          template_mensagem?: string | null
          tipo: Database["public"]["Enums"]["follow_up_type"]
          updated_at?: string
          user_id: string
          vendedor_id?: string | null
        }
        Update: {
          created_at?: string
          data_agendada?: string
          id?: string
          lead_id?: string
          lead_nome?: string
          observacoes?: string | null
          status?: Database["public"]["Enums"]["follow_up_status"] | null
          template_mensagem?: string | null
          tipo?: Database["public"]["Enums"]["follow_up_type"]
          updated_at?: string
          user_id?: string
          vendedor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "follow_ups_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      funnel_stages: {
        Row: {
          color: string
          created_at: string
          funnel_id: string
          id: string
          position: number
          title: string
          updated_at: string
        }
        Insert: {
          color?: string
          created_at?: string
          funnel_id: string
          id?: string
          position: number
          title: string
          updated_at?: string
        }
        Update: {
          color?: string
          created_at?: string
          funnel_id?: string
          id?: string
          position?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "funnel_stages_funnel_id_fkey"
            columns: ["funnel_id"]
            isOneToOne: false
            referencedRelation: "funnels"
            referencedColumns: ["id"]
          },
        ]
      }
      funnels: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      lead_interactions: {
        Row: {
          created_at: string
          created_by_user: string | null
          description: string
          id: string
          interaction_date: string
          interaction_type: string
          lead_id: string
          metadata: Json | null
          user_id: string
        }
        Insert: {
          created_at?: string
          created_by_user?: string | null
          description: string
          id?: string
          interaction_date?: string
          interaction_type: string
          lead_id: string
          metadata?: Json | null
          user_id: string
        }
        Update: {
          created_at?: string
          created_by_user?: string | null
          description?: string
          id?: string
          interaction_date?: string
          interaction_type?: string
          lead_id?: string
          metadata?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_interactions_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          anuncio_origem: string | null
          created_at: string
          data_contato: string
          dores_identificadas: string[] | null
          email: string
          empresa: string
          equipe_atual: string | null
          etapa_funil: Database["public"]["Enums"]["funnel_stage_type"] | null
          etapa_jornada: string | null
          facebook: string | null
          faturamento_atual: number | null
          faturamento_desejado: number | null
          fonte: string
          funnel_id: string | null
          funnel_stage_id: string | null
          gatilhos_funcionais: string[] | null
          id: string
          indicador_potencial: string | null
          instagram: string | null
          motivo_perda: string | null
          necessidade_oculta: string[] | null
          nivel_consciencia: string | null
          nome: string
          observacoes: string | null
          oferta_atrativa: string | null
          outras_redes_sociais: string | null
          pontuacao: number | null
          probabilidade: number | null
          produto_interesse: string
          site: string | null
          status_advanced:
            | Database["public"]["Enums"]["lead_status_advanced"]
            | null
          status_simple:
            | Database["public"]["Enums"]["lead_status_simple"]
            | null
          telefone: string | null
          temperatura_negociacao:
            | Database["public"]["Enums"]["negotiation_temperature"]
            | null
          tipo_discurso: Database["public"]["Enums"]["tipo_discurso"] | null
          trava_emocional:
            | Database["public"]["Enums"]["trava_emocional_type"]
            | null
          ultima_interacao: string | null
          updated_at: string
          user_id: string
          valor: number | null
          vendedor_id: string | null
          vendedor_nome: string | null
        }
        Insert: {
          anuncio_origem?: string | null
          created_at?: string
          data_contato?: string
          dores_identificadas?: string[] | null
          email: string
          empresa: string
          equipe_atual?: string | null
          etapa_funil?: Database["public"]["Enums"]["funnel_stage_type"] | null
          etapa_jornada?: string | null
          facebook?: string | null
          faturamento_atual?: number | null
          faturamento_desejado?: number | null
          fonte: string
          funnel_id?: string | null
          funnel_stage_id?: string | null
          gatilhos_funcionais?: string[] | null
          id?: string
          indicador_potencial?: string | null
          instagram?: string | null
          motivo_perda?: string | null
          necessidade_oculta?: string[] | null
          nivel_consciencia?: string | null
          nome: string
          observacoes?: string | null
          oferta_atrativa?: string | null
          outras_redes_sociais?: string | null
          pontuacao?: number | null
          probabilidade?: number | null
          produto_interesse?: string
          site?: string | null
          status_advanced?:
            | Database["public"]["Enums"]["lead_status_advanced"]
            | null
          status_simple?:
            | Database["public"]["Enums"]["lead_status_simple"]
            | null
          telefone?: string | null
          temperatura_negociacao?:
            | Database["public"]["Enums"]["negotiation_temperature"]
            | null
          tipo_discurso?: Database["public"]["Enums"]["tipo_discurso"] | null
          trava_emocional?:
            | Database["public"]["Enums"]["trava_emocional_type"]
            | null
          ultima_interacao?: string | null
          updated_at?: string
          user_id: string
          valor?: number | null
          vendedor_id?: string | null
          vendedor_nome?: string | null
        }
        Update: {
          anuncio_origem?: string | null
          created_at?: string
          data_contato?: string
          dores_identificadas?: string[] | null
          email?: string
          empresa?: string
          equipe_atual?: string | null
          etapa_funil?: Database["public"]["Enums"]["funnel_stage_type"] | null
          etapa_jornada?: string | null
          facebook?: string | null
          faturamento_atual?: number | null
          faturamento_desejado?: number | null
          fonte?: string
          funnel_id?: string | null
          funnel_stage_id?: string | null
          gatilhos_funcionais?: string[] | null
          id?: string
          indicador_potencial?: string | null
          instagram?: string | null
          motivo_perda?: string | null
          necessidade_oculta?: string[] | null
          nivel_consciencia?: string | null
          nome?: string
          observacoes?: string | null
          oferta_atrativa?: string | null
          outras_redes_sociais?: string | null
          pontuacao?: number | null
          probabilidade?: number | null
          produto_interesse?: string
          site?: string | null
          status_advanced?:
            | Database["public"]["Enums"]["lead_status_advanced"]
            | null
          status_simple?:
            | Database["public"]["Enums"]["lead_status_simple"]
            | null
          telefone?: string | null
          temperatura_negociacao?:
            | Database["public"]["Enums"]["negotiation_temperature"]
            | null
          tipo_discurso?: Database["public"]["Enums"]["tipo_discurso"] | null
          trava_emocional?:
            | Database["public"]["Enums"]["trava_emocional_type"]
            | null
          ultima_interacao?: string | null
          updated_at?: string
          user_id?: string
          valor?: number | null
          vendedor_id?: string | null
          vendedor_nome?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_funnel_id_fkey"
            columns: ["funnel_id"]
            isOneToOne: false
            referencedRelation: "funnels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_funnel_stage_id_fkey"
            columns: ["funnel_stage_id"]
            isOneToOne: false
            referencedRelation: "funnel_stages"
            referencedColumns: ["id"]
          },
        ]
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
      notifications: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          link: string | null
          priority: string | null
          read: boolean | null
          title: string
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          link?: string | null
          priority?: string | null
          read?: boolean | null
          title: string
          type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          link?: string | null
          priority?: string | null
          read?: boolean | null
          title?: string
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
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
      project_activities: {
        Row: {
          author: string
          author_name: string
          card_id: string
          created_at: string
          description: string
          id: string
          metadata: Json | null
          type: string
        }
        Insert: {
          author: string
          author_name: string
          card_id: string
          created_at?: string
          description: string
          id?: string
          metadata?: Json | null
          type: string
        }
        Update: {
          author?: string
          author_name?: string
          card_id?: string
          created_at?: string
          description?: string
          id?: string
          metadata?: Json | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_activities_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "project_cards"
            referencedColumns: ["id"]
          },
        ]
      }
      project_attachments: {
        Row: {
          card_id: string
          id: string
          name: string
          size: number
          type: string
          uploaded_at: string
          uploaded_by: string
          url: string
        }
        Insert: {
          card_id: string
          id?: string
          name: string
          size: number
          type: string
          uploaded_at?: string
          uploaded_by: string
          url: string
        }
        Update: {
          card_id?: string
          id?: string
          name?: string
          size?: number
          type?: string
          uploaded_at?: string
          uploaded_by?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_attachments_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "project_cards"
            referencedColumns: ["id"]
          },
        ]
      }
      project_boards: {
        Row: {
          background: Json | null
          created_at: string
          description: string | null
          id: string
          settings: Json
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          background?: Json | null
          created_at?: string
          description?: string | null
          id?: string
          settings?: Json
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          background?: Json | null
          created_at?: string
          description?: string | null
          id?: string
          settings?: Json
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      project_card_assignees: {
        Row: {
          card_id: string
          created_at: string
          id: string
          member_id: string
        }
        Insert: {
          card_id: string
          created_at?: string
          id?: string
          member_id: string
        }
        Update: {
          card_id?: string
          created_at?: string
          id?: string
          member_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_card_assignees_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "project_cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_card_assignees_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "project_members"
            referencedColumns: ["id"]
          },
        ]
      }
      project_card_labels: {
        Row: {
          card_id: string
          created_at: string
          id: string
          label_id: string
        }
        Insert: {
          card_id: string
          created_at?: string
          id?: string
          label_id: string
        }
        Update: {
          card_id?: string
          created_at?: string
          id?: string
          label_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_card_labels_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "project_cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_card_labels_label_id_fkey"
            columns: ["label_id"]
            isOneToOne: false
            referencedRelation: "project_labels"
            referencedColumns: ["id"]
          },
        ]
      }
      project_cards: {
        Row: {
          actual_hours: number | null
          archived: boolean
          cover: string | null
          created_at: string
          created_by: string
          custom_fields: Json | null
          description: string | null
          due_date: string | null
          estimated_hours: number | null
          id: string
          list_id: string
          location: Json | null
          position: number
          priority: string
          start_date: string | null
          status: string
          title: string
          updated_at: string
          watching: boolean
        }
        Insert: {
          actual_hours?: number | null
          archived?: boolean
          cover?: string | null
          created_at?: string
          created_by: string
          custom_fields?: Json | null
          description?: string | null
          due_date?: string | null
          estimated_hours?: number | null
          id?: string
          list_id: string
          location?: Json | null
          position?: number
          priority?: string
          start_date?: string | null
          status?: string
          title: string
          updated_at?: string
          watching?: boolean
        }
        Update: {
          actual_hours?: number | null
          archived?: boolean
          cover?: string | null
          created_at?: string
          created_by?: string
          custom_fields?: Json | null
          description?: string | null
          due_date?: string | null
          estimated_hours?: number | null
          id?: string
          list_id?: string
          location?: Json | null
          position?: number
          priority?: string
          start_date?: string | null
          status?: string
          title?: string
          updated_at?: string
          watching?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "project_cards_list_id_fkey"
            columns: ["list_id"]
            isOneToOne: false
            referencedRelation: "project_lists"
            referencedColumns: ["id"]
          },
        ]
      }
      project_checklist_items: {
        Row: {
          assignee: string | null
          checklist_id: string
          completed: boolean
          created_at: string
          due_date: string | null
          id: string
          position: number
          text: string
          updated_at: string
        }
        Insert: {
          assignee?: string | null
          checklist_id: string
          completed?: boolean
          created_at?: string
          due_date?: string | null
          id?: string
          position?: number
          text: string
          updated_at?: string
        }
        Update: {
          assignee?: string | null
          checklist_id?: string
          completed?: boolean
          created_at?: string
          due_date?: string | null
          id?: string
          position?: number
          text?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_checklist_items_checklist_id_fkey"
            columns: ["checklist_id"]
            isOneToOne: false
            referencedRelation: "project_checklists"
            referencedColumns: ["id"]
          },
        ]
      }
      project_checklists: {
        Row: {
          card_id: string
          created_at: string
          id: string
          title: string
          updated_at: string
        }
        Insert: {
          card_id: string
          created_at?: string
          id?: string
          title: string
          updated_at?: string
        }
        Update: {
          card_id?: string
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_checklists_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "project_cards"
            referencedColumns: ["id"]
          },
        ]
      }
      project_comments: {
        Row: {
          author: string
          author_name: string
          card_id: string
          created_at: string
          edited_at: string | null
          id: string
          mentions: string[] | null
          text: string
        }
        Insert: {
          author: string
          author_name: string
          card_id: string
          created_at?: string
          edited_at?: string | null
          id?: string
          mentions?: string[] | null
          text: string
        }
        Update: {
          author?: string
          author_name?: string
          card_id?: string
          created_at?: string
          edited_at?: string | null
          id?: string
          mentions?: string[] | null
          text?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_comments_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "project_cards"
            referencedColumns: ["id"]
          },
        ]
      }
      project_labels: {
        Row: {
          board_id: string
          color: string
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          board_id: string
          color: string
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          board_id?: string
          color?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_labels_board_id_fkey"
            columns: ["board_id"]
            isOneToOne: false
            referencedRelation: "project_boards"
            referencedColumns: ["id"]
          },
        ]
      }
      project_lists: {
        Row: {
          archived: boolean
          board_id: string
          color: string
          created_at: string
          id: string
          position: number
          rules: Json | null
          subscribed: boolean
          title: string
          updated_at: string
        }
        Insert: {
          archived?: boolean
          board_id: string
          color?: string
          created_at?: string
          id?: string
          position?: number
          rules?: Json | null
          subscribed?: boolean
          title: string
          updated_at?: string
        }
        Update: {
          archived?: boolean
          board_id?: string
          color?: string
          created_at?: string
          id?: string
          position?: number
          rules?: Json | null
          subscribed?: boolean
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_lists_board_id_fkey"
            columns: ["board_id"]
            isOneToOne: false
            referencedRelation: "project_boards"
            referencedColumns: ["id"]
          },
        ]
      }
      project_members: {
        Row: {
          added_at: string
          added_by: string | null
          avatar: string | null
          board_id: string
          created_at: string
          email: string
          id: string
          name: string
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          added_at?: string
          added_by?: string | null
          avatar?: string | null
          board_id: string
          created_at?: string
          email: string
          id?: string
          name: string
          role?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          added_at?: string
          added_by?: string | null
          avatar?: string | null
          board_id?: string
          created_at?: string
          email?: string
          id?: string
          name?: string
          role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_members_board_id_fkey"
            columns: ["board_id"]
            isOneToOne: false
            referencedRelation: "project_boards"
            referencedColumns: ["id"]
          },
        ]
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
      user_permissions: {
        Row: {
          created_at: string
          granted: boolean
          granted_at: string | null
          granted_by: string | null
          id: string
          page: Database["public"]["Enums"]["page_permission"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          granted?: boolean
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          page: Database["public"]["Enums"]["page_permission"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          granted?: boolean
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          page?: Database["public"]["Enums"]["page_permission"]
          updated_at?: string
          user_id?: string
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
      remove_user_completely: {
        Args: { _user_id: string }
        Returns: boolean
      }
      user_can_manage_card_on_list: {
        Args: { _list_id: string; _user_id: string }
        Returns: boolean
      }
      user_has_board_access: {
        Args: { _board_id: string; _user_id: string }
        Returns: boolean
      }
      user_has_card_access: {
        Args: { _card_id: string; _user_id: string }
        Returns: boolean
      }
      user_has_page_permission: {
        Args: {
          _page: Database["public"]["Enums"]["page_permission"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      follow_up_status: "pendente" | "concluido" | "reagendado"
      follow_up_type: "ligacao" | "whatsapp" | "email" | "reuniao"
      funnel_stage_type:
        | "descoberta"
        | "consideracao"
        | "decisao"
        | "fechamento"
        | "fidelizacao"
      lead_status_advanced: "frio" | "morno" | "quente"
      lead_status_simple:
        | "novo"
        | "qualificado"
        | "proposta"
        | "negociacao"
        | "fechado"
        | "perdido"
      negotiation_temperature:
        | "muito_fraca"
        | "fraca"
        | "mediana"
        | "forte"
        | "muito_forte"
      page_permission:
        | "dashboard"
        | "projetos"
        | "crm"
        | "leads"
        | "vendas"
        | "colaboradores"
        | "acompanhamento"
        | "relatorios"
        | "configuracoes"
      tipo_discurso: "tecnico" | "emocional" | "inspirador"
      trava_emocional_type:
        | "inseguranca_financeira"
        | "medo_dar_errado"
        | "falta_apoio"
        | "falta_tempo"
        | "desconfianca"
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
      follow_up_status: ["pendente", "concluido", "reagendado"],
      follow_up_type: ["ligacao", "whatsapp", "email", "reuniao"],
      funnel_stage_type: [
        "descoberta",
        "consideracao",
        "decisao",
        "fechamento",
        "fidelizacao",
      ],
      lead_status_advanced: ["frio", "morno", "quente"],
      lead_status_simple: [
        "novo",
        "qualificado",
        "proposta",
        "negociacao",
        "fechado",
        "perdido",
      ],
      negotiation_temperature: [
        "muito_fraca",
        "fraca",
        "mediana",
        "forte",
        "muito_forte",
      ],
      page_permission: [
        "dashboard",
        "projetos",
        "crm",
        "leads",
        "vendas",
        "colaboradores",
        "acompanhamento",
        "relatorios",
        "configuracoes",
      ],
      tipo_discurso: ["tecnico", "emocional", "inspirador"],
      trava_emocional_type: [
        "inseguranca_financeira",
        "medo_dar_errado",
        "falta_apoio",
        "falta_tempo",
        "desconfianca",
      ],
      user_role: ["admin", "colaborador", "pending"],
    },
  },
} as const
