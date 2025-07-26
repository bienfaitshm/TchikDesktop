import React from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@renderer/components/ui/tabs"

export type TItemTab = {
  value?: string
  name: string
  content: React.ReactNode
}

export type ItemTabProps<T extends TItemTab> = {
  items?: T[]
  defaultValue?: T["name"] | T["value"]
}

type TabItemProps = {
  name: string
  value?: string
  component: React.ReactNode
}
export const TabItem: React.FC<TabItemProps> = () => {
  return null
}

type TabContainerProps = {
  initialValue: string
  children: React.ElementType<TabItemProps>[] | React.ElementType<TabItemProps>
}
export const TabContainer: React.FC<TabContainerProps> = ({ children }) => {
  const items = React.Children.map(children, (element) => {
    if (!React.isValidElement(element)) return
    return element.props
  }) as TabItemProps[]
  return (
    <Tabs>
      <TabsList className="flex justify-start py-2">
        {items.map((item, index) => (
          <TabsTrigger value={item.value || item.name} key={`${item.name}${index}`}>
            {item.name}
          </TabsTrigger>
        ))}
      </TabsList>
      {items.map((item) => (
        <TabsContent key={item.value || item.name} value={item.value || item.name}>
          {item.component}
        </TabsContent>
      ))}
    </Tabs>
  )
}

export default function ItemTab<T extends TItemTab>({
  items = [],
}: ItemTabProps<T>): React.ReactNode {
  return (
    <Tabs>
      <TabsList className="flex justify-start py-2">
        {items.map((item, index) => (
          <TabsTrigger value={item.value || item.name} key={`${item.name}${index}`}>
            {item.name}
          </TabsTrigger>
        ))}
      </TabsList>
      {items.map((item) => (
        <TabsContent key={item.value || item.name} value={item.value || item.name}>
          {item.content}
        </TabsContent>
      ))}
    </Tabs>
  )
}
