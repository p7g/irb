function error(code) {
  return {
    status: 'error',
    code,
  };
}

function success(data) {
  return {
    status: 'success',
    data,
  };
}

module.exports = {
  error,
  success,
};
