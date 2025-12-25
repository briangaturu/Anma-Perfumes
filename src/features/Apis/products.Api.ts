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
  additionalPrice: string;
  sku: string;
}

export interface FlashDeal {
  id: string;
  productId: string;
  flashPrice: string;
  startTime: string;
  endTime: string;
  dealStock: number;
  unitsSold: number;
  isActive: boolean;
}

export interface Product {
  id: string;
  name: string;
  categoryId: string;
  subcategoryId?: string;
  description?: string;
  basePrice: string;
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
  tagTypes: ["Product", "FlashDeal", "Media", "Variant"],
  endpoints: (builder) => ({
    
    // --- 1 & 6, 7, 8: PRODUCT CRUD ---
    getAllProducts: builder.query<ProductResponse, { page?: number; limit?: number; search?: string; categoryId?: string }>({
      query: (params) => ({ url: "/", params }),
      providesTags: (result) =>
        result ? [...result.data.map(({ id }) => ({ type: "Product" as const, id })), { type: "Product", id: "LIST" }] : [{ type: "Product", id: "LIST" }],
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

    // --- 3, 9, 10, 11, 12: FLASH DEALS ---
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
      invalidatesTags: ["FlashDeal", "Product"], // Invalidates Product to show deal badge on UI
    }),

    updateFlashDeal: builder.mutation<FlashDeal, { id: string; updates: Partial<FlashDeal> }>({
      query: ({ id, updates }) => ({ url: `/flash-deals/${id}`, method: "PATCH", body: updates }),
      invalidatesTags: ["FlashDeal", "Product"],
    }),

    incrementFlashDealSale: builder.mutation<FlashDeal, string>({
      query: (id) => ({ url: `/flash-deals/increment/${id}`, method: "PATCH" }),
      invalidatesTags: ["FlashDeal"],
    }),

    // --- 4, 13, 14, 15: MEDIA ---
    getProductMedia: builder.query<ProductMedia[], string>({
      query: (productId) => `/media/product/${productId}`,
      providesTags: ["Media"],
    }),

    addMedia: builder.mutation<ProductMedia, Partial<ProductMedia>>({
      query: (body) => ({ url: "/media", method: "POST", body }),
      invalidatesTags: (result) => [{ type: "Product", id: result?.productId }, "Media"],
    }),

    deleteMedia: builder.mutation<{ message: string }, string>({
      query: (id) => ({ url: `/media/${id}`, method: "DELETE" }),
      invalidatesTags: ["Product", "Media"],
    }),

    // --- 5, 16, 17, 18: VARIANTS ---
    getProductVariants: builder.query<ProductVariant[], string>({
      query: (productId) => `/variants/product/${productId}`,
      providesTags: ["Variant"],
    }),

    createVariant: builder.mutation<ProductVariant, Partial<ProductVariant>>({
      query: (body) => ({ url: "/variants", method: "POST", body }),
      invalidatesTags: (result) => [{ type: "Product", id: result?.productId }, "Variant"],
    }),

    updateVariant: builder.mutation<ProductVariant, { id: string; updates: Partial<ProductVariant> }>({
      query: ({ id, updates }) => ({ url: `/variants/${id}`, method: "PATCH", body: updates }),
      invalidatesTags: ["Product", "Variant"],
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