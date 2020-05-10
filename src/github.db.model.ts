export interface GithubDBCfg {
  /**
   * @example `NaturalCycles/github-db`
   */
  repo: string

  /**
   * @default `gh-data`
   */
  branch: string

  /**
   * Github access token.
   * Write access is needed to write to DB.
   */
  token: string
}

export interface GithubBranch {
  name: string
  protected?: boolean
}
