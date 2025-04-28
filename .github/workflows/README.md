# GitHub Workflows

This directory contains GitHub Actions workflows for automating tasks in the astro-shadcn-registry project.

## Publish to npm Workflow

The `publish.yml` workflow automatically publishes the package to npm when a new GitHub release is created.

### How it works

1. When you create a new release in GitHub (e.g., `v1.0.0`), this workflow is triggered
2. It extracts the version number from the release tag
3. Updates the version in `package.json` to match the release tag
4. Installs dependencies and runs tests
5. Builds the package
6. Publishes the package to npm
7. Commits the version change back to the repository

### Prerequisites

Before using this workflow, you need to:

1. **Add an NPM_TOKEN secret to your repository**:
   - Go to your npm account and generate an access token with publish permissions
   - In your GitHub repository, go to Settings > Secrets and variables > Actions
   - Add a new repository secret named `NPM_TOKEN` with the value of your npm token

### Usage

To use this workflow:

1. Create a new release in GitHub:
   - Go to your repository on GitHub
   - Click on "Releases" in the right sidebar
   - Click "Create a new release"
   - Enter a tag version (e.g., `v1.0.0`, `v1.1.0`, etc.)
   - Add a title and description for your release
   - Click "Publish release"

2. The workflow will automatically:
   - Update the version in package.json
   - Publish the package to npm
   - Commit the version change back to your repository

### Notes

- Make sure your release tags follow semantic versioning (e.g., `v1.0.0`, `v1.1.0`, etc.)
- The workflow will fail if the tests don't pass, so make sure all tests are passing before creating a release
- If you need to make changes to the workflow, edit the `.github/workflows/publish.yml` file
