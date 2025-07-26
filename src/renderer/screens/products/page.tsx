import React from "react"
import { Calendar } from "lucide-react"

import { Section } from "@renderer/components/FlatList.Command"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@renderer/components/ui/tabs"

import { Separator } from "@renderer/components/ui/separator"
import { ScrollArea } from "@renderer/components/ui/scroll-area"
import ButtonActions from "@renderer/components/button-actions"
import { Badge } from "@renderer/components/ui/badge"
import DialogTable from "@renderer/components/dialog-table"

import { getClassMenu, getClassesToolbarMenu } from "./menu-classes"
import ActivityProcessor from "@renderer/components/activity-process"
import ClassesItem from "@renderer/components/classes-item"

type TClasses = { id: number; name: string; icon: React.JSX.Element }
const data: Section<TClasses>[] = [
  {
    title: "Secondaire",
    data: [
      { id: 1, name: "7eme EB/ A", icon: <Calendar /> },
      { id: 2, name: "7eme EB/ B", icon: <Calendar /> },
      { id: 3, name: "8 eme EB/ A", icon: <Calendar /> },
      { id: 4, name: "8eme EB/ B", icon: <Calendar /> },
      { id: 5, name: "1eme Sc", icon: <Calendar /> },
      { id: 6, name: "1eme Elec", icon: <Calendar /> },
      { id: 5, name: "1eme Mg", icon: <Calendar /> },
      { id: 6, name: "1eme Ma", icon: <Calendar /> },
      { id: 5, name: "1eme CC", icon: <Calendar /> },
      { id: 6, name: "1eme CG", icon: <Calendar /> },
      { id: 5, name: "1eme Hp", icon: <Calendar /> },
      { id: 5, name: "2eme Sc", icon: <Calendar /> },
      { id: 6, name: "2eme Elec", icon: <Calendar /> },
      { id: 5, name: "2eme Mg", icon: <Calendar /> },
      { id: 6, name: "2eme Ma", icon: <Calendar /> },
      { id: 5, name: "2eme CC", icon: <Calendar /> },
      { id: 6, name: "2eme CG", icon: <Calendar /> },
      { id: 5, name: "2eme Hp", icon: <Calendar /> },
      { id: 5, name: "3eme Sc", icon: <Calendar /> },
      { id: 6, name: "3eme Elec", icon: <Calendar /> },
      { id: 5, name: "3eme Mg", icon: <Calendar /> },
      { id: 6, name: "3eme Ma", icon: <Calendar /> },
      { id: 5, name: "3eme CC", icon: <Calendar /> },
      { id: 6, name: "3eme CG", icon: <Calendar /> },
      { id: 5, name: "3eme Hp", icon: <Calendar /> },
      { id: 5, name: "4eme Sc", icon: <Calendar /> },
      { id: 6, name: "4eme Elec", icon: <Calendar /> },
      { id: 5, name: "4eme Mg", icon: <Calendar /> },
      { id: 6, name: "4eme Ma", icon: <Calendar /> },
      { id: 5, name: "4eme CC", icon: <Calendar /> },
      { id: 6, name: "4eme CG", icon: <Calendar /> },
      { id: 5, name: "4eme Hp", icon: <Calendar /> },
    ],
  },
  {
    title: "Primaire",
    data: [
      { id: 1, name: "1er maternel", icon: <Calendar /> },
      { id: 2, name: "2eme Maternel", icon: <Calendar /> },
      { id: 3, name: "3me Maternel", icon: <Calendar /> },
      { id: 4, name: "1er Primaire", icon: <Calendar /> },
      { id: 4, name: "2eme Primaire", icon: <Calendar /> },
      { id: 4, name: "3eme Primaire", icon: <Calendar /> },
      { id: 4, name: "4eme Primaire", icon: <Calendar /> },
      { id: 4, name: "5eme Primaire", icon: <Calendar /> },
      { id: 4, name: "6eme Primaire", icon: <Calendar /> },
    ],
  },
]

export default function ClassesPage(): React.JSX.Element {
  return (
    <>
      <div className="h-[80px]">
        <div className="grid grid-cols-2 max-w-2xl mx-auto mt-5">
          <div className="flex flex-col gap-2">
            <h1 className="text-xl font-bold">Classes</h1>
            <div className="flex gap-5">
              <span className="text-muted-foreground">1234 eleves inscrits</span>
              <Badge variant="outline">Pour l&apos;annees encoures</Badge>
            </div>
          </div>
          <ButtonActions
            menus={getClassesToolbarMenu({
              onDelete() {
                console.log("onDelete")
              },
              onDownload() {
                console.log("onDownload")
              },
              onEdit() {
                console.log("OnEdit")
              },
              onPrintCalendar() {
                console.log("onPrintCalendar")
              },
              onPrintPrevision() {
                console.log("onPrintPrevision")
              },
            })}
          />
        </div>
      </div>
      <Separator />
      <Tabs defaultValue="classes" className="h-[calc(100%-120px)]">
        <div className="flex items-center py-2 max-w-2xl mx-auto mt-5">
          <TabsList className="">
            <TabsTrigger value="activity" className="text-zinc-600 dark:text-zinc-200">
              Toutes les activites
            </TabsTrigger>
            <TabsTrigger value="classes" className="text-zinc-600 dark:text-zinc-200">
              Classes
            </TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="activity" className="m-0  h-full">
          <ScrollArea className=" h-[calc(100%-60px)]">
            <div className="max-w-2xl mx-auto mt-5">
              <ActivityProcessor />
            </div>
          </ScrollArea>
        </TabsContent>
        <TabsContent value="classes" className="m-0 h-full">
          <ScrollArea className="h-[calc(100%-60px)]">
            <div className="max-w-2xl mx-auto mt-5">
              {data.map((group) => (
                <div key={group.title} className="flex flex-col gap-5 mb-5">
                  <h1 className="font-semibold">{group.title}</h1>
                  <div className="grid grid-cols-2 gap-2">
                    {/* card classes */}
                    {group.data.map((cls) => (
                      <DialogTable
                        key={cls.id}
                        trigger={
                          <ClassesItem
                            title={cls.name}
                            icon={cls.icon}
                            menus={getClassMenu({
                              onDebarquer() {
                                console.log("on Debarquer")
                              },
                              onDelete() {
                                console.log("on delete classes")
                              },
                              onEdit() {
                                console.log("on Edit classes")
                              },
                            })}
                          />
                        }
                      ></DialogTable>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </>
  )
}
