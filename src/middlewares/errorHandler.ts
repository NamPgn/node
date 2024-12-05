const errorHandler = (err, req, res, next) => {
  return res.status(err.status || 500).json({
    success: false,
    message: err.message || "Server Error",
  });
};

export default errorHandler;
