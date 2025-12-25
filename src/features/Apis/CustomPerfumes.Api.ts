import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../../App/store";

// 1. BASE TYPES
export interface BaseScent {
  id: string;
  name: string;
  notes: string;
  description?: string;
  imageUrl?: string;
  pricePerMl: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface CustomPerfume {
  id: string;
  userId: string;
  customName?: string;
  bottleSize: string;
  strength: "EDT" | "EDP";
  providesOwnBottle: boolean;
  status: "received" | "in_preparation" | "ready" | "shipped";
  totalPrice: string;
  createdAt: string;
  user?: {
    fullName: string;
    email: string;
  };
  bases?: {
    id: string;
    customPerfumeId: string;
    baseScentId: string;
    base: BaseScent;
  }[];
}

export const customPerfumeApi = createApi({
  reducerPath: "customPerfumeApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:5000/api/custom-perfumes",
    prepareHeaders: (headers, { getState }) => {
      const state = getState() as RootState;
      
      // Access the token from your auth state
      let token = state.auth.token;

      if (token) {
        // CLEANUP: Remove extra quotes if the token is stringified (e.g., from Redux Persist)
        const cleanToken = token.replace(/^"(.*)"$/, '$1');
        headers.set("authorization", `Bearer ${cleanToken}`);
      }
      return headers;
    },
  }),
  tagTypes: ["BaseScent", "CustomPerfume"],
  endpoints: (builder) => ({
    
    // ======================= BASE SCENTS (INGREDIENTS) =======================

    getBaseScents: builder.query<BaseScent[], { activeOnly?: boolean }>({
      query: (params) => ({
        url: "/base-scents",
        params: { activeOnly: params.activeOnly || false },
      }),
      providesTags: ["BaseScent"],
    }),

    createBaseScent: builder.mutation<BaseScent, Partial<BaseScent>>({
      query: (body) => ({
        url: "/base-scents",
        method: "POST",
        body,
      }),
      invalidatesTags: ["BaseScent"],
    }),

    updateBaseScent: builder.mutation<BaseScent, { id: string; body: Partial<BaseScent> }>({
      query: ({ id, body }) => ({
        url: `/base-scents/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["BaseScent"],
    }),

    deleteBaseScent: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/base-scents/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["BaseScent"],
    }),

    // ======================= CUSTOM PERFUMES (ALCHEMY) =======================

    getAllCustomPerfumes: builder.query<CustomPerfume[], void>({
      query: () => "/",
      providesTags: ["CustomPerfume"],
    }),

    createCustomPerfume: builder.mutation<CustomPerfume, Partial<CustomPerfume> & { baseScentIds: string[] }>({
      query: (body) => ({
        url: "/",
        method: "POST",
        body,
      }),
      invalidatesTags: ["CustomPerfume"],
    }),

    getUserCustomPerfumes: builder.query<CustomPerfume[], string>({
      query: (userId) => `/user/${userId}`,
      providesTags: ["CustomPerfume"],
    }),

    getCustomPerfumeDetails: builder.query<CustomPerfume, string>({
      query: (id) => `/details/${id}`,
      providesTags: (_result, _error, id) => [{ type: "CustomPerfume", id }],
    }),

    updateCustomPerfumeStatus: builder.mutation<CustomPerfume, { id: string; status: string }>({
      query: ({ id, status }) => ({
        url: `/status/${id}`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: "CustomPerfume", id }, "CustomPerfume"],
    }),

    deleteCustomPerfume: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["CustomPerfume"],
    }),
  }),
});

export const {
  useGetBaseScentsQuery,
  useCreateBaseScentMutation,
  useUpdateBaseScentMutation,
  useDeleteBaseScentMutation,
  useGetAllCustomPerfumesQuery,
  useCreateCustomPerfumeMutation,
  useGetUserCustomPerfumesQuery,
  useGetCustomPerfumeDetailsQuery,
  useUpdateCustomPerfumeStatusMutation,
  useDeleteCustomPerfumeMutation,
} = customPerfumeApi;