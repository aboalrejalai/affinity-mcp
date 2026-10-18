# Contributing

Thanks for helping agents get better at Affinity by Canva. Contributions are welcome in any language; the skill itself is written in English.

## What helps most

1. **New recipes** in `skills/affinity/references/recipes/`: a task you got working end to end (for example duotone, mock-ups, batch export, data-driven layouts).
2. **Corrections**: an API that behaves differently from what the references say, or a new Affinity release that changes something.
3. **Client support**: install notes or manifests for more agents.
4. **Translations** of the README.

## Ground rules for skill content

- **Verify before you document.** Every recipe must have been run on a real Affinity by Canva build, ideally checked with `render_spread`. State the Affinity version in your PR.
- **Never invent APIs.** If something is only in the docs and you have not run it, mark it `(docs)` or `(unverified)`.
- **Keep the safety rules.** Recipes must work on copies, ask before Canva AI calls, and never save, close or overwrite user documents implicitly.
- **No personal data** in examples (names, home paths, private images). Use `<Desktop>` and neutral sample text.
- **Keep `SKILL.md` lean** (under 500 lines). Put detail in `references/`.

## Workflow

1. Fork and create a branch: `git checkout -b recipe/duotone`.
2. Make your change. For recipes, include the full code and what to check in the render.
3. If you changed triggering or `SKILL.md`, describe the prompts you tested.
4. Open a pull request with the template filled in.

## Reporting bugs

Use the issue templates. For anything security-related, follow [SECURITY.md](SECURITY.md) instead of opening an issue.

By contributing you agree that your contribution is licensed under the project's [LICENSE](LICENSE).
