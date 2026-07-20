const sendSuccess = (res, data, message = 'Success', statusCode = 200) => {
  res.status(statusCode).json({
    status: 'success',
    message,
    data
  });
};

const sendError = (res, message = 'Error', statusCode = 500, errors = null) => {
  res.status(statusCode).json({
    status: 'error',
    message,
    ...(errors && { errors })
  });
};

const sendPaginated = (res, data, pagination, message = 'Success', statusCode = 200) => {
  res.status(statusCode).json({
    status: 'success',
    message,
    data,
    pagination
  });
};

module.exports = {
  sendSuccess,
  sendError,
  sendPaginated
};
