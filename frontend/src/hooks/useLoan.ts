"use client";

import { useCallback, useState } from "react";
import type {
  Application,
  Loan,
  LoanCalculation,
  PersonalDetailsInput,
} from "@/types";
import { api } from "@/lib/api";

type State = {
  application: Application | null;
  loan: Loan | null;
  isLoading: boolean;
  error: string | null;
};

export const useLoan = () => {
  const [state, setState] = useState<State>({
    application: null,
    loan: null,
    isLoading: false,
    error: null,
  });

  const fetchMyApplication = useCallback(async (): Promise<void> => {
    setState((s) => ({ ...s, isLoading: true, error: null }));
    try {
      const data = await api.borrower.getMyApplication();
      setState((s) => ({
        ...s,
        isLoading: false,
        application: data.application,
        loan: data.loan,
      }));
    } catch (e) {
      const msg =
        typeof e === "object" && e && "message" in e
          ? String((e as { message: unknown }).message)
          : "Failed to load";
      setState((s) => ({ ...s, isLoading: false, error: msg }));
    }
  }, []);

  const savePersonalDetails = useCallback(
    async (input: PersonalDetailsInput): Promise<Application> => {
      setState((s) => ({ ...s, isLoading: true, error: null }));
      try {
        const app = await api.borrower.savePersonalDetails(input);
        setState((s) => ({ ...s, isLoading: false, application: app }));
        return app;
      } catch (e) {
        const msg =
          typeof e === "object" && e && "message" in e
            ? String((e as { message: unknown }).message)
            : "Failed to save";
        setState((s) => ({ ...s, isLoading: false, error: msg }));
        throw e;
      }
    },
    [],
  );

  const uploadSlip = useCallback(async (file: File): Promise<Application> => {
    setState((s) => ({ ...s, isLoading: true, error: null }));
    try {
      const app = await api.borrower.uploadSlip(file);
      setState((s) => ({ ...s, isLoading: false, application: app }));
      return app;
    } catch (e) {
      const msg =
        typeof e === "object" && e && "message" in e
          ? String((e as { message: unknown }).message)
          : "Failed to upload";
      setState((s) => ({ ...s, isLoading: false, error: msg }));
      throw e;
    }
  }, []);

  const applyForLoan = useCallback(
    async (
      principal: number,
      tenureDays: number,
    ): Promise<{ application: Application; loan: Loan }> => {
      setState((s) => ({ ...s, isLoading: true, error: null }));
      try {
        const result = await api.borrower.applyForLoan({
          principal,
          tenureDays,
        });
        setState((s) => ({
          ...s,
          isLoading: false,
          application: result.application,
          loan: result.loan,
        }));
        return result;
      } catch (e) {
        const msg =
          typeof e === "object" && e && "message" in e
            ? String((e as { message: unknown }).message)
            : "Failed to apply";
        setState((s) => ({ ...s, isLoading: false, error: msg }));
        throw e;
      }
    },
    [],
  );

  const getLiveCalculation = useCallback(
    (principal: number, tenureDays: number): LoanCalculation => {
      return api.calc.getLiveCalculation(principal, tenureDays);
    },
    [],
  );

  return {
    ...state,
    fetchMyApplication,
    savePersonalDetails,
    uploadSlip,
    applyForLoan,
    getLiveCalculation,
  };
};
