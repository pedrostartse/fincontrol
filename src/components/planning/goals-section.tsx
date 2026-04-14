import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import type { Database } from "@/types/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { GoalDialog } from "@/components/goals/goal-dialog"
import { UpdateGoalDialog } from "@/components/goals/update-goal-dialog"
import { useGoals } from "@/hooks/useGoals"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Target, Calendar as CalendarIcon, TrendingUp, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"

type Goal = Database['public']['Tables']['goals']['Row']

const brl = (v: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v)

interface GoalsSectionProps {
    refreshKey?: number
}

export function GoalsSection({ refreshKey }: GoalsSectionProps) {
    const [goals, setGoals] = useState<Goal[]>([])
    const [loading, setLoading] = useState(true)
    const { deleteGoal } = useGoals()

    const fetchGoals = async () => {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from("goals")
                .select("*")
                .order("created_at", { ascending: false })
            if (error) throw error
            if (data) setGoals(data)
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchGoals()
    }, [refreshKey])

    const handleDelete = async (id: string) => {
        await deleteGoal(id)
        fetchGoals()
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                        <Target className="h-5 w-5 text-primary" />
                        Metas salvas
                    </h2>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        Acompanhe o progresso real das suas simulações salvas.
                    </p>
                </div>
                <GoalDialog onGoalAdded={fetchGoals} />
            </div>

            {loading ? (
                <p className="text-sm text-muted-foreground">Carregando metas...</p>
            ) : goals.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-10 text-center animate-in zoom-in-50 duration-500">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                        <Target className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="mt-4 text-base font-semibold">Nenhuma meta ainda</h3>
                    <p className="mb-4 text-sm text-muted-foreground max-w-xs">
                        Salve uma simulação acima ou crie uma meta manualmente para começar a acompanhar.
                    </p>
                    <GoalDialog onGoalAdded={fetchGoals} />
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {goals.map((goal) => {
                        const progress = Math.min(
                            100,
                            Math.round(((goal.current_amount || 0) / goal.target_amount) * 100)
                        )

                        return (
                            <Card key={goal.id} className="transition-all hover:shadow-md">
                                <CardHeader className="pb-2">
                                    <CardTitle className="flex items-center justify-between text-base">
                                        <span className="truncate pr-2">{goal.name}</span>
                                        <div className="flex items-center gap-1 shrink-0">
                                            <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                                                {progress}%
                                            </span>
                                            <UpdateGoalDialog goal={goal} onUpdate={fetchGoals} />
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                                onClick={() => handleDelete(goal.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        <div className="flex items-end justify-between text-sm">
                                            <span className="text-muted-foreground">Progresso</span>
                                            <span className="font-medium">
                                                {brl(goal.current_amount || 0)}
                                                <span className="text-muted-foreground mx-1">/</span>
                                                {brl(goal.target_amount)}
                                            </span>
                                        </div>

                                        <Progress value={progress} className="h-2" />

                                        {goal.deadline ? (
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
                                                <CalendarIcon className="h-3 w-3" />
                                                <span>
                                                    Alvo:{" "}
                                                    {format(new Date(goal.deadline), "dd 'de' MMM, yyyy", {
                                                        locale: ptBR,
                                                    })}
                                                </span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
                                                <TrendingUp className="h-3 w-3" />
                                                <span>Sem prazo definido</span>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
