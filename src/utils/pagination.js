const getPagination = (pageValue, limitValue) => {
  const page = Math.max(Number.parseInt(pageValue, 10) || 1, 1);
  const limit = Math.min(Math.max(Number.parseInt(limitValue, 10) || 20, 1), 100);

  return { page, limit, offset: (page - 1) * limit };
};

const getPaginationMeta = (count, page, limit) => ({
  page,
  limit,
  totalItems: count,
  totalPages: Math.ceil(count / limit),
});

module.exports = { getPagination, getPaginationMeta };
