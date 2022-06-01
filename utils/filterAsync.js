function mapAsync(array, callbackfn) {
  return Promise.all(array.map(callbackfn));
}

module.exports = async function filterAsync(array, callbackfn) {
  const filterMap = await mapAsync(array, callbackfn);
  return array.filter((value, index) => filterMap[index]);
}