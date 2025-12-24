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

export interface Category {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  slug: string;
  subcategories?: SubCategory[]; // Match lowercase 'c' from JSON
  createdAt: string;
  updatedAt?: string;
}

// 2. RESPONSE WRAPPERS (Matching your log: { data: [], meta: {} })
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
  tagTypes: ["Category", "SubCategory"],
  endpoints: (builder) => ({
    
    // ======================= CATEGORIES =======================

    // GET ALL CATEGORIES
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

    // GET CATEGORY DETAILS (With Subs)
    getCategoryDetails: builder.query<Category, string>({
      query: (id) => `/categories/details/${id}`,
      // If your backend wraps this single object in a { data: {} } property:
      transformResponse: (response: any) => response.data || response,
      providesTags: (_result, _error, id) => [{ type: "Category", id }],
    }),

    // CREATE CATEGORY
    createCategory: builder.mutation<Category, Partial<Category>>({
      query: (body) => ({
        url: "/categories",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Category"],
    }),

    // UPDATE CATEGORY
    updateCategory: builder.mutation<Category, { id: string; body: Partial<Category> }>({
      query: ({ id, body }) => ({
        url: `/categories/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Category"],
    }),

    // DELETE CATEGORY
    deleteCategory: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/categories/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Category"],
    }),

    // ======================= SUBCATEGORIES =======================

    // GET ALL SUBCATEGORIES
    getSubCategories: builder.query<SubCategoryResponse, { page?: number; limit?: number; search?: string }>({
      query: (params) => ({
        url: "/categories/sub",
        params,
      }),
      providesTags: ["SubCategory"],
    }),

    // GET SUBCATEGORY BY SLUG
    getSubBySlug: builder.query<SubCategory, string>({
      query: (slug) => `/categories/sub/slug?slug=${slug}`,
      providesTags: ["SubCategory"],
    }),

    // CREATE SUBCATEGORY
    createSubCategory: builder.mutation<SubCategory, { categoryId: string; name: string; slug: string }>({
      query: (body) => ({
        url: "/categories/sub",
        method: "POST",
        body,
      }),
      invalidatesTags: ["SubCategory", "Category"],
    }),

    // UPDATE SUBCATEGORY
    updateSubCategory: builder.mutation<SubCategory, { id: string; body: Partial<SubCategory> }>({
      query: ({ id, body }) => ({
        url: `/categories/sub/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["SubCategory"],
    }),

    // DELETE SINGLE SUBCATEGORY
    deleteSubCategory: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/categories/sub/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["SubCategory"],
    }),

    // BULK DELETE SUBCATEGORIES
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
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useGetSubCategoriesQuery,
  useGetSubBySlugQuery,
  useCreateSubCategoryMutation,
  useUpdateSubCategoryMutation,
  useDeleteSubCategoryMutation,
  useBulkDeleteSubsMutation,
} = categoryApi;