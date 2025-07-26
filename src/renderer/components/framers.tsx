import React from "react"

type FramerRef = {
  changeFrame(name: string): void
}

type FramersProps = {
  initialValue: string
  frames: { [name: string]: JSX.Element }
}

export function useFramers(): {
  frameRef: React.RefObject<FramerRef>
  changeFrame(name: string): void
} {
  const frameRef = React.useRef<FramerRef>(null)
  const changeFrame = (name: string): void => {
    frameRef.current?.changeFrame(name)
  }

  return { frameRef, changeFrame }
}

const Framers = React.forwardRef<FramerRef, FramersProps>(({ initialValue, frames }, ref) => {
  const [frame, setFrame] = React.useState<string>(initialValue)
  const activeFrame = React.useMemo(() => frames[frame], [frame, frames])
  React.useImperativeHandle(ref, () => ({ changeFrame: setFrame }), [])

  return <div>{activeFrame}</div>
})
Framers.displayName = "Framers"
export default Framers
