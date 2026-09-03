module.exports = {
  testEnvironment: "node",

  transform: {
    "^.+\\.tsx?$": [
      "@swc/jest",
      {
        jsc: {
          target: "es2022"
        },
        module: {
          type: "commonjs"
        }
      }
    ]
  },

  testMatch: [
    "**/tests/**/*.test.ts"
  ],

  moduleFileExtensions: ["ts", "js"],

  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1"
  }
};
module.exports = {
  testEnvironment: "node",

  transform: {
    "^.+\\.tsx?$": [
      "@swc/jest",
      {
        jsc: {
          target: "es2022"
        },
        module: {
          type: "commonjs"
        }
      }
    ]
  },

  testMatch: [
    "**/tests/**/*.test.ts"
  ],

  moduleFileExtensions: ["ts", "js"],

  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1"
  },

  setupFilesAfterEnv: [
    "<rootDir>/tests/setup.ts"
  ]
};