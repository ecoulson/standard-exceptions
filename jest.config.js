module.exports = {
    transform: {
        '^.+\\.(t|j)sx?$': ['@swc/jest'],
    },
    coveragePathIgnorePatterns: ['/node_modules/', '/lib/'],
    testPathIgnorePatterns: ['/node_modules/', '/lib/'],
};
