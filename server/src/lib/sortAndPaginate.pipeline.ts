const sortAndPaginatePipeline = (query: Record<string, unknown>) => {
  let page = 1;
  let limit = 10;
  const sortBy = 'createdAt';
  let sortOrder: -1 | 1 = -1;

  if (query.limit) {
    limit = Number(query.limit);
  }

  if (query.page) {
    page = Number(query.page);
  }

  if (query.sortOrder) {
    sortOrder = query.sortOrder === 'desc' ? -1 : 1;
  }

  const skip = (page - 1) * limit;

  return [
    {
      $sort: {
        [sortBy]: sortOrder
      }
    },
    {
      $skip: skip
    },
    {
      $limit: limit
    }
  ];
};

export default sortAndPaginatePipeline;
