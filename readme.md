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
