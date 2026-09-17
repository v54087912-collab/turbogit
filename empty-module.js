const noop = () => {};

module.exports = {
  TextDecoder: typeof TextDecoder !== "undefined" ? TextDecoder : undefined,
  TextEncoder: typeof TextEncoder !== "undefined" ? TextEncoder : undefined,
  promisify: (fn) => fn,
  inherits: noop,
  format: noop,
  default: {},
};
