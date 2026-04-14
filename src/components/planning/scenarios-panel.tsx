import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Layers } from "lucide-react"
import type { ScenarioResult } from "@/hooks/usePlanning"
import { cn } from "@/lib/utils"

const brl = (value: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(value)

const formatMonths = (months: number | null): string => {
    if (months === null) return "Não atingido"
    const y = Math.floor(months / 12)
    const m = months % 12
    if (y === 0) return `${m} meses`
    if (m === 0) return `${y} anos`
    return `${y}a ${m}m`
}

interface ScenariosPanelProps {
    scenarios: ScenarioResult[]
    targetAmount: number
}

const scenarioStyles = [
    { border: "border-amber-500/30", badge: "bg-amber-500/10 text-amber-500", accent: "text-amber-500" },
    { border: "border-primary/40 bg-primary/5", badge: "bg-primary/10 text-primary", accent: "text-primary" },
    { border: "border-emerald-500/30", badge: "bg-emerald-500/10 text-emerald-500", accent: "text-emerald-500" },
]

export function ScenariosPanel({ scenarios, targetAmount }: ScenariosPanelProps) {
    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                    <Layers className="h-5 w-5 text-primary" />
                    Comparativo de cenários
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid gap-3 sm:grid-cols-3">
                    {scenarios.map((scenario, i) => {
                        const style = scenarioStyles[i]
                        const interestPct =
                            scenario.totalContributed > 0
                                ? Math.round((scenario.totalInterestEarned / scenario.totalContributed) * 100)
                                : 0

                        return (
                            <div
                                key={scenario.label}
                                className={cn(
                                    "rounded-lg border p-4 space-y-3 transition-all",
                                    style.border
                                )}
                            >
                                <div className="flex items-center justify-between gap-2">
                                    <span className="text-sm font-medium leading-tight">{scenario.label}</span>
                                    <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium shrink-0", style.badge)}>
                                        {i === 1 ? "Base" : i === 0 ? "−50%" : "+50%"}
                                    </span>
                                </div>

                                <div className="space-y-2">
                                    <div>
                                        <p className="text-xs text-muted-foreground">Aporte mensal</p>
                                        <p className="font-semibold">{brl(scenario.monthlyContribution)}</p>
                                    </div>

                                    <div>
                                        <p className="text-xs text-muted-foreground">Acumulado</p>
                                        <p className={cn("text-lg font-bold", style.accent)}>
                                            {brl(scenario.futureValueNominal)}
                                        </p>
                                    </div>

                                    <div className="flex gap-3">
                                        <div className="flex-1">
                                            <p className="text-xs text-muted-foreground">Rendimento</p>
                                            <p className="text-sm font-medium">{interestPct}%</p>
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-xs text-muted-foreground">Valor real</p>
                                            <p className="text-sm font-medium">{brl(scenario.futureValueReal)}</p>
                                        </div>
                                    </div>

                                    {targetAmount > 0 && (
                                        <div className="border-t border-border/50 pt-2">
                                            <p className="text-xs text-muted-foreground">Prazo p/ objetivo</p>
                                            <p className="text-sm font-semibold">{formatMonths(scenario.monthsToReachTarget)}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </CardContent>
        </Card>
    )
}
