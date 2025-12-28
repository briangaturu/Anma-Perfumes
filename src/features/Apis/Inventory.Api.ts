import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../../App/store";

export const inventoryApi = createApi({
  reducerPath: "inventoryApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:5000/api", // Base URL from your variables
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Inventory"],
  endpoints: (builder) => ({
    
    // 1. BULK ASSIGN PRODUCT TO ALL 3 BRANCHES
    bulkAssignBranches: builder.mutation<any, { productId: string; branchIds: string[]; initialQuantity: number }>({
      query: (body) => ({
        url: "/inventory/standard/bulk-assign",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Inventory"],
    }),

    // 2. SYNC STOCK (Update ONE Branch)
    syncStandardStock: builder.mutation<any, { productId: string; branchId: string; quantity: number; reorderLevel: number }>({
      query: (body) => ({
        url: "/inventory/standard/sync",
        method: "POST",
        body,
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "Inventory", id: arg.productId }, // Updates specific product views
        "Inventory" // Updates branch lists
      ],
    }),

    // 3. GET PRODUCT AVAILABILITY (Public)
    getProductAvailability: builder.query<any, string>({
      query: (productId) => `/inventory/availability/${productId}`,
      providesTags: (result, error, productId) => [{ type: "Inventory", id: productId }],
    }),

    // 4. GET BRANCH INVENTORY (Admin)
    getInventoryByBranch: builder.query<any, string>({
      query: (branchId) => `/inventory/standard/branch/${branchId}`,
      providesTags: ["Inventory"],
    }),

    // 5. DELETE INVENTORY RECORD
    deleteInventoryRecord: builder.mutation<any, string>({
      query: (inventoryId) => ({
        url: `/inventory/standard/${inventoryId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Inventory"],
    }),

  }),
});

export const {
  useBulkAssignBranchesMutation,
  useSyncStandardStockMutation,
  useGetProductAvailabilityQuery,
  useGetInventoryByBranchQuery,
  useDeleteInventoryRecordMutation,
} = inventoryApi;