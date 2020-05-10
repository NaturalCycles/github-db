import { requireEnvKeys } from '@naturalcycles/nodejs-lib'
import { GithubDB } from '../github.db'

const { GITHUB_TOKEN } = requireEnvKeys('GITHUB_TOKEN')

const db = new GithubDB({
  token: GITHUB_TOKEN,
  repo: 'NaturalCycles/github-db',
})

test('manual1', async () => {
  await db.ping()
})
