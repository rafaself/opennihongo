# Repository settings

These settings complement the files committed to the repository and should be
configured in GitHub.

## Pull requests

Recommended settings:

- allow squash merging;
- use the pull request title as the squash commit title;
- disable merge commits;
- disable rebase merging;
- automatically delete head branches after merge.

## `main` protection

Recommended ruleset or branch protection settings:

- require a pull request before merging;
- require the `Conventional PR title` status check;
- block force pushes;
- block branch deletion;
- require conversations to be resolved before merging.

A mandatory approving review is intentionally not required while the project
has a single primary maintainer. This can be enabled when the contributor model
grows.
