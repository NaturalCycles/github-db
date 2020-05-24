import { FileDB } from '@naturalcycles/db-lib/dist/adapter/file'
import { createTestItemsDBM, runCommonDBTest, TEST_TABLE } from '@naturalcycles/db-lib/dist/testing'
import { requireEnvKeys } from '@naturalcycles/nodejs-lib'
import { GithubPersistencePlugin } from '../github.plugin'

const { GITHUB_TOKEN } = requireEnvKeys('GITHUB_TOKEN')

const db = new FileDB({
  plugin: new GithubPersistencePlugin({
    token: GITHUB_TOKEN,
    repo: 'NaturalCycles/github-db',
    forcePush: true,
  }),
  sortObjects: true,
})

test('manual1', async () => {
  // await db.ping()

  const dbms = createTestItemsDBM(12)

  // await db.saveBatch(TEST_TABLE, dbms)

  await db
    .transaction()
    .saveBatch(TEST_TABLE, dbms)
    .saveBatch(TEST_TABLE + '2', dbms)
    .commit()

  // const r = await db.getByIds(TEST_TABLE, ['id1', 'id3'])
  // const r = await db.getTables()
  // const r = await (db.cfg.plugin as any).getCommits()
  // console.log(r.length)
})

describe('runCommonDBTest', () => runCommonDBTest(db))

// describe('runCommonDaoTest', () => runCommonDaoTest(db))
