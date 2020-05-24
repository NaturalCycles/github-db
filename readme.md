## @naturalcycles/github-db

> GitHub branch as a Database

[![npm](https://img.shields.io/npm/v/@naturalcycles/github-db/latest.svg)](https://www.npmjs.com/package/@naturalcycles/github-db)
[![min.gz size](https://badgen.net/bundlephobia/minzip/@naturalcycles/github-db)](https://bundlephobia.com/result?p=@naturalcycles/github-db)
[![](https://circleci.com/gh/NaturalCycles/github-db.svg?style=shield&circle-token=123)](https://circleci.com/gh/NaturalCycles/github-db)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

# Intro

Store your data for free in GitHub repo branch. Similar to `gh-pages`, but for data.

Implements [CommonDB](https://github.com/NaturalCycles/db-lib) interface.

Store as `*.ndjson` (newline-delimited json), or `*.ndjson.gz` (gzipped), or `*.sqlite` (binary).

Push to preserve git commit history or force-push to reset history and only store the recent state.

# Example

```typescript
const db = new FileDB({
  plugin: new GithubPersistencePlugin({
    token: 'YOUR_GITHUB_TOKEN',
    repo: 'NaturalCycles/github-db',
  }),
})

const items = [
  { id: 'id1', a: 'a1' },
  { id: 'id2', a: 'a2' },
]

await db.saveBatch('TEST_TABLE', items)
```

It will create, commit and push `data/TEST_TABLE.ndjson` file to the repo/branch that you've
specified (branch defaults to `gh-data`, similarly to `gh-pages`).

Next saves will be either new commits, or force-push of new commit over previous (with
`forcePush: true` option).

Currently, it needs some preparation steps to work (create empty branch), described further down.

# Prepare an empty branch to store your data

Replace `git@github.com:NaturalCycles/github-db.git` with your repo.

Replace `gh-data` with the desired branch name (but `gh-data` is the default).

```
mkdir data && cd data
git clone git@github.com:NaturalCycles/github-db.git ./
git checkout --orphan gh-data
git reset --hard
git commit --allow-empty -m "chore: init empty data branch"
git push --set-upstream origin gh-data
```

# TODO

- [ ] .ndjson.gzip option
- [ ] .sqlite option
- [ ] command to vacuum/force-push all commits in gh-data into one
