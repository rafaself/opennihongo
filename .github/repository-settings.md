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
- block force pushes;
- block branch deletion;
- require conversations to be resolved before merging.

The Pages deployment workflow runs after pushes to `main`, not on pull
requests. Do not require it as a pull request status check. Pull requests
require the local validation described in `CONTRIBUTING.md`.

A mandatory approving review is intentionally not required while the project
has a single primary maintainer. This can be enabled when the contributor model
grows.

## GitHub Pages

- keep the repository public for free Pages hosting;
- enable GitHub Actions and select **GitHub Actions** as the Pages source;
- deploy through `.github/workflows/pages.yml` after pushes to `main`;
- publish the web app's `apps/web/dist` artifact at
  <https://rafaself.github.io/opennihongo/>;
- restrict the `github-pages` deployment environment to the `main` branch.
