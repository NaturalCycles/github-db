// DEBUG=nc* yarn tsn tick

import { FileDB } from '@naturalcycles/db-lib/dist/adapter/file'
import { CommonTimeSeriesDao } from '@naturalcycles/db-lib/dist/time/commonTimeSeriesDao'
import { _filterUndefinedValues, pMap, StringMap } from '@naturalcycles/js-lib'
import { requireEnvKeys } from '@naturalcycles/nodejs-lib'
import { runScript } from '@naturalcycles/nodejs-lib/dist/script'
import { dayjs } from '@naturalcycles/time-lib'
import * as fs from 'fs-extra'
import { GithubPersistencePlugin } from '../src'
import { tmpDir } from '../src/test/paths.cnst'

interface LighthouseRecord extends StringMap<any> {}

const props = [
  'first-contentful-paint',
  'first-meaningful-paint',
  'speed-index',
  'estimated-input-latency',
  'total-blocking-time',
  'time-to-first-byte',
  'first-cpu-idle',
  'interactive',
  'network-requests',
  'network-rtt',
  'total-byte-weight',
]

const { GITHUB_TOKEN } = requireEnvKeys('GITHUB_TOKEN')

const db = new FileDB({
  plugin: new GithubPersistencePlugin({
    token: GITHUB_TOKEN,
    repo: 'NaturalCycles/github-db',
    forcePush: false,
  }),
  sortObjects: true,
})

const tsDao = new CommonTimeSeriesDao({
  db,
})

runScript(async () => {
  const r = fs.readJsonSync(`${tmpDir}/site.report.json`)
  // console.log(r)

  const now = dayjs().unixMillis()

  const r2 = {}

  props.forEach(prop => {
    r2[prop] = r.audits[prop].numericValue
    r2[`${prop}-score`] = r.audits[prop].score
  })

  _filterUndefinedValues(r2, true)

  fs.writeJsonSync(`${tmpDir}/report.json`, r2, {spaces: 2})

  ////

  await pMap(Object.keys(r2), async series => {
    await tsDao.save(series, now, r2[series])
  }, {concurrency: 1})
})
