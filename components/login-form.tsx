"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Flower } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { loginAdmin, setAuthToken } from "@/services/adminApi"

export default function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await loginAdmin(email, password)
      
      // Stocker le token dans le localStorage
      setAuthToken(response.token)
      
      // Stocker le rôle dans le localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("role", response.user.role)
      }

      toast({
        title: "Connexion réussie",
        description: `Bienvenue ${response.user.first_name} ${response.user.last_name}`,
      })

      // Rediriger vers le tableau de bord
      router.push("/dashboard")
    } catch (error: any) {
      toast({
        title: "Échec de la connexion",
        description: error.message || "Identifiants incorrects",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md shadow-lg">
      <CardHeader className="space-y-1 text-center">
        <div className="flex justify-center mb-2">
          <Flower className="h-12 w-12 text-green-600" />
        </div>
        <CardTitle className="text-2xl font-bold">Chez Flora Admin</CardTitle>
        <CardDescription>Connectez-vous pour accéder au panneau d'administration</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="admin@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Mot de passe</Label>
              <a href="#" className="text-sm text-green-600 hover:text-green-700">
                Mot de passe oublié?
              </a>
            </div>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        </form>
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full bg-green-600 hover:bg-green-700" 
          onClick={handleSubmit} 
          disabled={isLoading}
        >
          {isLoading ? "Connexion en cours..." : "Connexion"}
        </Button>
      </CardFooter>
    </Card>
  )
}
