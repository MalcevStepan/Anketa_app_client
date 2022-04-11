export const createTree2 = (arr) => {
  arr.forEach((el) => {
    arr.forEach((el2) => {
      if (el.id === el2.parentId) {
        el.children = el.children ? [...el.children, el2] : [el2];
      }
    });
  });
  return arr;
};

export const createMassivFunc = (arr) => {
  let obj = {};
  if (arr && arr.length) {
    arr.forEach((el) => {
      obj.hasOwnProperty(el.itemId)
        ? obj[el.itemId].push({ val: el.value, id: el.id })
        : (obj[el.itemId] = [{ val: el.value, id: el.id }]);
    });
  }
  return obj;
};