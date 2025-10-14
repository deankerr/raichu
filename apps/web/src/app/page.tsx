import "ldrs/react/Infinity.css"

import { Infinity as InfinityLoader } from "ldrs/react"

export default function Home() {
  return (
    <div className="grid h-svh place-content-center">
      <InfinityLoader
        bgOpacity="0.1"
        color="#888"
        size="55"
        speed="1.3"
        stroke="4"
        strokeLength="0.15"
      />
    </div>
  )
}
