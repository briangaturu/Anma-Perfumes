import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from "../../App/store"; // Adjust path to your store

export interface IBranch {
  id: string;
  name: string;
  code: string;
  city: string;
  address: string;
  gallery: string[];
  contactNumber: string;
  email: string;
  storeHours: string;
  googleMapsUrl?: string;
  offersJewellery: boolean;
  offersCosmetics: boolean;
  offersPerfumes: boolean;
  status: "active" | "inactive" | "renovating";
  createdAt: string;
  updatedAt: string;
}

type BranchResponse = {
  data: IBranch[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export const branchApi = createApi({
  reducerPath: 'branchApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: 'http://localhost:5000/api/branches/',
    // 🛡️ Token Injection Logic
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Branch'],
  endpoints: (builder) => ({
    
    // 📍 Get All Branches (With optional filters)
    getBranches: builder.query<BranchResponse, { city?: string; search?: string; page?: number } | void>({
      query: (params) => ({
        url: '',
        params: params || {},
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: 'Branch' as const, id })),
              { type: 'Branch', id: 'LIST' },
            ]
          : [{ type: 'Branch', id: 'LIST' }],
    }),

    // 🔍 Get Single Branch Details
    getBranchDetails: builder.query<IBranch, string>({
      query: (id) => `${id}`,
      providesTags: (result, error, id) => [{ type: 'Branch', id }],
    }),

    // 🏗️ Create Branch (Admin Only)
    createBranch: builder.mutation<IBranch, Partial<IBranch>>({
      query: (branchPayload) => ({
        url: '',
        method: 'POST',
        body: branchPayload,
      }),
      invalidatesTags: [{ type: 'Branch', id: 'LIST' }],
    }),

    // ✏️ Update Branch Details
    updateBranch: builder.mutation<IBranch, { id: string; updates: Partial<IBranch> }>({
      query: ({ id, updates }) => ({
        url: `${id}`,
        method: 'PATCH',
        body: updates,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Branch', id: 'LIST' },
        { type: 'Branch', id },
      ],
    }),

    // 🛠️ Update Status (Active / Renovating)
    updateBranchStatus: builder.mutation<IBranch, { id: string; status: string }>({
      query: ({ id, status }) => ({
        url: `status/${id}`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Branch', id: 'LIST' },
        { type: 'Branch', id },
      ],
    }),

    // ❌ Delete Branch
    deleteBranch: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Branch', id: 'LIST' }],
    }),

  }),
});

// ✅ Export auto-generated hooks
export const {
  useGetBranchesQuery,
  useGetBranchDetailsQuery,
  useCreateBranchMutation,
  useUpdateBranchMutation,
  useUpdateBranchStatusMutation,
  useDeleteBranchMutation,
} = branchApi;