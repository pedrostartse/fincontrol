import { Link, useLocation } from "react-router-dom"
import { LayoutDashboard, Wallet, PieChart, CalendarDays, TrendingUp, User, MapPin } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ProfileDialog } from "./profile-dialog"

const navItems = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Transações", href: "/transactions", icon: Wallet },
    { name: "Investimentos", href: "/investments", icon: TrendingUp },
    { name: "Assinaturas", href: "/subscriptions", icon: CalendarDays },
    { name: "Planejamento", href: "/planning", icon: MapPin },
]

export function Sidebar() {
    const location = useLocation()

    return (
        <div className="flex h-screen w-64 flex-col border-r border-white/5 bg-card/60 backdrop-blur-md py-6">
            <div className="flex items-center gap-2 px-6">
                <PieChart className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent">Velut Finance</span>
            </div>

            <div className="mt-10 flex-1 flex flex-col gap-2 px-3 overflow-y-auto">
                <nav className="space-y-2">
                    {navItems.map((item) => (
                        <Link to={item.href} key={item.href} className="block">
                            <Button
                                variant={location.pathname === item.href ? "secondary" : "ghost"}
                                className={cn("w-full justify-start gap-2 h-10 px-3",
                                    location.pathname === item.href && "bg-secondary"
                                )}
                            >
                                <item.icon className="h-4 w-4" />
                                {item.name}
                            </Button>
                        </Link>
                    ))}

                    <ProfileDialog
                        showLogout
                        trigger={
                            <Button
                                variant="ghost"
                                className="w-full justify-start gap-2 h-10 px-3 text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <User className="h-4 w-4" />
                                Minha Conta
                            </Button>
                        }
                    />
                </nav>
            </div>
        </div>
    )
}
