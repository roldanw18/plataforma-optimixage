"use client"

import { useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const [usuario, setUsuario] = useState("")
  const [contrasena, setContrasena] = useState("")
  const router = useRouter()

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    // Redirigir al dashboard
    router.push("/dashboard")
  }

  const handleAdmin = () => {
    // Redirigir al panel de administrador
    router.push("/dashboard")
  }

  return (
    <div className="relative min-h-screen bg-[#0a0a4e]">
      {/* Left side - Brand (background) */}
      <div className="hidden lg:flex absolute inset-0 lg:w-1/2 flex-col items-center justify-center">
        <div className="flex flex-col items-center">
          {/* Logo */}
          <Image
            src="/logo-optimixage.png"
            alt="Optimixage Logo"
            width={120}
            height={120}
            priority
            className="w-[480px] h-auto"
          />
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="absolute right-0 top-0 bottom-0 w-full lg:w-1/2 flex items-center justify-center bg-[#f5f5f5] px-8 rounded-l-[60px]">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex flex-col items-center mb-8">
            <Image
              src="/logo-optimixage.png"
              alt="Optimixage Logo"
              width={80}
              height={80}
              priority
              className="w-[80px] h-auto"
            />
          </div>

          {/* Welcome text */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-[#1a1a4e] mb-2">Bienvenido</h2>
            <p className="text-gray-500 text-sm">Inicia sesión para continuar</p>
          </div>

          {/* Login form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="text"
                placeholder="Usuario"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                className="w-full px-6 py-3 bg-[#d9d9d9] rounded-full text-center text-gray-600 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0099cc]"
              />
            </div>
            <div>
              <input
                type="password"
                placeholder="Contraseña"
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
                className="w-full px-6 py-3 bg-[#d9d9d9] rounded-full text-center text-gray-600 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0099cc]"
              />
            </div>

            {/* Forgot password */}
            <div className="text-center py-2">
              <a href="#" className="text-gray-600 text-sm hover:text-gray-800">
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            {/* Buttons */}
            <div className="flex justify-center gap-4 pt-2">
              <button
                type="submit"
                className="px-8 py-2 bg-[#0099cc] text-white rounded-md font-medium hover:bg-[#007aa3] transition-colors"
              >
                Iniciar sesión
              </button>
              <button
                type="button"
                onClick={handleAdmin}
                className="px-8 py-2 bg-[#0099cc] text-white rounded-md font-medium hover:bg-[#007aa3] transition-colors"
              >
                Administrador
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
