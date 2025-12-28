import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../../App/store";

// ======================= INTERFACES =======================

export interface ProductMedia {
  id: string;
  productId: string;
  url: string;
  type: string;
}

export interface ProductVariant {
  id: string;
  productId: string;
  name: string;
  additionalPrice: string; // From Numeric DB type
  sku: string;
}

export interface FlashDeal {
  id: string;
  productId: string;
  flashPrice: string; // From Numeric DB type
  startTime: string;
  endTime: string;
  dealStock: number;
  unitsSold: number;
  isActive: boolean;
}

// --- NEW INVENTORY INTERFACES ---

export interface BranchAvailability {
  branchId: string;
  branchName: string;
  status: "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK";
  quantity?: number;
}

export interface InventoryItem {
  id: string;
  branchId: string;
  productId: string;
  quantity: number;
  reorderLevel: number;
  product?: Product;
}

export interface PerfumeRaw {
  id: string;
  productId: string;
  stockLevel: "EMPTY" | "QUARTER" | "HALF" | "FULL";
  updatedAt: string;
  product?: Product;
}

export interface Product {
  id: string;
  name: string;
  slug: string; 
  categoryId: string;
  subcategoryId?: string | null;
  description?: string | null;
  basePrice: string; // Backend returns Numeric as string
  gallery: string[]; 
  createdAt: string;
  updatedAt: string;
  media?: ProductMedia[];
  variants?: ProductVariant[];
  flashDeals?: FlashDeal[];
}

interface ProductResponse {
  data: Product[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

// ======================= API DEFINITION =======================

export const productApi = createApi({
  reducerPath: "productApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:5000/api/products", 
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) headers.set("authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ["Product", "FlashDeal", "Media", "Variant", "Inventory"],
  endpoints: (builder) => ({
    
    // --- PRODUCT CRUD ---
    getAllProducts: builder.query<ProductResponse, { page?: number; limit?: number; search?: string; categoryId?: string }>({
      query: (params) => ({ url: "/", params }),
      providesTags: (result) =>
        result 
          ? [
              ...result.data.map(({ id }) => ({ type: "Product" as const, id })), 
              { type: "Product", id: "LIST" }
            ] 
          : [{ type: "Product", id: "LIST" }],
    }),

    getProductDetails: builder.query<Product, string>({
      query: (id) => `/details/${id}`,
      providesTags: (result, error, id) => [{ type: "Product", id }],
    }),

    createProduct: builder.mutation<Product, Partial<Product>>({
      query: (body) => ({ url: "/", method: "POST", body }),
      invalidatesTags: [{ type: "Product", id: "LIST" }],
    }),

    updateProduct: builder.mutation<Product, { id: string; updates: Partial<Product> }>({
      query: ({ id, updates }) => ({ url: `/${id}`, method: "PATCH", body: updates }),
      invalidatesTags: (result, error, { id }) => [{ type: "Product", id }, { type: "Product", id: "LIST" }],
    }),

    deleteProduct: builder.mutation<{ message: string }, string>({
      query: (id) => ({ url: `/${id}`, method: "DELETE" }),
      invalidatesTags: [{ type: "Product", id: "LIST" }],
    }),

    // --- NEW: INVENTORY & AVAILABILITY ---
    getProductAvailability: builder.query<BranchAvailability[], string>({
      query: (id) => `/availability/${id}`,
      providesTags: (result, error, id) => [{ type: "Inventory", id }],
    }),

    getBranchInventory: builder.query<any, string>({
      query: (branchId) => `/branch-inventory/${branchId}`,
      providesTags: ["Inventory"],
    }),

    // --- FLASH DEALS ---
    getActiveFlashDeals: builder.query<FlashDeal[], void>({
      query: () => "/flash-deals/active",
      providesTags: ["FlashDeal"],
    }),

    getAllFlashDeals: builder.query<FlashDeal[], void>({
      query: () => "/flash-deals/all",
      providesTags: ["FlashDeal"],
    }),

    createFlashDeal: builder.mutation<FlashDeal, Partial<FlashDeal>>({
      query: (body) => ({ url: "/flash-deals", method: "POST", body }),
      invalidatesTags: (result) => [{ type: "Product", id: result?.productId }, "FlashDeal"],
    }),

    updateFlashDeal: builder.mutation<FlashDeal, { id: string; updates: Partial<FlashDeal> }>({
      query: ({ id, updates }) => ({ url: `/flash-deals/${id}`, method: "PATCH", body: updates }),
      invalidatesTags: (result) => [{ type: "Product", id: result?.productId }, "FlashDeal"],
    }),

    incrementFlashDealSale: builder.mutation<FlashDeal, string>({
      query: (id) => ({ url: `/flash-deals/increment/${id}`, method: "PATCH" }),
      invalidatesTags: ["FlashDeal"],
    }),

    // --- MEDIA ---
    getProductMedia: builder.query<ProductMedia[], string>({
      query: (productId) => `/media/product/${productId}`,
      providesTags: (result, error, productId) => [{ type: "Media", id: productId }],
    }),

    addMedia: builder.mutation<ProductMedia, Partial<ProductMedia>>({
      query: (body) => ({ url: "/media", method: "POST", body }),
      invalidatesTags: (result) => [{ type: "Product", id: result?.productId }, "Media"],
    }),

    deleteMedia: builder.mutation<{ message: string }, string>({
      query: (id) => ({ url: `/media/${id}`, method: "DELETE" }),
      invalidatesTags: ["Product", "Media"],
    }),

    // --- VARIANTS ---
    getProductVariants: builder.query<ProductVariant[], string>({
      query: (productId) => `/variants/product/${productId}`,
      providesTags: (result, error, productId) => [{ type: "Variant", id: productId }],
    }),

    createVariant: builder.mutation<ProductVariant, Partial<ProductVariant>>({
      query: (body) => ({ url: "/variants", method: "POST", body }),
      invalidatesTags: (result) => [{ type: "Product", id: result?.productId }, "Variant"],
    }),

    updateVariant: builder.mutation<ProductVariant, { id: string; updates: Partial<ProductVariant> }>({
      query: ({ id, updates }) => ({ url: `/variants/${id}`, method: "PATCH", body: updates }),
      invalidatesTags: (result) => [{ type: "Product", id: result?.productId }, "Variant"],
    }),

    bulkDeleteVariants: builder.mutation<{ message: string }, string[]>({
      query: (ids) => ({ url: "/variants/bulk", method: "DELETE", body: { ids } }),
      invalidatesTags: ["Product", "Variant"],
    }),
  }),
});

export const {
  useGetAllProductsQuery,
  useGetProductDetailsQuery,
  useGetProductAvailabilityQuery,
  useGetBranchInventoryQuery,
  useGetActiveFlashDealsQuery,
  useGetAllFlashDealsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useCreateFlashDealMutation,
  useUpdateFlashDealMutation,
  useIncrementFlashDealSaleMutation,
  useGetProductMediaQuery,
  useAddMediaMutation,
  useDeleteMediaMutation,
  useGetProductVariantsQuery,
  useCreateVariantMutation,
  useUpdateVariantMutation,
  useBulkDeleteVariantsMutation,
} = productApi;