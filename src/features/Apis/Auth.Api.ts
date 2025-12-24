import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const authApi = createApi({
  reducerPath: 'authApi',
  // Replace with your local or production URL
  baseQuery: fetchBaseQuery({ baseUrl: 'http://localhost:5000/api/auth/' }),
  tagTypes: ['Auth'],
  endpoints: (builder) => ({
    
    // 🟢 Register User
    registerUser: builder.mutation({
      query: (userRegisterPayload) => ({
        url: 'register',
        method: 'POST',
        body: userRegisterPayload,
      }),
    }),

    // 🔑 Login User
    loginUser: builder.mutation({
      query: (userLoginCredentials) => ({
        url: 'login',
        method: 'POST',
        body: userLoginCredentials,
      }),
    }),

    // ✅ Verify Email (Confirmation Code)
    verifyEmail: builder.mutation({
      query: (verificationPayload) => ({
        url: 'verify-email',
        method: 'POST',
        body: verificationPayload, // { email, confirmationCode }
      }),
    }),

    // 📩 Resend Verification Email
    resendVerification: builder.mutation({
      query: (emailPayload) => ({
        url: 'resend-verification',
        method: 'POST',
        body: emailPayload, // { email }
      }),
    }),

  }),
});

// ✅ Export auto-generated hooks
export const {
  useRegisterUserMutation,
  useLoginUserMutation,
  useVerifyEmailMutation,
  useResendVerificationMutation,
} = authApi;