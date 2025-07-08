import { useParams } from "react-router-dom"

export default function DetailPageClasse(): React.JSX.Element {
  const params = useParams()
  return (
    <div>
      <h1 className="text-2xl">Detail</h1>
      <p>
        Lorem, ipsum dolor sit amet consectetur adipisicing elit. Fugit, error. Repudiandae quaerat
        laudantium blanditiis culpa porro dignissimos est, vel laborum voluptatem optio libero
        aliquid error quia doloribus iure eos veritatis?
      </p>
      <p>{JSON.stringify(params, null, 4)}</p>
    </div>
  )
}
