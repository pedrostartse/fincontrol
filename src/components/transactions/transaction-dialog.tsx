import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { useTransactions } from "@/hooks/useTransactions"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    AnimatedDialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select"
import { PlusCircle } from "lucide-react"

type Category = {
    id: string
    name: string
    type: 'income' | 'expense'
}

export type TransactionFormData = {
    id?: string
    description: string
    amount: string | number
    type: 'income' | 'expense'
    category_id: string | null
    date: string
    payment_method: 'debit' | 'credit'
}

export function TransactionDialog({
    initialData,
    onSuccess,
    trigger
}: {
    initialData?: TransactionFormData
    onSuccess?: () => void
    trigger?: React.ReactNode
}) {
    const [open, setOpen] = useState(false)
    const { addTransaction, updateTransaction, loading } = useTransactions()
    const [categories, setCategories] = useState<Category[]>([])
    const [fetchingCategories, setFetchingCategories] = useState(false)

    const [formData, setFormData] = useState<TransactionFormData>(initialData || {
        description: "",
        amount: "",
        type: "expense",
        category_id: "",
        date: new Date().toLocaleDateString('en-CA'), // YYYY-MM-DD local format
        payment_method: "debit"
    })

    const isEditing = !!initialData?.id

    useEffect(() => {
        if (open) {
            fetchCategories()
            if (initialData) {
                setFormData(initialData)
            }
        }
    }, [open, initialData])

    const fetchCategories = async () => {
        try {
            setFetchingCategories(true)
            const { data, error } = await supabase
                .from('categories')
                .select('id, name, type')
                .order('name')

            if (error) throw error
            if (data) {
                const seen = new Set<string>()
                const unique = data.filter(cat => {
                    const key = `${cat.name}-${cat.type}`
                    if (seen.has(key)) return false
                    seen.add(key)
                    return true
                })
                setCategories(unique)
            }
        } catch (error) {
            console.error("Error fetching categories:", error)
        } finally {
            setFetchingCategories(false)
        }
    }

    // Filter categories based on transaction type
    const filteredCategories = categories.filter(c => c.type === formData.type)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        let success = false
        if (isEditing && initialData.id) {
            success = await updateTransaction(initialData.id, {
                description: formData.description,
                amount: Number(formData.amount),
                type: formData.type,
                date: formData.date,
                payment_method: formData.payment_method,
                category_id: formData.category_id || null,
            })
        } else {
            success = await addTransaction({
                description: formData.description,
                amount: Number(formData.amount),
                type: formData.type,
                date: formData.date,
                payment_method: formData.payment_method,
                category_id: formData.category_id || null,
            })
        }

        if (success) {
            setOpen(false)
            if (!isEditing) {
                setFormData({
                    description: "",
                    amount: "",
                    type: "expense",
                    category_id: "",
                    date: new Date().toLocaleDateString('en-CA'),
                    payment_method: "debit"
                })
            }
            if (onSuccess) {
                onSuccess()
            } else {
                window.location.reload()
            }
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button className="gap-2 transition-transform duration-150 hover:scale-[1.04] active:scale-[0.94]">
                        <motion.span
                            animate={{ rotate: open ? 45 : 0 }}
                            transition={{ type: "spring", stiffness: 350, damping: 20 }}
                            className="inline-flex"
                        >
                            <PlusCircle className="h-4 w-4" />
                        </motion.span>
                        Nova Transação
                    </Button>
                )}
            </DialogTrigger>
            <AnimatedDialogContent open={open} className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{isEditing ? "Editar Transação" : "Nova Transação"}</DialogTitle>
                    <DialogDescription>
                        {isEditing ? "Altere os detalhes da sua movimentação." : "Adicione uma receita ou despesa ao seu controle."}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="type">Tipo</Label>
                            <Select
                                value={formData.type}
                                onValueChange={(val: "income" | "expense") => setFormData({ ...formData, type: val, category_id: "" })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Tipo" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="income">Receita</SelectItem>
                                    <SelectItem value="expense">Despesa</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="category">Categoria</Label>
                            <Select
                                value={formData.category_id ?? undefined}
                                onValueChange={(val) => setFormData({ ...formData, category_id: val })}
                                disabled={fetchingCategories}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder={fetchingCategories ? "Carregando..." : "Selecione"} />
                                </SelectTrigger>
                                <SelectContent>
                                    {filteredCategories.length === 0 && !fetchingCategories ? (
                                        <div className="p-2 text-xs text-muted-foreground text-center italic">
                                            Nenhuma categoria encontrada
                                        </div>
                                    ) : (
                                        filteredCategories.map((cat) => (
                                            <SelectItem key={cat.id} value={cat.id}>
                                                {cat.name}
                                            </SelectItem>
                                        ))
                                    )}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="description">Descrição</Label>
                        <Input
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Ex: Supermercado"
                            required
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="amount">Valor (R$)</Label>
                        <Input
                            id="amount"
                            type="number"
                            step="0.01"
                            value={formData.amount}
                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                            placeholder="0,00"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="date">Data</Label>
                            <Input
                                id="date"
                                type="date"
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                required
                            />
                        </div>

                        {formData.type === 'expense' && (
                            <div className="grid gap-2">
                                <Label htmlFor="payment_method">Forma de Pagamento</Label>
                                <Select
                                    value={formData.payment_method}
                                    onValueChange={(val: "debit" | "credit") => setFormData({ ...formData, payment_method: val })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="debit">Débito / PIX</SelectItem>
                                        <SelectItem value="credit">Cartão de Crédito</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </div>

                    <Button type="submit" disabled={loading} className="w-full">
                        {loading ? "Salvando..." : (isEditing ? "Atualizar" : "Salvar Transação")}
                    </Button>
                </form>
            </AnimatedDialogContent>
        </Dialog>
    )
}
