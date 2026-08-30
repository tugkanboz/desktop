import { describe, it } from 'node:test'
import assert from 'node:assert'
import { groupBranches } from '../../src/ui/branches'
import { Branch, BranchType } from '../../src/models/branch'
import { CommitIdentity } from '../../src/models/commit-identity'

describe('Branches grouping', () => {
  const author = new CommitIdentity('Hubot', 'hubot@github.com', new Date())

  const branchTip = {
    sha: '300acef',
    author,
  }

  const currentBranch = new Branch(
    'master',
    null,
    branchTip,
    BranchType.Local,
    ''
  )
  const defaultBranch = new Branch(
    'master',
    null,
    branchTip,
    BranchType.Local,
    ''
  )
  const recentBranches = [
    new Branch('some-recent-branch', null, branchTip, BranchType.Local, ''),
  ]
  const olderBranch = new Branch(
    'older-branch',
    null,
    { sha: 'older-branch', author },
    BranchType.Local,
    ''
  )
  const newerBranch = new Branch(
    'newer-branch',
    null,
    { sha: 'newer-branch', author },
    BranchType.Local,
    ''
  )

  const allBranches = [
    currentBranch,
    ...recentBranches,
    newerBranch,
    olderBranch,
  ]

  it('should group branches', () => {
    const commitAuthorDates = new Map<string, Date>([
      ['older-branch', new Date('2025-01-01T00:00:00Z')],
      ['newer-branch', new Date('2026-01-01T00:00:00Z')],
    ])
    const groups = groupBranches(
      defaultBranch,
      currentBranch,
      allBranches,
      recentBranches,
      commitAuthorDates
    )
    assert.equal(groups.length, 3)

    assert.equal(groups[0].identifier, 'default')
    let items = groups[0].items
    assert.equal(items[0].branch, defaultBranch)

    assert.equal(groups[1].identifier, 'recent')
    items = groups[1].items
    assert.equal(items[0].branch, recentBranches[0])

    assert.equal(groups[2].identifier, 'other')
    items = groups[2].items
    assert.equal(items[0].branch, newerBranch)
    assert.equal(items[1].branch, olderBranch)
  })
})
