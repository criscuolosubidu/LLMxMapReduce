"use client"

import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"
import { UserNav } from "@/components/user-nav"
import { useAuth } from "@/contexts/auth-context"

interface HeaderProps {
  showUserNav?: boolean
}

export function Header({ showUserNav = true }: HeaderProps) {
  const { token, isLoading } = useAuth()
  
  // 如果showUserNav为false，强制显示登录链接
  // 如果showUserNav为true，根据用户登录状态决定显示什么
  const shouldShowUserNav = showUserNav && !isLoading && token

  return (
    <header className="border-b">
      <div className="container flex h-16 items-center justify-between max-w-6xl mx-auto px-4">
        <Link href="/" className="text-2xl font-bold">
          MedResearch
        </Link>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          {shouldShowUserNav ? (
            <UserNav />
          ) : (
            <nav className="flex items-center gap-6">
              <Link href="/login" className="text-sm font-medium hover:underline">
                登录 / 注册
              </Link>
            </nav>
          )}
        </div>
      </div>
    </header>
  )
}