import agent from "@convex-dev/agent/convex.config"
import stackAuthComponent from "@stackframe/stack/convex.config"
import { defineApp } from "convex/server"

const app = defineApp()
app.use(agent)
app.use(stackAuthComponent)

export default app
