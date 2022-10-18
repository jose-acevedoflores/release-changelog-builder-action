import {buildChangelog} from '../src/transform'
import {PullRequestInfo} from '../src/pullRequests'
import moment from 'moment'
import {Configuration, DefaultConfiguration} from '../src/configuration'
import {DefaultDiffInfo} from '../src/commits'

jest.setTimeout(180000)

const configuration = Object.assign({}, DefaultConfiguration)
configuration.categories = [
  {
    title: '## 🚀 Features',
    labels: ['[Feature]']
  },
  {
    title: '## 🐛 Fixes',
    labels: ['[Bug]', '[Issue]']
  },
  {
    title: '## 🧪 Tests',
    labels: ['[Test]']
  },
  {
    title: '## 🧪 Others',
    labels: ['[Other]']
  }
]

// list of PRs without labels assigned (extract from title)
const mergedPullRequests: PullRequestInfo[] = []
mergedPullRequests.push(
  {
    number: 1,
    title: 'this is a PR 1 title message',
    htmlURL: 'hyuehehe',
    baseBranch: '',
    branch: 'name/ham-262-kolo',
    createdAt: moment(),
    mergedAt: moment(),
    mergeCommitSha: 'sha1',
    author: 'Mike',
    repoName: 'test-repo',
    labels: new Set<string>(),
    milestone: '',
    body: 'no magic body1 for this matter',
    assignees: [],
    requestedReviewers: [],
    approvedReviewers: [],
    status: 'merged'
  },
  {
    number: 2,
    title: 'this is a PR 2 title message',
    htmlURL: '',
    baseBranch: '',
    branch: 'name/ham-3331-kolo',
    createdAt: moment(),
    mergedAt: moment(),
    mergeCommitSha: 'sha1',
    author: 'Mike',
    repoName: 'test-repo',
    labels: new Set<string>(),
    milestone: '',
    body: 'no magic body2 for this matter',
    assignees: [],
    requestedReviewers: [],
    approvedReviewers: [],
    status: 'merged'
  },
  {
    number: 3,
    title: 'this is a PR 3 title message',
    htmlURL: '',
    baseBranch: '',
    branch: 'name/ham-3332-ham-672-kolo',
    createdAt: moment(),
    mergedAt: moment(),
    mergeCommitSha: 'sha1',
    author: 'Mike',
    repoName: 'test-repo',
    labels: new Set<string>(),
    milestone: '',
    body: 'no magic body3 for this matter',
    assignees: [],
    requestedReviewers: [],
    approvedReviewers: [],
    status: 'merged'
  },
  {
    number: 4,
    title: 'not found label',
    htmlURL: '',
    baseBranch: '',
    branch: 'name/ham-782-sadsa',
    createdAt: moment(),
    mergedAt: moment(),
    mergeCommitSha: 'sha1',
    author: 'Mike',
    repoName: 'test-repo',
    labels: new Set<string>(),
    milestone: '',
    body: 'no magic body4 for this matter',
    assignees: [],
    requestedReviewers: [],
    approvedReviewers: [],
    status: 'merged'
  }
)

const pullRequestWithLabelInBody: PullRequestInfo = {
  number: 5,
  title: 'label in body',
  htmlURL: '',
  baseBranch: '',
  branch: 'name/ham-1823-asd',
  createdAt: moment(),
  mergedAt: moment(),
  mergeCommitSha: 'sha1',
  author: 'Mike',
  repoName: 'test-repo',
  labels: new Set<string>(),
  milestone: '',
  body: '[Issue][Feature][AB-1234321] - no magic body for this matter',
  assignees: [],
  requestedReviewers: [],
  approvedReviewers: [],
  status: 'merged'
}

it('Extract custom placeholder from PR body and replace in global template', async () => {
  const customConfig = Object.assign({}, configuration)
  customConfig.custom_placeholders = [
    {
      name: 'TICKET',
      source: 'BRANCH',
      cb: "const regex = /ham-[0-9]+/g;\n const tickets = source.match(regex);\nconst tickets_u = tickets.map(t => t.toUpperCase())\nreturn '[' + tickets_u.join('][') + '] '"
    }
  ]
  customConfig.template =
    '${{CHANGELOG}}\n\n<details>\n<summary>Uncategorized</summary>\n\n${{UNCATEGORIZED}}\n</details>'
  customConfig.pr_template = '- [#${{NUMBER}}](${{URL}})${{TICKET}}- ${{TITLE}}'

  const resultChangelog = buildChangelog(DefaultDiffInfo, mergedPullRequests, {
    owner: 'mikepenz',
    repo: 'test-repo',
    fromTag: {name: '1.0.0'},
    toTag: {name: '2.0.0'},
    includeOpen: false,
    failOnError: false,
    fetchReviewers: false,
    fetchReleaseInformation: false,
    commitMode: false,
    configuration: customConfig
  })

  const res = `

<details>
<summary>Uncategorized</summary>

- [#1](hyuehehe)[HAM-262] - this is a PR 1 title message
- [#2]()[HAM-3331] - this is a PR 2 title message
- [#3]()[HAM-3332][HAM-672] - this is a PR 3 title message
- [#4]()[HAM-782] - not found label

</details>`

  expect(resultChangelog).toStrictEqual(res)
})
