// frontend/jest.config.js
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Ruta a tu aplicación Next.js (donde está el package.json)
  dir: './',
})

/** @type {import('jest').Config} */
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1', // si usas alias de importación
  },
}

module.exports = createJestConfig(customJestConfig)