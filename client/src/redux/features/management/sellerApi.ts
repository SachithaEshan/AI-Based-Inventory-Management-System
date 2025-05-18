import { baseApi } from "../baseApi";
import { ISeller } from "../../../types/product.types";

const sellerApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllSeller: builder.query({
      query: (query) => ({
        url: '/sellers',
        method: 'GET',
        params: query
      }),
      providesTags: ['seller']
    }),
    createSeller: builder.mutation({
      query: (payload) => ({
        url: '/sellers',
        method: 'POST',
        body: payload
      }),
      invalidatesTags: ['seller']
    }),
    updateSeller: builder.mutation({
      query: ({ id, payload }) => ({
        url: `/sellers/${id}`,
        method: 'PATCH',
        body: payload
      }),
      invalidatesTags: ['seller'],
      async onQueryStarted({ id, payload }, { dispatch, queryFulfilled }) {
        try {
          console.log('Starting update with payload:', payload);
          const { data: response } = await queryFulfilled;
          console.log('Server response:', response);

          // Update the cache with the new data
          dispatch(
            sellerApi.util.updateQueryData('getAllSeller', undefined, (draft) => {
              console.log('Current cache data:', draft);
              if (draft?.data) {
                const index = draft.data.findIndex((seller: ISeller) => seller._id === id);
                console.log('Found seller at index:', index);
                if (index !== -1) {
                  const updatedSeller = { ...draft.data[index], ...payload };
                  console.log('Updated seller data:', updatedSeller);
                  draft.data[index] = updatedSeller;
                }
              }
            })
          );
        } catch (error) {
          console.error('Update failed:', error);
        }
      }
    }),
    deleteSeller: builder.mutation({
      query: (id) => ({
        url: '/sellers/' + id,
        method: 'DELETE'
      }),
      invalidatesTags: ['seller']
    }),
  })
})

export const { 
  useGetAllSellerQuery, 
  useCreateSellerMutation, 
  useDeleteSellerMutation,
  useUpdateSellerMutation 
} = sellerApi