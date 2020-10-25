import { FileDB } from '@naturalcycles/db-lib/dist/adapter/file'
import { runCommonDBTest } from '@naturalcycles/db-lib/dist/testing'
import { requireEnvKeys } from '@naturalcycles/nodejs-lib'
import { GithubPersistencePlugin } from '../github.plugin'

const { GH_TOKEN } = requireEnvKeys('GH_TOKEN')

const db = new FileDB({
  plugin: new GithubPersistencePlugin({
    token: GH_TOKEN,
    repo: 'NaturalCycles/github-db',
    forcePush: true,
  } as any),
})

test('manual1', async () => {
  // await db.ping()

  // const dbms = createTestItemsDBM(12)

  // await db.saveBatch(TEST_TABLE, dbms)

  // const tx = new DBTransaction().saveBatch(TEST_TABLE, dbms).saveBatch(TEST_TABLE + '2', dbms)
  //
  // await db.commitTransaction(tx)

  // const r = await db.getByIds(TEST_TABLE, ['id1', 'id3'])
  const r = await db.getTables()
  // const r = await (db.cfg.plugin as any).getCommits()
  console.log(r)
})

describe('runCommonDBTest', () =>
  runCommonDBTest(db, {
    bufferSupport: false,
  }))

// describe('runCommonDaoTest', () => runCommonDaoTest(db))
