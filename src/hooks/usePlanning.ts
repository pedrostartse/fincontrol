export interface PlanningInputs {
    targetAmount: number
    initialAmount: number
    monthlyContribution: number
    annualInterestRate: number
    annualInflationRate: number
    years: number
}

export interface MonthlyDataPoint {
    month: number
    nominal: number
    real: number
    contributed: number
}

export interface PlanningResult {
    futureValueNominal: number
    futureValueReal: number
    totalContributed: number
    totalInterestEarned: number
    monthsToReachTarget: number | null
    monthlyData: MonthlyDataPoint[]
}

export interface ScenarioResult {
    label: string
    monthlyContribution: number
    futureValueNominal: number
    futureValueReal: number
    totalContributed: number
    totalInterestEarned: number
    monthsToReachTarget: number | null
}

function calcFutureValue(
    pv: number,
    pmt: number,
    monthlyRate: number,
    months: number
): number {
    if (monthlyRate === 0) {
        return pv + pmt * months
    }
    const factor = Math.pow(1 + monthlyRate, months)
    return pv * factor + pmt * ((factor - 1) / monthlyRate)
}

function calcMonthsToTarget(
    target: number,
    pv: number,
    pmt: number,
    monthlyRate: number,
    maxMonths = 1200
): number | null {
    let accumulated = pv
    for (let m = 1; m <= maxMonths; m++) {
        accumulated = accumulated * (1 + monthlyRate) + pmt
        if (accumulated >= target) return m
    }
    return null
}

export function usePlanning(inputs: PlanningInputs): PlanningResult {
    const {
        targetAmount,
        initialAmount,
        monthlyContribution,
        annualInterestRate,
        annualInflationRate,
        years,
    } = inputs

    const months = years * 12
    const monthlyRate = Math.pow(1 + annualInterestRate / 100, 1 / 12) - 1

    const futureValueNominal = calcFutureValue(
        initialAmount,
        monthlyContribution,
        monthlyRate,
        months
    )

    const futureValueReal =
        futureValueNominal / Math.pow(1 + annualInflationRate / 100, years)

    const totalContributed = initialAmount + monthlyContribution * months
    const totalInterestEarned = futureValueNominal - totalContributed

    const monthsToReachTarget =
        targetAmount > 0
            ? calcMonthsToTarget(targetAmount, initialAmount, monthlyContribution, monthlyRate)
            : null

    const monthlyInflationRate = Math.pow(1 + annualInflationRate / 100, 1 / 12) - 1

    const monthlyData: MonthlyDataPoint[] = []
    let accumulated = initialAmount
    let accumulatedReal = initialAmount

    for (let m = 1; m <= months; m++) {
        accumulated = accumulated * (1 + monthlyRate) + monthlyContribution
        accumulatedReal = accumulatedReal * (1 + monthlyRate) + monthlyContribution
        const deflator = Math.pow(1 + monthlyInflationRate, m)
        monthlyData.push({
            month: m,
            nominal: Math.round(accumulated),
            real: Math.round(accumulatedReal / deflator),
            contributed: Math.round(initialAmount + monthlyContribution * m),
        })
    }

    return {
        futureValueNominal,
        futureValueReal,
        totalContributed,
        totalInterestEarned,
        monthsToReachTarget,
        monthlyData,
    }
}

export function calcScenarios(inputs: PlanningInputs): ScenarioResult[] {
    const multipliers = [0.5, 1, 1.5]
    const labels = ['Conservador (−50%)', 'Base', 'Otimista (+50%)']

    return multipliers.map((mult, i) => {
        const pmt = Math.max(0, inputs.monthlyContribution * mult)
        const result = usePlanning({ ...inputs, monthlyContribution: pmt })
        return {
            label: labels[i],
            monthlyContribution: pmt,
            futureValueNominal: result.futureValueNominal,
            futureValueReal: result.futureValueReal,
            totalContributed: result.totalContributed,
            totalInterestEarned: result.totalInterestEarned,
            monthsToReachTarget: result.monthsToReachTarget,
        }
    })
}
