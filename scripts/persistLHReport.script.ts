/*

DEBUG=nc* yarn tsn persistLHReport.script

 */

import { FileDB } from '@naturalcycles/db-lib/dist/adapter/file'
import { CommonTimeSeriesDao } from '@naturalcycles/db-lib/dist/timeseries/commonTimeSeriesDao'
import { TimeSeriesSaveBatchOp } from '@naturalcycles/db-lib/dist/timeseries/timeSeries.model'
import { _filterNullishValues } from '@naturalcycles/js-lib'
import { requireEnvKeys } from '@naturalcycles/nodejs-lib'
import { runScript } from '@naturalcycles/nodejs-lib/dist/script'
import * as fs from 'fs-extra'
import { GithubPersistencePlugin } from '../src'
import { lhciDir, tmpDir } from '../src/test/paths.cnst'

const props = [
  'first-contentful-paint',
  'largest-contentful-paint',
  'speed-index',
  'estimated-input-latency',
  'total-blocking-time',
  'server-response-time',
  'first-cpu-idle',
  'interactive',
  'network-requests',
  'network-rtt',
  'network-server-latency',
  'total-byte-weight',
  'max-potential-fid',
  'cumulative-layout-shift',
]

const { GH_TOKEN } = requireEnvKeys('GH_TOKEN')

const db = new FileDB({
  plugin: new GithubPersistencePlugin({
    token: GH_TOKEN,
    repo: 'NaturalCycles/github-db',
    forcePush: false,
  }),
})

const tsDao = new CommonTimeSeriesDao({
  db,
})

runScript(async () => {
  const fname = fs.readdirSync(`${lhciDir}`).find(f => f.endsWith('.json'))
  if (!fname) {
    console.log(`No *.json files found in ${lhciDir}`)
    return
  }

  const unixMillis = parseInt(fname.split('lhr-')[1])
  // console.log(unixMillis)
  if (!unixMillis) {
    throw new Error(`Cannot parse unixMillis from filename: ${fname}`)
  }

  const r = fs.readJsonSync(`${lhciDir}/${fname}`)
  // console.log(r)

  const r2 = {}

  props.forEach(prop => {
    // console.log(prop)
    r2[prop] = r.audits[prop].numericValue
    r2[`${prop}-score`] = r.audits[prop].score
  })

  _filterNullishValues(r2, true)

  // File is just for debugging
  await fs.ensureDir(tmpDir)
  fs.writeJsonSync(`${tmpDir}/report.json`, r2, { spaces: 2 })

  ////

  const ops: TimeSeriesSaveBatchOp[] = Object.keys(r2).map(series => ({
    series,
    dataPoints: [[unixMillis, r2[series]]],
  }))

  await tsDao.commitTransaction(ops)
})
