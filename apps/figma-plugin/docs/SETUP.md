# Set up Token Bridge

Token Bridge moves design tokens between Figma variables and JSON files in a GitHub repository. This page gets one Figma file connected to one repository. For daily use see [Sync](SYNC.md); for the file layouts see [Formats](FORMATS.md).

## Before you start

- The Figma **desktop app** (importing a plugin from a manifest needs it).
- A GitHub repository that holds your token files, or an empty folder to start one. It can be private.
- A GitHub account with write access to that repository.

## Install the plugin

Token Bridge is not in the Figma Community yet, so you run it as a development plugin:

1. Open the Figma desktop app.
2. Choose **Plugins**, **Development**, **Import plugin from manifest**.
3. Pick the `manifest.json` you were given (it sits next to a `dist/` folder; keep them together).
4. Run it from **Plugins**, **Development**, **Token Bridge**.

## Create a GitHub token

Token Bridge talks to GitHub directly with a personal access token. There is no server in between.

Create a **fine-grained** token, so it can reach only the repository you use:

1. Under "Repository access" choose **Only select repositories** and pick your token repository.
2. Under "Repository permissions" set **Contents** to **Read and write**.
3. Create it and copy it. GitHub shows it once.

The setup screen links to a pre-filled form. Check the two settings above before you create it.

A classic token with the `repo` scope also works, but it can reach every repository you can, so prefer the fine-grained one. You can revoke either from GitHub settings at any time.

If a Pull or Push says GitHub rejected your token, it expired or was revoked: create a new one and enter it again.

## Connect a repository

Open the **Sync** tab. The setup has three steps:

1. **Access token.** Paste the token.
2. **Repository.** Enter the owner, the repository and the branch. Pasting `owner/repo`, the repository's web address or a clone address into the Repository box fills the owner for you. The plugin checks it and says why if it can't read it.
3. **Configuration.** The token folder and the sync mode (below). The last step says what it found, for example "Found `tokens.resolver.json` and 7 token files in `tokens/`".

Save, and the Sync tab shows the repository and checks its status.

### Find the token folder

Step 3 looks inside the repository and fills in the token folder for you. It picks, in order:

1. the folder that holds a `tokens.resolver.json` (the shallowest if there are several);
2. the first of `packages/tokens/io/sync`, `tokens`, `design-tokens`, `src/tokens`, `packages/tokens`, `design/tokens` that has JSON files directly in it;
3. otherwise `tokens/`.

What you type is never overwritten. A folder you saved earlier is kept when the repository has files under it. If the plugin says the folder wasn't found, open **Edit setup** and correct the path: it is the folder inside the repository, for example `tokens` or `packages/tokens/io/sync`, not a file name.

### Sync mode

- **Direct:** a Push commits the changed token files straight to the branch.
- **Pull request:** a Push goes to a new branch and opens a pull request; the branch stays untouched until you merge it.

You can change this later with **Edit setup**.

### Wylie Dog conventions

Step 3 has a checkbox, "Use Wylie Dog conventions". Leave it unticked unless your repository follows the [Wylie Dog design system](https://github.com/travhall/wylie-dog-ds) layout. It is ticked by default only for the folder `packages/tokens/io/sync`. What it changes is in [Formats](FORMATS.md#optional-wylie-dog-conventions).

## Working in a team

Your token is stored for your Figma account, not in the file, so a colleague who opens the same file connects with their own token and sees "Add your GitHub token" with the repository already filled in.

- **Disconnect** clears this file's repository settings and keeps your token, so your other files stay connected.
- **Forget token** deletes your stored token for every file, after a confirmation. Files keep their repository settings and ask for a token again.

## If something fails

A failed check names what happened and offers one fix: **Enter a new token** or **Edit setup**. The full list is in [Sync, when something goes wrong](SYNC.md#when-something-goes-wrong).
