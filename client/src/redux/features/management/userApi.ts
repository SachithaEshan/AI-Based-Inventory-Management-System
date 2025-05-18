import { baseApi } from "../baseApi";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  city?: string;
  country?: string;
}

interface UserResponse {
  data: User[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface ApiResponse<T> {
  statusCode: number;
  success: boolean;
  message: string;
  data: T;
}

interface QueryParams {
  page: number;
  limit: number;
  search?: string;
}

const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllUsers: builder.query<ApiResponse<UserResponse>, QueryParams>({
      query: (query) => ({
        url: '/users/all',
        method: 'GET',
        params: query
      }),
      providesTags: ['user']
    }),
    createAdmin: builder.mutation<ApiResponse<{ token: string }>, { name: string; email: string; password: string }>({
      query: (payload) => ({
        url: '/users/admin',
        method: 'POST',
        body: payload
      }),
      invalidatesTags: ['user']
    }),
    updateUserRole: builder.mutation<ApiResponse<User>, { userId: string; role: string }>({
      query: ({ userId, role }) => ({
        url: `/users/${userId}/role`,
        method: 'PATCH',
        body: { role }
      }),
      invalidatesTags: ['user']
    }),
    updateUserStatus: builder.mutation<ApiResponse<User>, { userId: string; status: string }>({
      query: ({ userId, status }) => ({
        url: `/users/${userId}/status`,
        method: 'PATCH',
        body: { status }
      }),
      invalidatesTags: ['user']
    })
  })
});

export const {
  useGetAllUsersQuery,
  useCreateAdminMutation,
  useUpdateUserRoleMutation,
  useUpdateUserStatusMutation
} = userApi; 