import { baseApi } from "../baseApi";

const orderApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPendingOrders: builder.query({
      query: () => ({
        url: '/orders/pending',
        method: 'GET'
      }),
      providesTags: ['order']
    }),
    updateOrderStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/orders/${id}/status`,
        method: 'PATCH',
        body: { status }
      }),
      invalidatesTags: ['order']
    })
  })
});

export const {
  useGetPendingOrdersQuery,
  useUpdateOrderStatusMutation
} = orderApi; 