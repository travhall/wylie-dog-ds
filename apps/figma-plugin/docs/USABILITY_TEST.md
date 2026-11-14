# Token Bridge usability test

The exit test for the UX overhaul (plan 224, Phase 3): **three people who did not build the plugin connect it to a repository, push a change, open the resulting pull request, and pull a change back, without help.**

This page is the script for the person running the sessions (the facilitator). Nothing here is shown to participants.

## What a pass is

Per participant, tasks 1 to 4 each finish **unaided**. A hint, or the facilitator touching the screen, makes that task a "with help" result. The overall test passes when all three participants finish tasks 1 to 4 unaided. Task 5 (recovery) is scored but does not decide the pass; it checks that the error messages work.

Run it once on the current `main`. Fix what repeats across participants (anything two of three hit), then run it again with three new people. Three people is enough to find the repeating problems, not to measure a rate.

## Who

Three people per run who:

- use Figma variables or design tokens in their work, and have a GitHub account;
- have not seen Token Bridge or worked on it;
- are comfortable with Git words (commit, pull request) but are not developers of this repository.

Do not recruit the three people who built or reviewed it. Mix one person who is mostly a designer with one who codes.

## Setup (once per run)

1. **Plugin.** Build it (`pnpm --filter figma-plugin build`) and give each participant a way to run it: import `apps/figma-plugin/manifest.json` as a development plugin in the Figma desktop app (Plugins, Development, Import plugin from manifest), on their machine or yours. A private publish is easier but belongs to Phase 4.
2. **Repository.** A private scratch repository holding a small token set (the "Acme" set in `apps/figma-plugin/src/plugin/__fixtures__/acme/` works: two sets, two modifiers). Invite each participant as a collaborator with write access. Give each a branch of their own (`tester-1`, `tester-2`, `tester-3`), all cut from the same commit, so sessions never touch each other and nothing needs resetting.
3. **Figma file.** One new, empty design file per participant (Pull creates the variables). Do not duplicate a file that already holds Token Bridge settings.
4. **Their own token.** They create a GitHub token themselves in task 1; that is part of the test. Tell them to delete it afterwards.
5. **Recording.** Screen and voice, with their agreement, kept only until the notes are written. No names in the notes: use P1, P2, P3.

## Script

Read the opening aloud. Then give each task as one sentence, on paper or in chat, and say nothing else.

**Opening.** "We are testing the plugin, not you. Nothing you do is wrong; if something is confusing, that is the plugin's fault and exactly what I need to know. Please think aloud: say what you are looking at and what you expect. I will not be able to answer questions about how it works, but I will write them down. You can stop at any time."

| #   | Task (the sentence you give them)                                                                                                                                              | Done when                                                    |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------ |
| 1   | "Connect this plugin to the repository `<owner>/<repo>`, branch `tester-N`. Use your own GitHub account."                                                                      | Setup saved; the Sync tab shows the repository with no error |
| 2   | "Get the design tokens from the repository into this Figma file."                                                                                                              | Four collections exist as Figma variables                    |
| 3   | "Change the colour of one variable, then send that change to GitHub."                                                                                                          | A pull request (or commit) exists with only that change      |
| 4   | "Someone changed a token in the repository. Bring that change into Figma." _(Between 3 and 4 you change one token on their branch, off screen.)_                               | The changed value shows in Figma                             |
| 5   | "Something is broken with the connection; find out what and fix it." _(Before the session, set the branch's token folder to a name that does not exist, or revoke the token.)_ | They reach the setup, correct it, and the status works again |

Hints: say nothing for 90 seconds of silence, then "What are you trying to do?" If still stuck after another 60 seconds, point to the area of the screen (hint 1), then name the button (hint 2). Record which hint, at what time. A hint makes the task "with help".

## What to write down

For each task and participant:

- **Result:** unaided, with help (which hint), or not finished.
- **Time:** from reading the task to done.
- **Where they paused or went wrong:** the screen, and what they said.
- **Errors shown:** the exact message, and whether the button on it helped.
- **Ease, 1 to 7:** "How easy was that?" right after each task.
- **Words:** what they call Push, Pull and Review changes, in their own words.

After task 5, ask:

1. "In your own words, what does Push do? And Pull?"
2. "Before anything was written, did you feel you knew what would change?"
3. "What would you change first?"

## After the sessions

Sort every note into one of: **blocked** (could not continue), **wrong turn** (recovered alone), **hesitation**, **wording** (a word they did not understand), **idea**. A problem two or three of three people hit is a fix; one person's is a watch. Rank fixes by how many people it stopped and how long it took them to recover. Write the result into the plan (`plans/224-token-bridge-release.md`, Phase 3) and fix the top ones before the second run.

## What this does not test

Figma Community publishing, plugin install, and performance on a large file (Phase 4); a Wylie Dog project (the repository above is not one, on purpose); GitLab or other providers.
