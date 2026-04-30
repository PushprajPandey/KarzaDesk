import axios, { AxiosError } from "axios";
import type { AxiosInstance } from "axios";
import type {
  ApiResponse,
  Application,
  Loan,
  LoanCalculation,
  LoanConfigInput,
  Payment,
  PaymentInput,
  PersonalDetailsInput,
  User,
} from "@/types";
import { storage } from "@/lib/storage";
import { errorReporting } from "@/lib/errorReporting";

type AuthResult = { user: User; token: string };

type MyAppResult = { application: Application | null; loan: Loan | null };

type Paginated<T> = { items: T[]; page: number; limit: number; total: number };

type LeadRow = { user: User; applicationStatus: string };

type RecordPaymentResult = { payment: Payment; loan: Loan; isClosed: boolean };

let cachedClient: AxiosInstance | null = null;

const getClient = (): AxiosInstance => {
  if (cachedClient) {
    return cachedClient;
  }

  const baseURL = process.env.NEXT_PUBLIC_API_URL;
  if (!baseURL) {
    throw new Error("NEXT_PUBLIC_API_URL is required");
  }

  const client = axios.create({
    baseURL,
    withCredentials: true,
  });

  client.interceptors.request.use(
    (config) => {
      const token = storage.getToken();
      if (token) {
        config.headers = config.headers ?? {};
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error),
  );

  client.interceptors.response.use(
    (res) => res,
    (error: AxiosError) => {
      const status = error.response?.status;
      if (status === 401) {
        storage.clearAll();
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
      }
      return Promise.reject(error);
    },
  );

  cachedClient = client;
  return client;
};

const unwrap = <T>(data: ApiResponse<T>): T => {
  if (data.success) {
    return data.data;
  }
  throw new Error(data.message);
};

const toApiError = (
  e: unknown,
  endpoint?: string,
  method?: string,
): { message: string; status?: number; data?: unknown } => {
  let errorResult: { message: string; status?: number; data?: unknown };

  if (axios.isAxiosError(e)) {
    errorResult = {
      message: e.message,
      status: e.response?.status,
      data: e.response?.data,
    };
  } else if (e instanceof Error) {
    errorResult = { message: e.message };
  } else {
    errorResult = { message: "Unknown error" };
  }

  // Report API errors to error reporting service
  if (endpoint && method) {
    errorReporting.reportApiError(errorResult, endpoint, method);
  }

  return errorResult;
};

export const api = {
  auth: {
    async register(input: {
      fullName: string;
      email: string;
      password: string;
    }): Promise<AuthResult> {
      try {
        const res = await getClient().post<ApiResponse<AuthResult>>(
          "/api/auth/register",
          input,
        );
        return unwrap(res.data);
      } catch (e) {
        throw toApiError(e);
      }
    },
    async login(input: {
      email: string;
      password: string;
    }): Promise<AuthResult> {
      try {
        const res = await getClient().post<ApiResponse<AuthResult>>(
          "/api/auth/login",
          input,
        );
        return unwrap(res.data);
      } catch (e) {
        throw toApiError(e);
      }
    },
  },
  borrower: {
    async savePersonalDetails(
      input: PersonalDetailsInput,
    ): Promise<Application> {
      try {
        const res = await getClient().post<ApiResponse<Application>>(
          "/api/borrower/personal-details",
          input,
        );
        return unwrap(res.data);
      } catch (e) {
        throw toApiError(e);
      }
    },
    async uploadSlip(file: File): Promise<Application> {
      try {
        const form = new FormData();
        form.append("salarySlip", file);
        const res = await getClient().post<ApiResponse<Application>>(
          "/api/borrower/upload-salary-slip",
          form,
          {
            headers: { "Content-Type": "multipart/form-data" },
          },
        );
        return unwrap(res.data);
      } catch (e) {
        throw toApiError(e);
      }
    },
    async applyForLoan(
      input: LoanConfigInput,
    ): Promise<{ application: Application; loan: Loan }> {
      try {
        const res = await getClient().post<
          ApiResponse<{ application: Application; loan: Loan }>
        >("/api/borrower/apply", input);
        return unwrap(res.data);
      } catch (e) {
        throw toApiError(e);
      }
    },
    async getMyApplication(): Promise<MyAppResult> {
      try {
        const res =
          await getClient().get<ApiResponse<MyAppResult>>("/api/borrower/me");
        return unwrap(res.data);
      } catch (e) {
        throw toApiError(e);
      }
    },
  },
  sales: {
    async listLeads(): Promise<LeadRow[]> {
      try {
        const res =
          await getClient().get<ApiResponse<LeadRow[]>>("/api/sales/leads");
        return unwrap(res.data);
      } catch (e) {
        throw toApiError(e);
      }
    },
  },
  sanction: {
    async listApplications(
      page = 1,
      limit = 10,
    ): Promise<Paginated<Application>> {
      try {
        const res = await getClient().get<ApiResponse<Paginated<Application>>>(
          "/api/sanction/applications",
          {
            params: { page, limit },
          },
        );
        return unwrap(res.data);
      } catch (e) {
        throw toApiError(e);
      }
    },
    async approveApplication(
      id: string,
    ): Promise<{ application: Application; loan: Loan | null }> {
      try {
        const res = await getClient().post<
          ApiResponse<{ application: Application; loan: Loan | null }>
        >(`/api/sanction/applications/${id}/approve`);
        return unwrap(res.data);
      } catch (e) {
        throw toApiError(e);
      }
    },
    async rejectApplication(
      id: string,
      rejectionReason: string,
    ): Promise<Application> {
      try {
        const res = await getClient().post<ApiResponse<Application>>(
          `/api/sanction/applications/${id}/reject`,
          { rejectionReason },
        );
        return unwrap(res.data);
      } catch (e) {
        throw toApiError(e);
      }
    },
  },
  disbursement: {
    async listLoans(): Promise<Loan[]> {
      try {
        const res = await getClient().get<ApiResponse<Loan[]>>(
          "/api/disbursement/loans",
        );
        return unwrap(res.data);
      } catch (e) {
        throw toApiError(e);
      }
    },
    async disburseLoan(id: string): Promise<Loan> {
      try {
        const res = await getClient().post<ApiResponse<Loan>>(
          `/api/disbursement/loans/${id}/disburse`,
        );
        return unwrap(res.data);
      } catch (e) {
        throw toApiError(e);
      }
    },
  },
  collection: {
    async listActiveLoans(): Promise<Loan[]> {
      try {
        const res = await getClient().get<ApiResponse<Loan[]>>(
          "/api/collection/loans",
        );
        return unwrap(res.data);
      } catch (e) {
        throw toApiError(e);
      }
    },
    async recordPayment(
      loanId: string,
      input: PaymentInput,
    ): Promise<RecordPaymentResult> {
      try {
        const res = await getClient().post<ApiResponse<RecordPaymentResult>>(
          `/api/collection/loans/${loanId}/payments`,
          input,
        );
        return unwrap(res.data);
      } catch (e) {
        throw toApiError(e);
      }
    },
    async getLoanPayments(loanId: string): Promise<Payment[]> {
      try {
        const res = await getClient().get<ApiResponse<Payment[]>>(
          `/api/collection/loans/${loanId}/payments`,
        );
        return unwrap(res.data);
      } catch (e) {
        throw toApiError(e);
      }
    },
  },
  admin: {
    async getAllUsers(): Promise<User[]> {
      try {
        const res =
          await getClient().get<ApiResponse<User[]>>("/api/admin/users");
        return unwrap(res.data);
      } catch (e) {
        throw toApiError(e);
      }
    },
    async getAllLoans(): Promise<Loan[]> {
      try {
        const res =
          await getClient().get<ApiResponse<Loan[]>>("/api/admin/loans");
        return unwrap(res.data);
      } catch (e) {
        throw toApiError(e);
      }
    },
    async testConnection(): Promise<{ message: string }> {
      try {
        console.log("Testing admin connection...");
        const res =
          await getClient().get<ApiResponse<{ message: string }>>(
            "/api/admin/test",
          );
        console.log("Admin test response:", res.data);
        return unwrap(res.data);
      } catch (e) {
        console.error("Admin test error:", e);
        throw toApiError(e);
      }
    },
    async deleteUser(userId: string): Promise<{ message: string }> {
      try {
        console.log("Attempting to delete user with ID:", userId);
        const res = await getClient().delete<ApiResponse<{ message: string }>>(
          `/api/admin/users/${userId}`,
        );
        console.log("Delete user response:", res.data);
        return unwrap(res.data);
      } catch (e) {
        console.error("Delete user API error:", e);
        throw toApiError(e);
      }
    },
  },
  calc: {
    getLiveCalculation(principal: number, tenureDays: number): LoanCalculation {
      const p = Math.round(principal * 100) / 100;
      const t = Math.round(tenureDays);
      const interestRate: 12 = 12;
      const si = (p * interestRate * t) / (365 * 100);
      const simpleInterest = Math.round((si + Number.EPSILON) * 100) / 100;
      const totalRepayment =
        Math.round((p + simpleInterest + Number.EPSILON) * 100) / 100;
      const outstandingBalance =
        Math.round((totalRepayment + Number.EPSILON) * 100) / 100;
      return {
        principal: p,
        tenureDays: t,
        interestRate,
        simpleInterest,
        totalRepayment,
        outstandingBalance,
      };
    },
  },
};
