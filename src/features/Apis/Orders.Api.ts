import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from "../../App/store"; 

/* ======================= TYPES ======================= */

export interface IOrderItem {
  id?: string;
  productId: string;
  variantId?: string | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface IOrder {
  id: string;
  orderNumber: string;
  userId: string;
  branchId: string;
  orderType: "delivery" | "pickup";
  salesChannel: "website" | "branch_pos";
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled" | "ready_for_pickup";
  paymentStatus: "pending" | "success" | "failed" | "refunded"; 
  paymentMethod: "mpesa" | "card" | "cash";
  subtotal: string;
  shippingFee: string;
  totalAmount: string;
  customerPhone: string;
  shippingAddress?: string | null;
  shippingArea?: string | null;
  mpesaReceiptNumber?: string | null;
  createdAt: string;
  updatedAt: string;
  items: IOrderItem[];
}

export interface ICreateOrderPayload {
  userId: string;
  branchId: string;
  orderType: string;
  salesChannel: string;
  customerPhone: string;
  shippingAddress: string;
  shippingArea: string;
  subtotal: number;
  shippingFee: number;
  totalAmount: number;
  paymentMethod: string;
  payment_status: string; 
  items: {
    productId: string;
    variantId: string | null;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }[];
}

/* ======================= API DEFINITION ======================= */

export const orderApi = createApi({
  reducerPath: 'orderApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: 'http://localhost:5000/api/orders', 
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Order'],
  endpoints: (builder) => ({
    
    // 🌍 Get All Orders (Super Admin View)
    getAllOrders: builder.query<IOrder[], { status?: string; limit?: number; offset?: number } | void>({
      query: (params) => ({
        url: '/all',
        params: params || {},
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Order' as const, id })),
              { type: 'Order', id: 'LIST' },
            ]
          : [{ type: 'Order', id: 'LIST' }],
    }),

    // 🛒 1. Place Order
    createOrder: builder.mutation<{ message: string; data: IOrder }, ICreateOrderPayload>({
      query: (orderPayload) => ({
        url: '/',
        method: 'POST',
        body: orderPayload,
      }),
      invalidatesTags: [{ type: 'Order', id: 'LIST' }],
    }),

    // 🔍 2. Get Order Details
    getOrderDetails: builder.query<IOrder, string>({
      query: (orderId) => `/details/${orderId}`,
      providesTags: (result, error, id) => [{ type: 'Order', id }],
    }),

    // 👤 3. Get User Orders
    getUserOrders: builder.query<IOrder[], string>({
      query: (userId) => `/user/${userId}`,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Order' as const, id })),
              { type: 'Order', id: 'LIST' },
            ]
          : [{ type: 'Order', id: 'LIST' }],
    }),

    // 🏢 4. Get Branch Orders
    getBranchOrders: builder.query<IOrder[], { branchId: string; status?: string }>({
      query: ({ branchId, status }) => ({
        url: `/branch/${branchId}`,
        params: status ? { status } : {},
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Order' as const, id })),
              { type: 'Order', id: 'LIST' },
            ]
          : [{ type: 'Order', id: 'LIST' }],
    }),

    // 💳 5. Update Payment
    updatePaymentStatus: builder.mutation<IOrder, { id: string; paymentStatus: string; mpesaReceiptNumber: string }>({
      query: ({ id, ...body }) => ({
        url: `/payment/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Order', id: 'LIST' },
        { type: 'Order', id },
      ],
    }),

    // 🚚 6. Update Status
    updateOrderStatus: builder.mutation<IOrder, { id: string; status: string }>({
      query: ({ id, status }) => ({
        url: `/status/${id}`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Order', id: 'LIST' },
        { type: 'Order', id },
      ],
    }),

    // ❌ 7. Cancel Order (Using POST as established)
    cancelOrder: builder.mutation<{ message: string; data: IOrder }, string>({
      query: (id) => ({
        url: `/cancel/${id}`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Order', id: 'LIST' },
        { type: 'Order', id },
      ],
    }),

    // 🗑️ 8. Delete Order (Permanent Removal)
    deleteOrder: builder.mutation<{ message: string; data: any }, string>({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Order', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetAllOrdersQuery,
  useCreateOrderMutation,
  useGetOrderDetailsQuery,
  useGetUserOrdersQuery,
  useGetBranchOrdersQuery,
  useUpdatePaymentStatusMutation,
  useUpdateOrderStatusMutation,
  useCancelOrderMutation,
  useDeleteOrderMutation, // Export the new hook
} = orderApi;