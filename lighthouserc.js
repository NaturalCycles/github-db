// https://github.com/GoogleChrome/lighthouse-ci/blob/master/docs/configuration.md
module.exports = {
  ci: {
    collect: {
      url: 'https://www.naturalcycles.com',
      // staticDistDir: './dist',
      // url: ['http://localhost/'],
      numberOfRuns: 1,
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
}
