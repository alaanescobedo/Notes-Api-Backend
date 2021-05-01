module.exports = (req, _, next) => {
  console.log(req.method);
  console.log(req.path);
  console.log(req.body);
  next();
};
