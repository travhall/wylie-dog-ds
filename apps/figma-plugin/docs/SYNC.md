# Sync with GitHub

How to send Figma variables to a repository and bring repository changes back. Connect a file first: [Setup](SETUP.md).

## Push and Pull

- **Push** sends the ticked collections from Figma to GitHub.
- **Pull** brings everything in the repository into Figma.

Both show what will change before anything is written. **Review changes** shows the same list at any time without doing anything.

The Sync tab ticks the collections that changed in Figma since the last sync and tags them "changed in Figma". Your own ticking is never replaced. With nothing ticked, Push says why.

## Review before anything is written

Pressing Push or Pull opens a review. Nothing is sent or imported until you confirm it. When nothing would change, it says so and offers only **Close**.

A row shows the token, what happens (changed, added, removed, renamed), the old and new value, and a colour swatch for colours. A filter appears above 8 rows.

**On a Push**, the review lists what GitHub will gain, change or lose. In pull request mode it says a pull request will open and the button reads "Open pull request".

**On a Pull**, the review lists what Figma will gain, change, lose or have overwritten:

- A Pull deletes variables that exist only in Figma, so they are listed under "Will be removed from Figma" and **Pull stays disabled until you tick the acknowledgement**.
- Edits you made in Figma since the last sync are marked "Overwrites your Figma edit". **Push first** sends them to GitHub before you Pull.
- **Choose per token** opens a list where each difference can keep the Figma value, take the GitHub value, or be set by hand.

### Back up before a Pull

A Pull replaces the variables in every collection it imports, and Figma has no undo. The Pull review therefore offers **Download a backup of Figma's variables first**, ticked by default. Confirming saves a zip named `figma-backup-YYYY-MM-DD-HHMM.zip` to your downloads, then pulls.

- The zip holds one `.json` file per collection. To restore, unzip it and bring the files back with **Import from file** on the Sync tab (Import takes `.json` files, not the zip).
- It holds variables only, not text styles or code syntax.
- If the backup can't be saved, the Pull stops and says why. Untick the box to pull without one.
- It isn't offered when the file has no variables yet, such as the first Pull into an empty file.

## Sync status

The Sync tab says which side changed since the last sync, not only that the two differ. It checks by itself when it opens; **Refresh** checks again.

| Label         | Meaning                                      |
| ------------- | -------------------------------------------- |
| `N to push`   | Changed in Figma only. Push sends it.        |
| `N to pull`   | Changed on GitHub only. Pull brings it in.   |
| `N conflicts` | Changed on both sides to different values.   |
| Up to date    | Nothing changed since the last Push or Pull. |

After a direct Push or a Pull, the plugin records what each side looked like. That record lives in the Figma file, per repository, branch and folder, and is never sent to GitHub. With no record yet (a new file, or you changed repository, branch or folder) the tab says `N differences, direction unknown`: Pull once to set it, or use **Mark as synced** in the Pull review if nothing differs.

A push that opens a pull request does not move the record, because the branch is untouched.

## Conflicts

A conflict is a token changed in Figma and on GitHub to different values, or a Push that would lose a GitHub edit Figma lacks. These open the per-token list: keep the Figma value, take the GitHub value, set one by hand, per token or in bulk.

## Sync modes

- **Direct:** commits the changed files to the branch.
- **Pull request:** pushes to a new branch and opens a pull request.

In both, a file is written only when its content changed, and a Push that changes nothing makes no commit (and no branch or pull request). The commit message names only the collections that changed.

## Tokens left out

Some Figma variables can't be written to the repository: spring easings, composed colours, and anything that aliases them. After a Push or export, a notice lists what was left out, grouped by collection, each with its reason. In a repository that uses the [DTCG layout](FORMATS.md#what-a-push-writes), a token the format can't hold is also left out and stays in Figma.

## When something goes wrong

A failed Pull, Push or status check says what happened and offers one fix.

| What happened                              | What you see                                             | The button               |
| ------------------------------------------ | -------------------------------------------------------- | ------------------------ |
| GitHub rejected your token                 | It may have expired or been revoked                      | Enter a new token        |
| The token lacks access                     | What a private repository needs of the token             | Enter a new token        |
| Rate limit                                 | "Try again at 14:05", from GitHub's reset time           | Try Again                |
| Repository, token folder or file not found | Names the repository, the folder and branch, or the file | Edit setup               |
| The branch moved during a sync             | "Nothing was lost. Try again."                           | Try Again                |
| A token file is not valid JSON             | Names the file                                           | none: fix it in the repo |
| No answer from GitHub                      | "Can't reach GitHub. Check your connection."             | Try Again                |

**Show Details** on an error has GitHub's original message. Token and setup problems are covered in [Setup](SETUP.md#create-a-github-token).
