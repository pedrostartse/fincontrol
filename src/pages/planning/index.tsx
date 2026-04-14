import { useState, useMemo } from "react"
import { usePlanning, calcScenarios } from "@/hooks/usePlanning"
import type { PlanningInputs } from "@/hooks/usePlanning"
import { SimulatorForm } from "@/components/planning/simulator-form"
import { ResultPanel } from "@/components/planning/result-panel"
import { ScenariosPanel } from "@/components/planning/scenarios-panel"
import { GoalsSection } from "@/components/planning/goals-section"
import { useGoals } from "@/hooks/useGoals"
import { MapPin } from "lucide-react"

const DEFAULT_INPUTS: PlanningInputs = {
    targetAmount: 500000,
    initialAmount: 0,
    monthlyContribution: 1000,
    annualInterestRate: 12,
    annualInflationRate: 4.5,
    years: 10,
}

export function PlanningPage() {
    const [inputs, setInputs] = useState<PlanningInputs>(DEFAULT_INPUTS)
    const [saving, setSaving] = useState(false)
    const [goalsRefreshKey, setGoalsRefreshKey] = useState(0)
    const { addGoal } = useGoals()

    const result = usePlanning(inputs)
    const scenarios = useMemo(() => calcScenarios(inputs), [inputs])

    const handleSaveAsGoal = async () => {
        setSaving(true)
        const deadline = new Date()
        deadline.setFullYear(deadline.getFullYear() + inputs.years)

        await addGoal({
            name: inputs.targetAmount > 0
                ? `Planejamento: ${new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(inputs.targetAmount)}`
                : `Simulação de ${inputs.years} anos`,
            target_amount: inputs.targetAmount > 0 ? inputs.targetAmount : result.futureValueNominal,
            current_amount: inputs.initialAmount,
            deadline: deadline.toISOString().split("T")[0],
        })

        setSaving(false)
        setGoalsRefreshKey((k) => k + 1)
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                    <MapPin className="h-7 w-7 text-primary" />
                    Planejamento de Longo Prazo
                </h1>
                <p className="text-muted-foreground mt-1 text-sm">
                    Simule seus objetivos financeiros e acompanhe o progresso das suas metas.
                </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
                <SimulatorForm inputs={inputs} onChange={setInputs} />

                <div className="space-y-4">
                    <ResultPanel
                        result={result}
                        onSaveAsGoal={handleSaveAsGoal}
                        saving={saving}
                        targetAmount={inputs.targetAmount}
                    />
                </div>
            </div>

            <ScenariosPanel scenarios={scenarios} targetAmount={inputs.targetAmount} />

            <div className="border-t border-border/50 pt-2">
                <GoalsSection refreshKey={goalsRefreshKey} />
            </div>
        </div>
    )
}
