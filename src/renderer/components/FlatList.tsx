import React from "react"

type FlatListProps<T> = {
  data: T[]
  keyExtractor?(item: T, index: number): string
  renderItem(params: { item: T; key?: string; index: number; data: T[] }): React.JSX.Element
}

export default function FlatList<T>({
  data,
  renderItem,
  keyExtractor,
}: FlatListProps<T>): React.JSX.Element {
  return (
    <div className="flex flex-col gap-2 p-2">
      {data.map((item, index) =>
        renderItem({ item, index, data, key: keyExtractor?.(item, index) }),
      )}
    </div>
  )
}
