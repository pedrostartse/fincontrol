import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SlidersHorizontal } from "lucide-react"
import type { PlanningInputs } from "@/hooks/usePlanning"

interface SimulatorFormProps {
    inputs: PlanningInputs
    onChange: (inputs: PlanningInputs) => void
}

interface FieldConfig {
    key: keyof PlanningInputs
    label: string
    placeholder: string
    prefix?: string
    suffix?: string
    min: number
    max: number
    step: number
}

const fields: FieldConfig[] = [
    {
        key: "targetAmount",
        label: "Objetivo",
        placeholder: "500000",
        prefix: "R$",
        min: 0,
        max: 100000000,
        step: 1000,
    },
    {
        key: "initialAmount",
        label: "Valor já guardado",
        placeholder: "0",
        prefix: "R$",
        min: 0,
        max: 100000000,
        step: 100,
    },
    {
        key: "monthlyContribution",
        label: "Aporte mensal",
        placeholder: "1000",
        prefix: "R$",
        min: 0,
        max: 1000000,
        step: 50,
    },
    {
        key: "annualInterestRate",
        label: "Taxa de juros anual",
        placeholder: "12",
        suffix: "%",
        min: 0,
        max: 100,
        step: 0.1,
    },
    {
        key: "annualInflationRate",
        label: "Inflação anual estimada",
        placeholder: "4.5",
        suffix: "%",
        min: 0,
        max: 50,
        step: 0.1,
    },
    {
        key: "years",
        label: "Prazo",
        placeholder: "10",
        suffix: "anos",
        min: 1,
        max: 50,
        step: 1,
    },
]

export function SimulatorForm({ inputs, onChange }: SimulatorFormProps) {
    const handleChange = (key: keyof PlanningInputs, raw: string) => {
        const value = parseFloat(raw.replace(",", "."))
        onChange({ ...inputs, [key]: isNaN(value) ? 0 : value })
    }

    return (
        <Card>
            <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                    <SlidersHorizontal className="h-5 w-5 text-primary" />
                    Parâmetros da simulação
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid gap-4 sm:grid-cols-2">
                    {fields.map((field) => (
                        <div key={field.key} className="space-y-1.5">
                            <Label htmlFor={field.key} className="flex items-end h-8 leading-tight">{field.label}</Label>
                            <div className="relative flex items-center">
                                {field.prefix && (
                                    <span className="absolute left-3 text-sm text-muted-foreground select-none">
                                        {field.prefix}
                                    </span>
                                )}
                                <Input
                                    id={field.key}
                                    type="number"
                                    min={field.min}
                                    max={field.max}
                                    step={field.step}
                                    placeholder={field.placeholder}
                                    value={inputs[field.key] || ""}
                                    onChange={(e) => handleChange(field.key, e.target.value)}
                                    className={field.prefix ? "pl-9" : field.suffix ? "pr-12" : ""}
                                />
                                {field.suffix && (
                                    <span className="absolute right-3 text-sm text-muted-foreground select-none">
                                        {field.suffix}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
