import { baseApi } from "../baseApi";

const notificationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getNotifications: builder.query({
      query: () => ({
        url: '/notifications',
        method: 'GET'
      }),
      providesTags: ['notification']
    }),
    getUnreadCount: builder.query({
      query: () => ({
        url: '/notifications/unread-count',
        method: 'GET'
      }),
      providesTags: ['notification']
    }),
    markAsRead: builder.mutation({
      query: (id) => ({
        url: `/notifications/${id}/read`,
        method: 'PATCH'
      }),
      invalidatesTags: ['notification']
    }),
    deleteNotification: builder.mutation({
      query: (id) => ({
        url: `/notifications/${id}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['notification']
    }),
    markAllAsRead: builder.mutation({
      query: () => ({
        url: '/notifications/mark-all-read',
        method: 'PATCH'
      }),
      invalidatesTags: ['notification']
    })
  })
});

export const {
  useGetNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkAsReadMutation,
  useDeleteNotificationMutation,
  useMarkAllAsReadMutation
} = notificationApi; 