"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { Save } from "lucide-react"
import { settingsService } from "@/services/settingsService"

type Setting = {
  key: string
  value: string
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({
    prix_livraison: "5.00",
    free_shipping_threshold: "50000",
    express_delivery_fee: "10.00",
    site_name: "Chez Flora",
    admin_email: "admin@chezflora.com",
    currency: "XAF",
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true)
        const response = await settingsService.getAllSettings()
        if (response.success && response.data) {
          setSettings((prev) => ({
            ...prev,
            ...response.data,
          }))
        }
      } catch (error) {
        console.error("Error fetching settings:", error)
        toast({
          title: "Error",
          description: "Failed to load settings. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchSettings()
  }, [toast])

  const handleSaveSettings = async () => {
    try {
      setSaving(true)
      const response = await settingsService.updateMultipleSettings(settings)

      if (response.success) {
        toast({
          title: "Settings saved",
          description: "Your settings have been saved successfully.",
        })
      } else {
        throw new Error(response.message || "Failed to save settings")
      }
    } catch (error) {
      console.error("Error saving settings:", error)
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const updateSetting = (key: string, value: string) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your site settings</p>
      </div>

      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="shipping">Shipping</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Manage general site settings.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="site_name">Site Name</Label>
                <Input
                  id="site_name"
                  value={settings.site_name || "Chez Flora"}
                  onChange={(e) => updateSetting("site_name", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="admin_email">Admin Email</Label>
                <Input
                  id="admin_email"
                  type="email"
                  value={settings.admin_email || "admin@chezflora.com"}
                  onChange={(e) => updateSetting("admin_email", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Input
                  id="currency"
                  value={settings.currency || "XAF"}
                  onChange={(e) => updateSetting("currency", e.target.value)}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveSettings} disabled={saving}>
                {saving ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="shipping" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Shipping Settings</CardTitle>
              <CardDescription>Configure shipping options and pricing.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="prix_livraison">Delivery Price (XAF)</Label>
                <Input
                  id="prix_livraison"
                  type="number"
                  value={settings.prix_livraison || "5.00"}
                  onChange={(e) => updateSetting("prix_livraison", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="free_shipping_threshold">Free Shipping Threshold (XAF)</Label>
                <Input
                  id="free_shipping_threshold"
                  type="number"
                  value={settings.free_shipping_threshold || "50000"}
                  onChange={(e) => updateSetting("free_shipping_threshold", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="express_delivery_fee">Express Delivery Fee (XAF)</Label>
                <Input
                  id="express_delivery_fee"
                  type="number"
                  value={settings.express_delivery_fee || "10.00"}
                  onChange={(e) => updateSetting("express_delivery_fee", e.target.value)}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveSettings} disabled={saving}>
                {saving ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

