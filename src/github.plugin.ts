import { DBSaveBatchOperation } from '@naturalcycles/db-lib'
import { FileDBPersistencePlugin } from '@naturalcycles/db-lib/dist/adapter/file'
import {
  _filterNullishValues,
  Fetcher,
  getFetcher,
  HttpRequestError,
  ObjectWithId,
} from '@naturalcycles/js-lib'
import { base64ToString } from '@naturalcycles/nodejs-lib'
import PQueue from 'p-queue'
import {
  GithubContentResponse,
  GithubItem,
  GithubObjectResponse,
  GithubPersistencePluginCfg,
  GithubShaResponse,
  GithubTreeResponse,
} from './github.plugin.model'

// const log = Debug('nc:github-db')

export class GithubPersistencePlugin implements FileDBPersistencePlugin {
  constructor(cfg: GithubPersistencePluginCfg) {
    this.setCfg(cfg)

    this.q = new PQueue({ concurrency: 1 })
  }

  setCfg(cfg: GithubPersistencePluginCfg): void {
    this.cfg = {
      token: undefined as any, // bypass ts check
      // token: 'token_must_be_set',
      // repo: 'repo_must_be_set',
      branch: 'gh-data',
      repoPath: 'data',
      forcePush: false,
      ...cfg,
    }

    this.fetcher = getFetcher({
      // logStart: true,
      // logFinished: true,
      baseUrl: `https://api.github.com`,
      headers: _filterNullishValues({
        // Accept: 'application/vnd.github.v3+json',
        // 'User-Agent': 'kirillgroshkov',
        // Set Authorization only if token is defined
        Authorization: cfg.token && `token ${cfg.token}`,
      }),
    })
  }

  cfg!: Required<GithubPersistencePluginCfg>

  fetcher!: Fetcher

  /**
   * This Queue ensures there's only 1 api request to github in-flight.
   * To avoid race-conditions and conflicts between commits.
   * Strictly needed for Write operations (Save, Update, Delete).
   * Currently NOT applied to Safe operations (Read).
   */
  q!: PQueue

  async loadFile<ROW extends ObjectWithId>(table: string): Promise<ROW[]> {
    // Queue for Read operations is disabled currently
    // return await this.q.add(async () => await this.loadFileTask<DBM>(table))
    const { repo, branch, repoPath } = this.cfg
    const { content } = await this.fetcher
      .get<GithubContentResponse>(`repos/${repo}/contents/${repoPath}/${table}.ndjson`, {
        searchParams: {
          ref: branch,
        },
      })
      .catch(err => {
        if (err instanceof HttpRequestError && err.data.responseStatusCode === 404)
          return {} as GithubContentResponse
        throw err
      })

    if (!content) return [] // in case of 404 or empty file

    return base64ToString(content)
      .split('\n')
      .filter(Boolean)
      .map(row => JSON.parse(row))
  }

  async saveFiles(ops: DBSaveBatchOperation[]): Promise<void> {
    await this.q.add(async () => await this.saveFilesTask(ops))
  }

  async saveFilesTask(ops: DBSaveBatchOperation[]): Promise<void> {
    const { repo, branch, repoPath, forcePush } = this.cfg

    // Get branch head sha
    const r00 = await this.fetcher.get<GithubObjectResponse>(
      `repos/${repo}/git/ref/heads/${branch}`,
    )
    const { sha: branchHeadSha } = r00.object
    // log({ branchHeadSha })

    let baseSha = branchHeadSha // default

    if (forcePush) {
      const [, secondCommit] = await this.fetcher.get<{ sha: string }[]>(`repos/${repo}/commits`, {
        searchParams: {
          sha: branchHeadSha,
          per_page: 2,
        },
      })
      if (secondCommit) {
        baseSha = secondCommit.sha
      }
    }

    // log({ baseSha })

    // Get branch top commit sha
    const r2 = await this.fetcher.get<GithubTreeResponse>(`repos/${repo}/git/commits/${baseSha}`)
    const { sha: treeSha } = r2.tree
    // log({ treeSha })

    // Create a tree object
    const tree = ops.map(op => {
      const content = op.rows.map(r => JSON.stringify(r)).join('\n') + '\n'
      return {
        path: `${repoPath}/${op.table}.ndjson`,
        mode: '100644',
        type: 'blob',
        content,
      }
    })

    const r4 = await this.fetcher.post<GithubShaResponse>(`repos/${repo}/git/trees`, {
      json: {
        base_tree: treeSha,
        tree,
      },
    })
    const { sha: newTreeSha } = r4
    // log({ newTreeSha })

    // Create a commit
    const message =
      `feat: save ${ops.length} table(s) [skip ci]\n\n` +
      ops.map(op => `${op.table} (${op.rows.length})`).join('\n')

    const r5 = await this.fetcher.post<GithubShaResponse>(`repos/${repo}/git/commits`, {
      json: {
        message,
        tree: newTreeSha,
        parents: [baseSha],
      },
    })
    const { sha: newCommitSha } = r5
    // log({ newCommitSha })

    // Move the head to the new commit
    const r6 = await this.fetcher.patch<GithubObjectResponse>(
      `repos/${repo}/git/refs/heads/${branch}`,
      {
        json: {
          sha: newCommitSha,
          force: forcePush,
        },
      },
    )
    // console.log(r6)
    const { sha: _newObjectSha } = r6.object
    // log({ newObjectSha }) // equals newCommitSha
  }

  async ping(): Promise<void> {
    await this.ensureBranch()
  }

  async getTables(): Promise<string[]> {
    const { repo, branch, repoPath } = this.cfg

    // Max 1000 files in a directory, should be ok
    const items = await this.fetcher
      .get<GithubItem[]>(`repos/${repo}/contents/${repoPath}`, {
        searchParams: {
          ref: branch,
        },
      })
      .catch(err => {
        if (err instanceof HttpRequestError && err.data.responseStatusCode === 404) return []
        throw err
      })

    return items
      .filter(f => f.type === 'file' && f.name.endsWith('.ndjson'))
      .map(f => f.name.split('.ndjson')[0]!)
  }

  private async ensureBranch(): Promise<void> {
    const { repo, branch } = this.cfg
    await this.fetcher.get(`repos/${repo}/branches/${branch}`).catch(async err => {
      // log(`ensureBranch(${branch}) err`, err.message)
      // if ((err as HTTPError)?.response?.statusCode !== 404) throw err

      throw err
    })
  }
}
