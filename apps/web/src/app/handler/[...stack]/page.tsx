import { StackHandler } from "@stackframe/stack"
import { stackServerApp } from "../../../stack/server"

export default function Handler(props: unknown) {
  return <StackHandler app={stackServerApp} fullPage routeProps={props} />
}
