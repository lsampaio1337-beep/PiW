module.exports = {
  setupFiles: ["<rootDir>/jest.setup.js"],
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.[t|j]sx?$': 'babel-jest',
  },
};
