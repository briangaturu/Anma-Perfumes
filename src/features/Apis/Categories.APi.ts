import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../../App/store";

// 1. BASE TYPES
export interface SubCategory {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt?: string;
}

// Added Product Interface to match your service relations (media, variants, inventory)
export interface Product {
  id: string;
  name: string;
  categoryId: string;
  subcategoryId?: string;
  description?: string;
  basePrice: string;
  media: { url: string; type: string }[];
  variants?: any[];
  inventory?: any[];
  perfumesFinished?: any[]; // Specific for finished perfume stock
  createdAt: string;
  updatedAt?: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  slug: string;
  subcategories?: SubCategory[]; 
  createdAt: string;
  updatedAt?: string;
}

// 2. RESPONSE WRAPPERS
interface CategoryResponse {
  data: Category[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface SubCategoryResponse {
  data: SubCategory[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const categoryApi = createApi({
  reducerPath: "categoryApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:5000/api",
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Category", "SubCategory", "Product"], // Added Product Tag
  endpoints: (builder) => ({
    
    // ======================= CATEGORIES =======================

    getCategories: builder.query<CategoryResponse, { page?: number; limit?: number; search?: string }>({
      query: (params) => ({
        url: "/categories",
        params: { 
            page: params.page || 1, 
            limit: params.limit || 10, 
            search: params.search 
        },
      }),
      providesTags: ["Category"],
    }),

    getCategoryDetails: builder.query<Category, string>({
      query: (id) => `/categories/details/${id}`,
      transformResponse: (response: any) => response.data || response,
      providesTags: (_result, _error, id) => [{ type: "Category", id }],
    }),

    // NEW: FETCH ALL PRODUCTS IN A CATEGORY
    getProductsByCategoryId: builder.query<Product[], string>({
      query: (id) => `/categories/${id}/products`,
      providesTags: (result) => 
        result 
          ? [...result.map(({ id }) => ({ type: "Product" as const, id })), "Product"]
          : ["Product"],
    }),

    createCategory: builder.mutation<Category, Partial<Category>>({
      query: (body) => ({
        url: "/categories",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Category"],
    }),

    updateCategory: builder.mutation<Category, { id: string; body: Partial<Category> }>({
      query: ({ id, body }) => ({
        url: `/categories/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Category"],
    }),

    deleteCategory: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/categories/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Category"],
    }),

    // ======================= SUBCATEGORIES =======================

    getSubCategories: builder.query<SubCategoryResponse, { page?: number; limit?: number; search?: string }>({
      query: (params) => ({
        url: "/categories/sub",
        params,
      }),
      providesTags: ["SubCategory"],
    }),

    // NEW: FETCH ALL PRODUCTS IN A SUBCATEGORY
    getProductsBySubcategoryId: builder.query<Product[], string>({
      query: (id) => `/categories/sub/${id}/products`,
      providesTags: (result) => 
        result 
          ? [...result.map(({ id }) => ({ type: "Product" as const, id })), "Product"]
          : ["Product"],
    }),

    getSubBySlug: builder.query<SubCategory, string>({
      query: (slug) => `/categories/sub/slug?slug=${slug}`,
      providesTags: ["SubCategory"],
    }),

    createSubCategory: builder.mutation<SubCategory, { categoryId: string; name: string; slug: string }>({
      query: (body) => ({
        url: "/categories/sub",
        method: "POST",
        body,
      }),
      invalidatesTags: ["SubCategory", "Category"],
    }),

    updateSubCategory: builder.mutation<SubCategory, { id: string; body: Partial<SubCategory> }>({
      query: ({ id, body }) => ({
        url: `/categories/sub/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["SubCategory"],
    }),

    deleteSubCategory: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/categories/sub/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["SubCategory"],
    }),

    bulkDeleteSubs: builder.mutation<{ success: boolean }, string[]>({
      query: (ids) => ({
        url: "/categories/sub/bulk",
        method: "DELETE",
        body: { ids },
      }),
      invalidatesTags: ["SubCategory"],
    }),
  }),
});

export const {
  useGetCategoriesQuery,
  useGetCategoryDetailsQuery,
  useGetProductsByCategoryIdQuery, // Exported
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useGetSubCategoriesQuery,
  useGetProductsBySubcategoryIdQuery, // Exported
  useGetSubBySlugQuery,
  useCreateSubCategoryMutation,
  useUpdateSubCategoryMutation,
  useDeleteSubCategoryMutation,
  useBulkDeleteSubsMutation,
} = categoryApi;