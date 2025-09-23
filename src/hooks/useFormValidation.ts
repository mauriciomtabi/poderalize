import { useState, useCallback } from 'react';

// Tipos para validação
export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
}

export interface ValidationRules {
  [key: string]: ValidationRule;
}

export interface ValidationErrors {
  [key: string]: string;
}

export interface FormState<T> {
  values: T;
  errors: ValidationErrors;
  touched: { [key: string]: boolean };
  isValid: boolean;
  isSubmitting: boolean;
}

/**
 * Hook personalizado para validação de formulários
 * Fornece validação em tempo real e gerenciamento de estado do formulário
 */
export function useFormValidation<T extends Record<string, any>>(
  initialValues: T,
  validationRules: ValidationRules
) {
  const [state, setState] = useState<FormState<T>>({
    values: initialValues,
    errors: {},
    touched: {},
    isValid: true,
    isSubmitting: false,
  });

  // Valida um campo específico
  const validateField = useCallback((name: string, value: any): string | null => {
    const rules = validationRules[name];
    if (!rules) return null;

    // Required validation
    if (rules.required && (!value || value.toString().trim() === '')) {
      return 'Este campo é obrigatório';
    }

    if (!value) return null; // Se não é obrigatório e está vazio, não valida outros

    // MinLength validation
    if (rules.minLength && value.toString().length < rules.minLength) {
      return `Deve ter pelo menos ${rules.minLength} caracteres`;
    }

    // MaxLength validation
    if (rules.maxLength && value.toString().length > rules.maxLength) {
      return `Deve ter no máximo ${rules.maxLength} caracteres`;
    }

    // Pattern validation
    if (rules.pattern && !rules.pattern.test(value.toString())) {
      return 'Formato inválido';
    }

    // Custom validation
    if (rules.custom) {
      return rules.custom(value);
    }

    return null;
  }, [validationRules]);

  // Valida todos os campos
  const validateAllFields = useCallback((values: T): ValidationErrors => {
    const errors: ValidationErrors = {};
    
    Object.keys(validationRules).forEach(fieldName => {
      const error = validateField(fieldName, values[fieldName]);
      if (error) {
        errors[fieldName] = error;
      }
    });

    return errors;
  }, [validateField, validationRules]);

  // Atualiza um campo
  const setFieldValue = useCallback((name: string, value: any) => {
    setState(prev => {
      const newValues = { ...prev.values, [name]: value };
      const fieldError = validateField(name, value);
      const newErrors = { ...prev.errors };
      
      if (fieldError) {
        newErrors[name] = fieldError;
      } else {
        delete newErrors[name];
      }

      return {
        ...prev,
        values: newValues,
        errors: newErrors,
        isValid: Object.keys(newErrors).length === 0,
      };
    });
  }, [validateField]);

  // Marca um campo como tocado
  const setFieldTouched = useCallback((name: string, touched = true) => {
    setState(prev => ({
      ...prev,
      touched: { ...prev.touched, [name]: touched },
    }));
  }, []);

  // Manipula mudanças nos campos
  const handleChange = useCallback((name: string) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const value = event.target.value;
    setFieldValue(name, value);
    setFieldTouched(name, true);
  }, [setFieldValue, setFieldTouched]);

  // Manipula blur nos campos
  const handleBlur = useCallback((name: string) => () => {
    setFieldTouched(name, true);
  }, [setFieldTouched]);

  // Reset do formulário
  const reset = useCallback(() => {
    setState({
      values: initialValues,
      errors: {},
      touched: {},
      isValid: true,
      isSubmitting: false,
    });
  }, [initialValues]);

  // Submissão do formulário
  const handleSubmit = useCallback((onSubmit: (values: T) => Promise<void> | void) => 
    async (event: React.FormEvent) => {
      event.preventDefault();
      
      setState(prev => ({ ...prev, isSubmitting: true }));
      
      // Marcar todos os campos como tocados
      const allTouched = Object.keys(validationRules).reduce((acc, key) => {
        acc[key] = true;
        return acc;
      }, {} as { [key: string]: boolean });

      // Validar todos os campos
      const errors = validateAllFields(state.values);
      
      setState(prev => ({
        ...prev,
        errors,
        touched: allTouched,
        isValid: Object.keys(errors).length === 0,
      }));

      if (Object.keys(errors).length === 0) {
        try {
          await onSubmit(state.values);
        } catch (error) {
          console.error('Erro na submissão do formulário:', error);
        }
      }

      setState(prev => ({ ...prev, isSubmitting: false }));
    }, [state.values, validateAllFields, validationRules]);

  // Função helper para obter props do campo
  const getFieldProps = useCallback((name: string) => ({
    value: state.values[name] || '',
    onChange: handleChange(name),
    onBlur: handleBlur(name),
    error: state.touched[name] && state.errors[name],
  }), [state.values, state.touched, state.errors, handleChange, handleBlur]);

  return {
    ...state,
    setFieldValue,
    setFieldTouched,
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
    getFieldProps,
    validateField,
  };
}