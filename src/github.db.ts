import {
  CommonDB,
  CommonDBCreateOptions,
  CommonDBOptions,
  CommonDBSaveOptions,
  CommonDBStreamOptions,
  CommonSchema,
  DBQuery,
  RunQueryResult,
  SavedDBEntity,
} from '@naturalcycles/db-lib'
import { _LogMethod } from '@naturalcycles/js-lib'
import { Debug, getGot, ReadableTyped } from '@naturalcycles/nodejs-lib'
import { HTTPError } from 'got'
import type { Got } from 'got'
import { GithubDBCfg } from './github.db.model'

const log = Debug('nc:github-db')

export class GithubDB implements CommonDB {
  constructor(cfg: Partial<GithubDBCfg>) {
    this.cfg = {
      token: 'token_must_be_set',
      repo: 'repo_must_be_set',
      branch: 'gh-data',
      ...cfg,
    }

    this.got = getGot({
      logStart: true,
      logFinished: true,
    }).extend({
      prefixUrl: `https://api.github.com`,
      headers: {
        // Accept: 'application/vnd.github.v3+json',
        // 'User-Agent': 'kirillgroshkov',
        Authorization: `token ${this.cfg.token}`,
      },
    })
  }

  public cfg!: GithubDBCfg

  public got!: Got

  async ping(): Promise<void> {
    await this.ensureBranch()
  }

  @_LogMethod()
  async ensureBranch(): Promise<void> {
    await this.got(`repos/${this.cfg.repo}/branches/${this.cfg.branch}`)
      .json()
      .catch(async err => {
        // log(`ensureBranch(${branch}) err`, err.message)
        if ((err as HTTPError)?.response?.statusCode !== 404) throw err

        await this.createBranch()
      })
  }

  async createBranch(): Promise<void> {
    const { repo, branch } = this.cfg
    log(`creating orphan branch "${repo}/${branch}"...`)

    // Step 1: get master branch head sha
    // const r = await githubGot(`repos/${project}/git/ref/heads/${baseBranch}`).json<
    //   GithubObjectResponse
    //   >()
    //
    // const { sha } = r.object
    // console.log(sha)
    const sha = '4b825dc642cb6eb9a060e54bf8d69288fbee4904'

    // Step 2: create new ref (branch) from master's branch sha
    await this.got
      .post(`repos/${repo}/git/refs`, {
        json: {
          ref: `refs/heads/${branch}`,
          sha,
        },
      })
      .json()
  }

  async createTable(schema: CommonSchema, opt?: CommonDBCreateOptions): Promise<void> {}

  async deleteByIds(table: string, ids: string[], opt?: CommonDBOptions): Promise<number> {
    return 0
  }

  async deleteByQuery(q: DBQuery, opt?: CommonDBOptions): Promise<number> {
    return 0
  }

  async getByIds<DBM extends SavedDBEntity>(
    table: string,
    ids: string[],
    opt?: CommonDBOptions,
  ): Promise<DBM[]> {
    return []
  }

  async getTableSchema<DBM extends SavedDBEntity>(table: string): Promise<CommonSchema<DBM>> {
    return {
      table,
      fields: [],
    }
  }

  async getTables(): Promise<string[]> {
    return []
  }

  async resetCache(table?: string): Promise<void> {}

  async runQuery<DBM extends SavedDBEntity, OUT = DBM>(
    q: DBQuery<any, DBM>,
    opt?: CommonDBOptions,
  ): Promise<RunQueryResult<OUT>> {
    return {
      records: [],
    }
  }

  async runQueryCount(q: DBQuery, opt?: CommonDBOptions): Promise<number> {
    return 0
  }

  async saveBatch<DBM extends SavedDBEntity>(
    table: string,
    dbms: DBM[],
    opt?: CommonDBSaveOptions,
  ): Promise<void> {}

  streamQuery<DBM extends SavedDBEntity, OUT = DBM>(
    q: DBQuery<any, DBM>,
    opt?: CommonDBStreamOptions,
  ): ReadableTyped<OUT> {
    return undefined as any
  }
}
