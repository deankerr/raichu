Ensure that `.cursor/rules/convex_rules.mdc` in the project root directory has been read before working with the convex backend.

If there are type errors in the convex directory when checking the project, the dev server will not be able to compile the convex functions.

You must annotate the variable being assigned the result of a call to `ctx.runQuery` or `ctx.runMutation`, or recursive type errors will cause failures in unexpected ways.
