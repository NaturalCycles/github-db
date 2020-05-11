export interface GithubPersistencePluginCfg {
  /**
   * @example `NaturalCycles/github-db`
   */
  repo: string

  /**
   * @default `gh-data`
   */
  branch: string

  /**
   * @default `data`
   */
  repoPath: string

  /**
   * @default false
   * If true - each Write operation will make a force-push commit, replacing the previous commit in the branch.
   */
  forcePush?: boolean

  /**
   * Github access token.
   * Write access is needed to write to DB.
   */
  token: string
}

export interface GithubShaResponse {
  sha: string
}

export interface GithubObjectResponse {
  object: {
    sha: string
  }
}

export interface GithubTreeResponse {
  tree: {
    sha: string
  }
}

export interface GithubContentResponse {
  /**
   * base64 string
   */
  content: string
}

export interface GithubItem {
  type: 'file' | 'dir'
  size: number
  name: string
  path: string
}

export interface GithubBranch {
  name: string
  protected?: boolean
}
