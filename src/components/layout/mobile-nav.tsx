import { Link, useLocation } from "react-router-dom"
import { LayoutDashboard, Wallet, Plus, CalendarDays, TrendingUp, User, MapPin } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { TransactionDialog } from "../transactions/transaction-dialog"
import { ProfileDialog } from "./profile-dialog"

const navItemsStart = [
    { name: "Home", href: "/", icon: LayoutDashboard },
    { name: "Transações", href: "/transactions", icon: Wallet },
    { name: "Invest", href: "/investments", icon: TrendingUp },
]

const navItemsEnd = [
    { name: "Assinaturas", href: "/subscriptions", icon: CalendarDays },
    { name: "Planejar", href: "/planning", icon: MapPin },
]

export function MobileNav() {
    const location = useLocation()

    const NavLink = ({ item }: { item: typeof navItemsStart[0] }) => {
        const isActive = location.pathname === item.href
        return (
            <Link to={item.href} className="flex flex-col items-center gap-1 relative min-w-0 flex-1">
                <div
                    className={cn(
                        "rounded-full p-2 transition-colors",
                        isActive ? "text-primary" : "text-muted-foreground"
                    )}
                >
                    <item.icon className="h-5 w-5" />
                    {isActive && (
                        <motion.div
                            layoutId="mobile-nav-indicator"
                            className="absolute bottom-[-2px] left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-primary"
                        />
                    )}
                </div>
            </Link>
        )
    }

    return (
        <div className="fixed bottom-0 left-0 right-0 border-t bg-card/80 backdrop-blur-xl px-2 py-3 pb-6 md:hidden z-50">
            <div className="flex items-center justify-between relative max-w-lg mx-auto w-full px-1">
                <div className="flex flex-1 justify-around">
                    {navItemsStart.map((item) => (
                        <NavLink key={item.href} item={item} />
                    ))}
                </div>

                <div className="flex justify-center relative scale-110 -top-5 mx-4">
                    <TransactionDialog
                        trigger={
                            <button
                                className="rounded-full bg-primary p-3.5 text-primary-foreground shadow-2xl transition-all active:scale-95 hover:shadow-primary/40 ring-4 ring-background"
                                aria-label="Nova Transação"
                            >
                                <Plus className="h-6 w-6" />
                            </button>
                        }
                    />
                </div>

                <div className="flex flex-1 justify-around items-center">
                    {navItemsEnd.map((item) => (
                        <NavLink key={item.href} item={item} />
                    ))}

                    <ProfileDialog
                        showLogout
                        trigger={
                            <button className="flex flex-col items-center gap-1 p-2 text-muted-foreground hover:text-primary transition-colors flex-1">
                                <User className="h-5 w-5" />
                            </button>
                        }
                    />
                </div>
            </div>
        </div>
    )
}
