import { useCallback, useEffect, useMemo, useState } from "react";
import { createEmptyBudgetInput } from "../config/defaultBudgetInput";
import { apiService } from "../services/api.service";
import { simulateBudget } from "../services/calculation.service";
import { AppConfig, Budget, BudgetInput, CostBreakdown } from "../types/budget.types";
import { FormErrors, validateBudgetInput } from "../utils/validation";

const EMPTY_COSTS: CostBreakdown = {
  materialCost: 0,
  machineCost: 0,
  modelingCost: 0,
  scanningCost: 0,
  slicingCost: 0,
  total: 0,
};

/**
 * Hook central do formulario de orcamento: carrega a configuracao (materiais e
 * parametros), mantem o estado dos dados informados, calcula a simulacao
 * instantanea a cada mudanca e coordena a criacao/persistencia do orcamento.
 */
export function useBudgetForm() {
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [configError, setConfigError] = useState<string | null>(null);
  const [input, setInput] = useState<BudgetInput>(createEmptyBudgetInput());
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [lastBudget, setLastBudget] = useState<Budget | null>(null);

  useEffect(() => {
    apiService
      .getConfig()
      .then(setConfig)
      .catch(() => setConfigError("Nao foi possivel carregar as configuracoes do laboratorio."));
  }, []);

  const costs = useMemo<CostBreakdown>(() => {
    if (!config) return EMPTY_COSTS;
    return simulateBudget(input, config);
  }, [input, config]);

  const updateInput = useCallback((updater: (draft: BudgetInput) => BudgetInput) => {
    setInput((prev) => updater(prev));
  }, []);

  const reset = useCallback(() => {
    setInput(createEmptyBudgetInput());
    setErrors({});
    setSubmitError(null);
    setLastBudget(null);
  }, []);

  const submit = useCallback(async (): Promise<Budget | null> => {
    const validationErrors = validateBudgetInput(input);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return null;
    }

    setSubmitting(true);
    setSubmitError(null);
    try {
      const budget = await apiService.createBudget(input);
      setLastBudget(budget);
      return budget;
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Erro ao gerar orcamento.");
      return null;
    } finally {
      setSubmitting(false);
    }
  }, [input]);

  return {
    config,
    configError,
    input,
    updateInput,
    costs,
    errors,
    submitting,
    submitError,
    lastBudget,
    submit,
    reset,
  };
}
