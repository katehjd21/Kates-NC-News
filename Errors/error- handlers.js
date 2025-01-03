//not found errors
exports.notFoundErrorHandler = (req, res) => {
  res.status(404).send({ msg: "404: Not found" });
};

//postgres errors
exports.psqlErrorHandler = (err, req, res, next) => {
  if (err.code === "22P02" || err.code === "23502" || err.code === "23503") {
    res.status(400).send({ msg: "400: Bad request" });
  } else {
    next(err);
  }
};

//custom errors
exports.customErrorHandler = (err, req, res, next) => {
  if (err.status && err.msg) {
    res.status(err.status).send({ msg: err.msg });
  } else {
    next(err);
  }
};

//server errors
exports.serverErrorHandler = (err, req, res, next) => {
  console.log(err);
  res.status(500).send({ msg: "Internal server error" });
};
