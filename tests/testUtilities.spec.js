export const isFunction = (obj) => {
  return !!(obj && obj.constructor && obj.call && obj.apply);
}
