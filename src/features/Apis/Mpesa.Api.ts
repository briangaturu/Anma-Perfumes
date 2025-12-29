import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../../App/store"; // Adjust path to your store

// ======================= INTERFACES =======================

export interface PaymentRecord {
  id: string;
  userId: string | null;
  orderId: string;
  method: string;
  status: "success" | "failed" | "pending";
  checkoutRequestId: string;
  merchantRequestId: string;
  transactionReference: string | null;
  phoneNumber: string | null;
  amount: string; // From Numeric DB type
  failureReason: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RevenueReport {
  totalRevenue: number;
}

export interface StuckTransactionsResponse {
  count: number;
  data: PaymentRecord[];
}

// ======================= API DEFINITION =======================

export const paymentApi = createApi({
  reducerPath: "paymentApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:5000/api/payments",
    prepareHeaders: (headers, { getState }) => {
      // Pulling directly from Redux State to avoid localStorage parsing issues
      const state = getState() as RootState;
      const token = state.auth.token;

      if (token) {
        // Cleaning the token in case it's double-quoted in state
        const cleanToken = token.replace(/^"|"$/g, '').replace(/\\"/g, '');
        headers.set("authorization", `Bearer ${cleanToken}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Payments", "Revenue"],
  endpoints: (builder) => ({
    
    // 1. INITIATE M-PESA STK PUSH
    initiateStkPush: builder.mutation<any, { amount: number; phoneNumber: string; orderId: string; userId: string }>({
      query: (body) => ({
        url: "/stk-push",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Payments"],
    }),

    // 2. GET PAYMENTS BY ORDER ID (Used for Polling)
    getPaymentsByOrderId: builder.query<PaymentRecord[], string>({
      query: (orderId) => `/order/${orderId}`,
      providesTags: (result, error, orderId) => [{ type: "Payments", id: orderId }],
    }),

    // 3. GET USER TRANSACTION HISTORY
    getPaymentsByUserId: builder.query<PaymentRecord[], string>({
      query: (userId) => `/user/${userId}`,
      providesTags: ["Payments"],
    }),

    // 4. ADMIN: GET ALL PAYMENTS
    getAllPayments: builder.query<PaymentRecord[], void>({
      query: () => "/all",
      providesTags: (result) =>
        result 
          ? [
              ...result.map(({ id }) => ({ type: "Payments" as const, id })), 
              { type: "Payments", id: "LIST" }
            ] 
          : [{ type: "Payments", id: "LIST" }],
    }),

    // 5. ADMIN: GET REVENUE ANALYTICS
    getRevenueReport: builder.query<RevenueReport, void>({
      query: () => "/analytics/revenue",
      providesTags: ["Revenue"],
    }),

    // 6. ADMIN: GET STUCK TRANSACTIONS
    getStuckTransactions: builder.query<StuckTransactionsResponse, void>({
      query: () => "/maintenance/stuck",
      providesTags: ["Payments"],
    }),

    // 7. ADMIN: DELETE PAYMENT RECORD
    deletePayment: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Payments", id: "LIST" }, "Revenue"],
    }),
  }),
});

export const {
  useInitiateStkPushMutation,
  useGetPaymentsByOrderIdQuery,
  useGetPaymentsByUserIdQuery,
  useGetAllPaymentsQuery,
  useGetRevenueReportQuery,
  useGetStuckTransactionsQuery,
  useDeletePaymentMutation,
} = paymentApi;