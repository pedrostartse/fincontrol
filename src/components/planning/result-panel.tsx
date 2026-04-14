import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts"
import { TrendingUp, Landmark, Clock, Banknote, BookmarkPlus } from "lucide-react"
import type { PlanningResult } from "@/hooks/usePlanning"

const brl = (value: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(value)

const formatMonths = (months: number | null): string => {
    if (months === null) return "—"
    const y = Math.floor(months / 12)
    const m = months % 12
    if (y === 0) return `${m} meses`
    if (m === 0) return `${y} anos`
    return `${y} anos e ${m} meses`
}

const formatXAxis = (month: number) => {
    if (month % 12 === 0) return `Ano ${month / 12}`
    return ""
}

const formatTooltipValue = (value: number) => brl(value)

interface ChartData {
    month: number
    nominal: number
    real: number
    contributed: number
}

function downsample(data: ChartData[], maxPoints: number): ChartData[] {
    if (data.length <= maxPoints) return data
    const step = Math.ceil(data.length / maxPoints)
    return data.filter((_, i) => i % step === 0 || i === data.length - 1)
}

interface ResultPanelProps {
    result: PlanningResult
    onSaveAsGoal: () => void
    saving: boolean
    targetAmount: number
}

export function ResultPanel({ result, onSaveAsGoal, saving, targetAmount }: ResultPanelProps) {
    const {
        futureValueNominal,
        futureValueReal,
        totalContributed,
        totalInterestEarned,
        monthsToReachTarget,
        monthlyData,
    } = result

    const chartData = downsample(monthlyData, 120)

    const summaryCards = [
        {
            label: "Valor acumulado (nominal)",
            value: brl(futureValueNominal),
            sub: "Sem ajuste de inflação",
            icon: TrendingUp,
            highlight: true,
        },
        {
            label: "Valor real (hoje)",
            value: brl(futureValueReal),
            sub: "Poder de compra atual",
            icon: Banknote,
            highlight: false,
        },
        {
            label: "Total aportado",
            value: brl(totalContributed),
            sub: "Capital investido",
            icon: Landmark,
            highlight: false,
        },
        {
            label: "Rendimento total",
            value: brl(Math.max(0, totalInterestEarned)),
            sub: `${totalContributed > 0 ? Math.round((totalInterestEarned / totalContributed) * 100) : 0}% sobre o aportado`,
            icon: TrendingUp,
            highlight: false,
        },
    ]

    return (
        <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {summaryCards.map((card) => (
                    <Card key={card.label} className={card.highlight ? "border-primary/40 bg-primary/5" : ""}>
                        <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                    <p className="text-xs text-muted-foreground truncate">{card.label}</p>
                                    <p className={`text-xl font-bold mt-1 ${card.highlight ? "text-primary" : ""}`}>
                                        {card.value}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-0.5">{card.sub}</p>
                                </div>
                                <card.icon className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {targetAmount > 0 && (
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between flex-wrap gap-3">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                                    <Clock className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium">Prazo para atingir o objetivo</p>
                                    <p className="text-xs text-muted-foreground">{brl(targetAmount)}</p>
                                </div>
                            </div>
                            <p className="text-2xl font-bold text-primary">{formatMonths(monthsToReachTarget)}</p>
                        </div>
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-base">Evolução do patrimônio</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                    <ResponsiveContainer width="100%" height={280}>
                        <LineChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                            <XAxis
                                dataKey="month"
                                tickFormatter={formatXAxis}
                                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                                interval="preserveStartEnd"
                            />
                            <YAxis
                                tickFormatter={(v) => {
                                    if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`
                                    if (v >= 1_000) return `${(v / 1_000).toFixed(0)}k`
                                    return v
                                }}
                                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                                width={55}
                            />
                            <Tooltip
                                formatter={formatTooltipValue}
                                labelFormatter={(m) => `Mês ${m} — ${formatXAxis(m) || `Mês ${m}`}`}
                                contentStyle={{
                                    background: "hsl(var(--card))",
                                    border: "1px solid hsl(var(--border))",
                                    borderRadius: 8,
                                    fontSize: 12,
                                }}
                            />
                            <Legend wrapperStyle={{ fontSize: 12 }} />
                            <Line
                                type="monotone"
                                dataKey="nominal"
                                name="Nominal"
                                stroke="hsl(var(--primary))"
                                strokeWidth={2}
                                dot={false}
                            />
                            <Line
                                type="monotone"
                                dataKey="real"
                                name="Real (sem inflação)"
                                stroke="#f59e0b"
                                strokeWidth={2}
                                dot={false}
                                strokeDasharray="5 3"
                            />
                            <Line
                                type="monotone"
                                dataKey="contributed"
                                name="Aportado"
                                stroke="hsl(var(--muted-foreground))"
                                strokeWidth={1.5}
                                dot={false}
                                strokeDasharray="3 3"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            <div className="flex justify-end">
                <Button onClick={onSaveAsGoal} disabled={saving} className="gap-2">
                    <BookmarkPlus className="h-4 w-4" />
                    {saving ? "Salvando..." : "Salvar como Meta"}
                </Button>
            </div>
        </div>
    )
}
