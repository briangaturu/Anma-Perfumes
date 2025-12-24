import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../../App/store";

export interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl: string;
  ctaText?: string;
  ctaLink?: string;
  type: "hero" | "side";
  priority: number;
  isActive: string | boolean;
  createdAt: string;
  updatedAt: string;
}

// Since your backend returns [ {...} ], we define the response as an array
type BannerResponse = Banner[];

export const bannerApi = createApi({
  reducerPath: "bannerApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:5000/api",
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) headers.set("authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ["Banner"],
  endpoints: (builder) => ({
    getActiveBanners: builder.query<BannerResponse, "hero" | "side">({
      query: (type) => `/banners/active?type=${type}`,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Banner" as const, id })),
              { type: "Banner", id: "LIST" },
            ]
          : [{ type: "Banner", id: "LIST" }],
    }),

    getAllBanners: builder.query<BannerResponse, void>({
      query: () => "/banners",
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Banner" as const, id })),
              { type: "Banner", id: "LIST" },
            ]
          : [{ type: "Banner", id: "LIST" }],
    }),

    createBanner: builder.mutation<Banner, Partial<Banner>>({
      query: (body) => ({ url: "/banners", method: "POST", body }),
      invalidatesTags: [{ type: "Banner", id: "LIST" }],
    }),

    deleteBanner: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({ url: `/banners/${id}`, method: "DELETE" }),
      invalidatesTags: [{ type: "Banner", id: "LIST" }],
    }),
  }),
});

export const { useGetActiveBannersQuery, useGetAllBannersQuery, useCreateBannerMutation, useDeleteBannerMutation } = bannerApi;