import { getConvexProvidersConfig } from "@stackframe/stack"

export default {
  providers: getConvexProvidersConfig({
    projectId: process.env.STACK_PROJECT_ID as string,
  }),
}
