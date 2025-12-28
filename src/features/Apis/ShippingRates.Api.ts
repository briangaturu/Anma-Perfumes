import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../../App/store";

// ======================= INTERFACES =======================

export interface ShippingRate {
  id: string;
  branchId: string;
  areaName: string;
  fee: string; // Numeric from DB as string
  requiresLandmark: boolean;
  landmarkPlaceholder?: string | null;
  minOrderForFreeShipping?: string | null;
  estimatedDeliveryTime?: string | null;
  isAvailable: boolean;
  createdAt: string;
  branch?: {
    id: string;
    name: string;
    location: string;
  };
}

export interface ShippingCalculation {
  rateId: string;
  areaName: string;
  summary: {
    baseFee: number;
    multiVaultSurcharge: number;
    totalShipping: number;
    isFreeEligible: boolean;
    estimatedTime: string | null;
  };
  requirements: {
    requiresLandmark: boolean;
    hint?: string;
  };
}

// ======================= API DEFINITION =======================

export const shippingApi = createApi({
  reducerPath: "shippingApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:5000/api/shipping", 
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) headers.set("authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ["Shipping"],
  endpoints: (builder) => ({
    
    // --- PUBLIC / CHECKOUT ---

    /**
     * Fetch available shipping rates. 
     * Supports filtering by branchIds (comma-separated string in query)
     */
    getShippingRates: builder.query<ShippingRate[], string[] | void>({
      query: (branchIds) => ({
        url: "/",
        params: branchIds ? { branchIds: branchIds.join(",") } : {},
      }),
      transformResponse: (response: { success: boolean; data: ShippingRate[] }) => response.data,
      providesTags: (result) =>
        result 
          ? [
              ...result.map(({ id }) => ({ type: "Shipping" as const, id })), 
              { type: "Shipping", id: "LIST" }
            ] 
          : [{ type: "Shipping", id: "LIST" }],
    }),

    /**
     * Calculate cost based on subtotal and number of branches in cart
     */
    calculateShippingCost: builder.mutation<ShippingCalculation, { 
      rateId: string; 
      subtotal: number; 
      uniqueBranchCount: number 
    }>({
      query: (body) => ({
        url: "/calculate",
        method: "POST",
        body,
      }),
      transformResponse: (response: { success: boolean; data: ShippingCalculation }) => response.data,
    }),

    // --- ADMIN MANAGEMENT ---

    createShippingRate: builder.mutation<ShippingRate, Partial<ShippingRate>>({
      query: (body) => ({ 
        url: "/admin", 
        method: "POST", 
        body 
      }),
      invalidatesTags: [{ type: "Shipping", id: "LIST" }],
    }),

    updateShippingRate: builder.mutation<ShippingRate, { id: string; updates: Partial<ShippingRate> }>({
      query: ({ id, updates }) => ({ 
        url: `/admin/${id}`, 
        method: "PATCH", 
        body: updates 
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Shipping", id }, 
        { type: "Shipping", id: "LIST" }
      ],
    }),

    deleteShippingRate: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({ 
        url: `/admin/${id}`, 
        method: "DELETE" 
      }),
      invalidatesTags: [{ type: "Shipping", id: "LIST" }],
    }),
  }),
});

export const {
  useGetShippingRatesQuery,
  useCalculateShippingCostMutation,
  useCreateShippingRateMutation,
  useUpdateShippingRateMutation,
  useDeleteShippingRateMutation,
} = shippingApi;