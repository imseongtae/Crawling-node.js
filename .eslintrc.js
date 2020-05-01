module.exports = {
  root: true,
  env: {
    node: true,
    browser:true,
  },
  parser: "babel-eslint",
  // plugins: [],
  extends: [
    "eslint:recommended",
    "plugin:prettier/recommended"
  ],
  rules: {
    "no-console": "off",
  },

  "ignorePatterns": ["temp.js", "node_modules/"],
  
}