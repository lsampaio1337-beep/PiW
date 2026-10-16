global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve([]),
  })
);
// Mock document.getElementById to return a dummy object that can have .onclick set
const originalGetElementById = document.getElementById.bind(document);
document.getElementById = (id) => {
    return originalGetElementById(id) || { onclick: null, style: {} };
};
