import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
} from "recharts";
import {
  ArrowUpRight,
  ArrowDownLeft,
  Wallet,
  Coins,
  Star,
  User,
  Circle,
  Bell,
  ChevronDown,
  MoreHorizontal,
  LayoutDashboard,
} from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/renderer/components/ui/avatar";
import { Button } from "@/renderer/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/renderer/components/ui/card";
import { Badge } from "@/renderer/components/ui/badge";
import { Progress } from "@/renderer/components/ui/progress";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/renderer/components/ui/toggle-group";
import { Input } from "@/renderer/components/ui/input";

// --- Données factices pour le graphique ---
const chartData = [
  { name: "Jan 1", value: 3500, trend: 3500 },
  { name: "Jan 2", value: 3700, trend: 3700 },
  { name: "Jan 3", value: 3200, trend: 3150 },
  { name: "Jan 4", value: 3900, trend: 3800 },
  { name: "Jan 5", value: 4100, trend: 4200 },
  { name: "Jan 6", value: 3800, trend: 3500 },
  { name: "Jan 7", value: 4300, trend: 4300 },
  { name: "Jan 8", value: 4600, trend: 4400 },
  { name: "Jan 9", value: 4100, trend: 4600 },
  { name: "Jan 10", value: 4883, trend: 5000 },
];

// --- Données factices pour les actifs ---
const assetsData = [
  {
    name: "Osmosis",
    chain: "cosmos1z5m2...920e",
    amount: 2312.23,
    token: "27.221 OSMO",
    action: "Vote",
  },
  {
    name: "ATOM",
    chain: "Cosmos Network",
    amount: 1548.42,
    token: "60.55 ATOM",
    action: "Vote",
  },
  {
    name: "Terra",
    chain: "cosmos2t5m2...920e",
    amount: 1252.32,
    token: "11.42 LUNA",
    action: "Stake",
  },
];

// --- Données factices pour l'allocation ---
const allocationData = [
  { name: "Osmosis", staked: 32, available: 68 },
  { name: "Cosmos Hub", staked: 28, available: 72 },
  { name: "Terra", staked: 24, available: 76 },
  { name: "Kava", staked: 16, available: 84 },
];

export default function CryptoDashboard() {
  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      {/* --- Navbar --- */}
      <nav className="bg-black text-white px-8 py-4 flex justify-between items-center shadow-lg border-b border-gray-800">
        <div className="flex items-center gap-8">
          <div className="h-10 w-10 bg-sky-400 rounded-full flex items-center justify-center text-xl font-bold text-black">
            <LayoutDashboard className="w-5 h-5" />
          </div>
          <ul className="hidden md:flex gap-6 text-sm font-medium text-gray-400">
            <li className="text-white cursor-pointer hover:text-white transition-colors">
              Dashboard
            </li>
            <li className="hover:text-white cursor-pointer transition-colors">
              Staking
            </li>
            <li className="hover:text-white cursor-pointer transition-colors">
              Chains
            </li>
            <li className="hover:text-white cursor-pointer transition-colors">
              Tokenomics
            </li>
            <li className="hover:text-white cursor-pointer transition-colors">
              Hub
            </li>
          </ul>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 bg-gray-900 border border-gray-700 rounded-full px-3 py-1.5 text-xs text-gray-400">
            <Circle className="w-3 h-3 text-gray-500 fill-gray-500" />
            <span>cosm2...920e</span>
          </div>
          <Button
            variant="outline"
            className="hidden sm:flex border-gray-600 text-white hover:bg-gray-800 rounded-full gap-2 h-8 text-xs"
          >
            <div className="bg-sky-400 w-4 h-4 rounded-full flex items-center justify-center text-[8px] text-black font-bold">
              C
            </div>
            Cosmos Hub
            <ChevronDown className="w-3 h-3" />
          </Button>
          <Avatar className="h-8 w-8 border border-gray-600">
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
        </div>
      </nav>

      {/* --- Contenu Principal --- */}
      <main className="max-w-7xl mx-auto p-6 lg:p-8 bg-white min-h-screen">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* --- Colonne Gauche (Graphique) --- */}
          <div className="lg:col-span-2 space-y-8">
            <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>

            {/* Header Graphique */}
            <div className="flex justify-between items-end flex-wrap gap-4">
              <div>
                <div className="flex items-center gap-4">
                  <h2 className="text-4xl font-bold">$4,883.98</h2>
                  <Badge className="bg-black text-white hover:bg-gray-800 px-2 py-0.5 text-xs">
                    + 4.89%
                  </Badge>
                </div>
                <p className="text-lg font-medium text-gray-700 mt-1">
                  +$980.22
                </p>
              </div>
            </div>

            {/* Composant Graphique */}
            <div className="bg-gray-50/50 rounded-xl p-4 h-[350px] border border-gray-100">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={true}
                    horizontal={true}
                    stroke="#e5e7eb"
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#9ca3af", fontSize: 12 }}
                    tickMargin={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#9ca3af", fontSize: 12 }}
                    tickFormatter={(value) => `$${value}`}
                    domain={[2800, 5200]}
                    width={60}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      borderColor: "#e5e7eb",
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                    itemStyle={{ color: "#111" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="trend"
                    stroke="#7dd3fc"
                    strokeDasharray="4 4"
                    fill="url(#gradientTrend)"
                    strokeWidth={2}
                    fillOpacity={0.1}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#000"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{
                      r: 6,
                      strokeWidth: 2,
                      stroke: "#fff",
                      fill: "#000",
                    }}
                  />
                  <defs>
                    <linearGradient
                      id="gradientTrend"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#7dd3fc" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#7dd3fc" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                </LineChart>
              </ResponsiveContainer>

              {/* Contrôles du graphique */}
              <div className="flex justify-between items-center mt-4 flex-wrap gap-2">
                <ToggleGroup
                  type="single"
                  variant="outline"
                  className="bg-gray-100 p-1 rounded-lg"
                >
                  <ToggleGroupItem
                    value="24h"
                    className="text-xs px-3 py-1 data-[state=on]:bg-white data-[state=on]:shadow-sm rounded-md border-0"
                  >
                    24H
                  </ToggleGroupItem>
                  <ToggleGroupItem
                    value="1d"
                    className="text-xs px-3 py-1 data-[state=on]:bg-black data-[state=on]:text-white data-[state=on]:shadow-sm rounded-md border-0"
                  >
                    1D
                  </ToggleGroupItem>
                  <ToggleGroupItem
                    value="30d"
                    className="text-xs px-3 py-1 data-[state=on]:bg-white data-[state=on]:shadow-sm rounded-md border-0"
                  >
                    30D
                  </ToggleGroupItem>
                  <ToggleGroupItem
                    value="90d"
                    className="text-xs px-3 py-1 data-[state=on]:bg-white data-[state=on]:shadow-sm rounded-md border-0"
                  >
                    90D
                  </ToggleGroupItem>
                  <ToggleGroupItem
                    value="live"
                    className="text-xs px-3 py-1 data-[state=on]:bg-white data-[state=on]:shadow-sm rounded-md border-0"
                  >
                    LIVE
                  </ToggleGroupItem>
                </ToggleGroup>

                <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-3 text-xs bg-white shadow-sm font-medium"
                  >
                    USD
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-3 text-xs text-gray-500"
                  >
                    BTC
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* --- Colonne Droite (Portefeuille) --- */}
          <div className="lg:col-span-1 space-y-6">
            <h1 className="text-2xl font-bold tracking-tight">Your wallet</h1>

            <div className="space-y-4">
              {/* Total Balance */}
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs text-gray-500 font-medium">
                    Total balance
                  </p>
                  <h3 className="text-3xl font-bold">$4,883.98</h3>
                  <p className="text-sm text-gray-600">170.34 ATOM</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="rounded-full w-10 h-10 p-0 border-gray-300 shadow-sm"
                  >
                    <ArrowUpRight className="w-5 h-5 text-black" />
                  </Button>
                  <Button
                    variant="outline"
                    className="rounded-full w-10 h-10 p-0 border-gray-300 shadow-sm"
                  >
                    <ArrowDownLeft className="w-5 h-5 text-black" />
                  </Button>
                </div>
              </div>

              {/* Cartes Récapitulatives */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-3 gap-4">
                <Card className="bg-gray-200 border-0 shadow-none rounded-2xl">
                  <CardContent className="p-4">
                    <div className="bg-gray-400/30 w-8 h-8 rounded-full flex items-center justify-center mb-2">
                      <Wallet className="w-4 h-4 text-gray-700" />
                    </div>
                    <p className="text-xs text-gray-600 font-medium">
                      Total staked
                    </p>
                    <p className="text-lg font-bold">$2,846</p>
                  </CardContent>
                </Card>

                <Card className="bg-black border-0 shadow-none rounded-2xl text-white">
                  <CardContent className="p-4">
                    <div className="bg-gray-700 w-8 h-8 rounded-full flex items-center justify-center mb-2">
                      <Star className="w-4 h-4 text-white" />
                    </div>
                    <p className="text-xs text-gray-400 font-medium">
                      Total rewards
                    </p>
                    <p className="text-lg font-bold">$1,242</p>
                  </CardContent>
                </Card>

                <Card className="bg-sky-300 border-0 shadow-none rounded-2xl">
                  <CardContent className="p-4">
                    <div className="bg-white/30 w-8 h-8 rounded-full flex items-center justify-center mb-2">
                      <Coins className="w-4 h-4 text-white" />
                    </div>
                    <p className="text-xs text-gray-700 font-medium">
                      Available in ATOM
                    </p>
                    <p className="text-lg font-bold">93.4512</p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Assets */}
            <div className="pt-4 border-t border-gray-100">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg">Your assets</h3>
                <Button
                  variant="link"
                  className="text-xs text-gray-500 h-auto p-0"
                >
                  View all
                </Button>
              </div>
              <div className="space-y-4">
                {assetsData.map((asset) => (
                  <div
                    key={asset.name}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                        {asset.name[0]}
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{asset.name}</p>
                        <p className="text-[10px] text-gray-400 font-mono">
                          {asset.chain}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-semibold text-sm">
                          ${asset.amount.toLocaleString()}
                        </p>
                        <p className="text-[10px] text-gray-500">
                          {asset.token}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-3 text-[10px] text-sky-600 bg-sky-50 hover:bg-sky-100 rounded-full"
                        >
                          {asset.action}
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          className="h-6 px-3 text-[10px] bg-gray-900 text-white hover:bg-gray-800 rounded-full"
                        >
                          Stake
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Allocation */}
            <div className="pt-4 border-t border-gray-100">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg">Your allocation</h3>
                <div className="flex gap-4 text-[10px] font-semibold text-gray-400">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-sky-400 rounded-full"></span>{" "}
                    Staked
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-sky-200 rounded-full"></span>{" "}
                    Available
                  </span>
                </div>
              </div>

              <div className="space-y-5">
                {allocationData.map((item) => (
                  <div key={item.name} className="flex items-center gap-4">
                    <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-600">
                      {item.name[0]}
                    </div>
                    <div className="flex-1 flex items-center gap-4">
                      <span className="text-sm font-medium w-24 truncate">
                        {item.name}
                      </span>
                      {/* Barre de progression personnalisée deux tons */}
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden flex">
                        <div
                          className="bg-sky-400 h-full"
                          style={{ width: `${item.staked}%` }}
                        ></div>
                        <div
                          className="bg-sky-200 h-full"
                          style={{ width: `${item.available}%` }}
                        ></div>
                      </div>
                      <div className="flex items-center gap-2 w-12 justify-end">
                        <span className="text-sm font-medium">
                          {item.staked}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
