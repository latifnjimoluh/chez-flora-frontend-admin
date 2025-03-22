"use client"

import { useState } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, Plus, ArrowUp, ArrowDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/data-table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"

type FAQ = {
  id: number
  question: string
  answer: string
  category: string
  display_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

const initialFAQs: FAQ[] = [
  {
    id: 1,
    question: "Quels sont vos délais de livraison ?",
    answer:
      "Nous livrons à Paris et sa banlieue le jour même pour toute commande passée avant 14h. Pour les autres régions, le délai est généralement de 24 à 48h.",
    category: "livraison",
    display_order: 1,
    is_active: true,
    created_at: "2025-03-18 02:29:03",
    updated_at: "2025-03-18 02:29:03",
  },
  {
    id: 2,
    question: "Comment puis-je suivre ma commande ?",
    answer:
      "Vous recevrez un email de confirmation avec un numéro de suivi dès que votre commande sera expédiée. Vous pouvez également suivre votre commande dans votre espace client.",
    category: "commande",
    display_order: 2,
    is_active: true,
    created_at: "2025-03-18 02:29:03",
    updated_at: "2025-03-18 02:29:03",
  },
  {
    id: 3,
    question: "Puis-je modifier ou annuler ma commande ?",
    answer:
      "Vous pouvez modifier ou annuler votre commande jusqu'à 24h avant la date de livraison prévue. Contactez-nous par téléphone ou par email pour toute modification.",
    category: "commande",
    display_order: 3,
    is_active: true,
    created_at: "2025-03-18 02:29:03",
    updated_at: "2025-03-18 02:29:03",
  },
  {
    id: 4,
    question: "Proposez-vous des services pour les entreprises ?",
    answer:
      "Oui, nous proposons des services d'abonnement floral et de décoration pour les entreprises. Contactez-nous pour obtenir un devis personnalisé.",
    category: "services",
    display_order: 4,
    is_active: true,
    created_at: "2025-03-18 02:29:03",
    updated_at: "2025-03-18 02:29:03",
  },
  {
    id: 9,
    question: "Comment entretenir mon bouquet ?",
    answer:
      "Pour prolonger la durée de vie de votre bouquet, changez l'eau tous les deux jours, coupez les tiges en biseau et gardez-le à l'abri du soleil direct et des courants d'air.",
    category: "entretien",
    display_order: 5,
    is_active: true,
    created_at: "2025-03-18 02:55:32",
    updated_at: "2025-03-18 02:55:32",
  },
  {
    id: 10,
    question: "Proposez-vous des ateliers floraux ?",
    answer:
      "Oui, nous organisons régulièrement des ateliers floraux pour apprendre à créer vos propres compositions. Consultez notre calendrier d'événements pour connaître les prochaines dates.",
    category: "services",
    display_order: 6,
    is_active: true,
    created_at: "2025-03-18 02:55:32",
    updated_at: "2025-03-18 02:55:32",
  },
  {
    id: 11,
    question: "Quelles méthodes de paiement acceptez-vous ?",
    answer:
      "Nous acceptons les cartes de crédit (Visa, Mastercard), PayPal, et les virements bancaires pour les commandes importantes.",
    category: "paiement",
    display_order: 7,
    is_active: true,
    created_at: "2025-03-18 02:55:32",
    updated_at: "2025-03-18 02:55:32",
  },
  {
    id: 12,
    question: "Puis-je personnaliser ma commande ?",
    answer:
      "Absolument ! Nous pouvons personnaliser votre bouquet selon vos préférences de couleurs, de fleurs et de style. N'hésitez pas à nous contacter pour discuter de vos besoins spécifiques.",
    category: "commande",
    display_order: 8,
    is_active: true,
    created_at: "2025-03-18 02:55:32",
    updated_at: "2025-03-18 02:55:32",
  },
]

const categories = [
  { value: "general", label: "Général" },
  { value: "livraison", label: "Livraison" },
  { value: "commande", label: "Commande" },
  { value: "services", label: "Services" },
  { value: "entretien", label: "Entretien" },
  { value: "paiement", label: "Paiement" },
]

export default function FAQsPage() {
  const [faqs, setFaqs] = useState<FAQ[]>(initialFAQs)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [currentFAQ, setCurrentFAQ] = useState<FAQ | null>(null)
  const [newFAQ, setNewFAQ] = useState<Partial<FAQ>>({
    question: "",
    answer: "",
    category: "general",
    display_order: 0,
    is_active: true,
  })
  const { toast } = useToast()

  const handleAddFAQ = () => {
    const id = Math.max(...faqs.map((faq) => faq.id)) + 1
    const now = new Date().toISOString().replace("T", " ").substring(0, 19)

    const faq: FAQ = {
      id,
      question: newFAQ.question || "",
      answer: newFAQ.answer || "",
      category: newFAQ.category || "general",
      display_order: newFAQ.display_order || faqs.length + 1,
      is_active: newFAQ.is_active !== undefined ? newFAQ.is_active : true,
      created_at: now,
      updated_at: now,
    }

    setFaqs([...faqs, faq])
    setNewFAQ({
      question: "",
      answer: "",
      category: "general",
      display_order: 0,
      is_active: true,
    })
    setIsAddDialogOpen(false)

    toast({
      title: "FAQ added",
      description: "The FAQ has been added successfully.",
    })
  }

  const handleEditFAQ = () => {
    if (!currentFAQ) return

    const now = new Date().toISOString().replace("T", " ").substring(0, 19)
    const updatedFAQ = {
      ...currentFAQ,
      updated_at: now,
    }

    setFaqs(faqs.map((faq) => (faq.id === currentFAQ.id ? updatedFAQ : faq)))
    setIsEditDialogOpen(false)

    toast({
      title: "FAQ updated",
      description: "The FAQ has been updated successfully.",
    })
  }

  const handleDeleteFAQ = () => {
    if (!currentFAQ) return

    setFaqs(faqs.filter((faq) => faq.id !== currentFAQ.id))
    setIsDeleteDialogOpen(false)

    toast({
      title: "FAQ deleted",
      description: "The FAQ has been deleted successfully.",
    })
  }

  const moveOrder = (id: number, direction: "up" | "down") => {
    const faqIndex = faqs.findIndex((faq) => faq.id === id)
    if (faqIndex === -1) return

    const newFaqs = [...faqs]

    if (direction === "up" && faqIndex > 0) {
      // Swap with the previous item
      const temp = newFaqs[faqIndex].display_order
      newFaqs[faqIndex].display_order = newFaqs[faqIndex - 1].display_order
      newFaqs[faqIndex - 1].display_order = temp

      // Also swap the items in the array for immediate visual feedback
      ;[newFaqs[faqIndex], newFaqs[faqIndex - 1]] = [newFaqs[faqIndex - 1], newFaqs[faqIndex]]
    } else if (direction === "down" && faqIndex < newFaqs.length - 1) {
      // Swap with the next item
      const temp = newFaqs[faqIndex].display_order
      newFaqs[faqIndex].display_order = newFaqs[faqIndex + 1].display_order
      newFaqs[faqIndex + 1].display_order = temp

      // Also swap the items in the array for immediate visual feedback
      ;[newFaqs[faqIndex], newFaqs[faqIndex + 1]] = [newFaqs[faqIndex + 1], newFaqs[faqIndex]]
    }

    setFaqs(newFaqs)

    toast({
      title: "Order updated",
      description: `FAQ moved ${direction}.`,
    })
  }

  const toggleActive = (id: number) => {
    setFaqs(faqs.map((faq) => (faq.id === id ? { ...faq, is_active: !faq.is_active } : faq)))

    const faq = faqs.find((f) => f.id === id)
    if (faq) {
      toast({
        title: faq.is_active ? "FAQ deactivated" : "FAQ activated",
        description: `The FAQ has been ${faq.is_active ? "deactivated" : "activated"}.`,
      })
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "livraison":
        return "bg-blue-100 text-blue-800"
      case "commande":
        return "bg-green-100 text-green-800"
      case "services":
        return "bg-purple-100 text-purple-800"
      case "entretien":
        return "bg-amber-100 text-amber-800"
      case "paiement":
        return "bg-pink-100 text-pink-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const columns: ColumnDef<FAQ>[] = [
    {
      accessorKey: "display_order",
      header: "Order",
      cell: ({ row }) => {
        const order = Number.parseInt(row.getValue("display_order"))
        const id = row.original.id

        return (
          <div className="flex items-center space-x-2">
            <span>{order}</span>
            <div className="flex flex-col">
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5"
                onClick={() => moveOrder(id, "up")}
                disabled={order === 1}
              >
                <ArrowUp className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5"
                onClick={() => moveOrder(id, "down")}
                disabled={order === faqs.length}
              >
                <ArrowDown className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "question",
      header: "Question",
      cell: ({ row }) => {
        const question = row.getValue("question") as string
        return <div className="max-w-md truncate font-medium">{question}</div>
      },
    },
    {
      accessorKey: "answer",
      header: "Answer",
      cell: ({ row }) => {
        const answer = row.getValue("answer") as string
        return <div className="max-w-md truncate">{answer}</div>
      },
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => {
        const category = row.getValue("category") as string
        return (
          <Badge className={getCategoryColor(category)}>{category.charAt(0).toUpperCase() + category.slice(1)}</Badge>
        )
      },
    },
    {
      accessorKey: "is_active",
      header: "Status",
      cell: ({ row }) => {
        const isActive = row.getValue("is_active") as boolean
        return <Badge variant={isActive ? "default" : "outline"}>{isActive ? "Active" : "Inactive"}</Badge>
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const faq = row.original

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  setCurrentFAQ(faq)
                  setIsEditDialogOpen(true)
                }}
              >
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => toggleActive(faq.id)}>
                {faq.is_active ? "Deactivate" : "Activate"}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setCurrentFAQ(faq)
                  setIsDeleteDialogOpen(true)
                }}
                className="text-red-600"
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">FAQs</h1>
          <p className="text-muted-foreground">Manage frequently asked questions</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add FAQ
        </Button>
      </div>

      <DataTable columns={columns} data={faqs} searchColumn="question" searchPlaceholder="Search by question..." />

      {/* Add FAQ Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add New FAQ</DialogTitle>
            <DialogDescription>Create a new frequently asked question. Click save when you're done.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="question">Question</Label>
              <Input
                id="question"
                value={newFAQ.question}
                onChange={(e) => setNewFAQ({ ...newFAQ, question: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="answer">Answer</Label>
              <Textarea
                id="answer"
                value={newFAQ.answer}
                onChange={(e) => setNewFAQ({ ...newFAQ, answer: e.target.value })}
                className="min-h-[100px]"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={newFAQ.category} onValueChange={(value) => setNewFAQ({ ...newFAQ, category: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="display_order">Display Order</Label>
                <Input
                  id="display_order"
                  type="number"
                  value={newFAQ.display_order || faqs.length + 1}
                  onChange={(e) => setNewFAQ({ ...newFAQ, display_order: Number.parseInt(e.target.value) })}
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_active"
                checked={newFAQ.is_active}
                onCheckedChange={(checked) => setNewFAQ({ ...newFAQ, is_active: checked as boolean })}
              />
              <Label htmlFor="is_active">Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddFAQ}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit FAQ Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit FAQ</DialogTitle>
            <DialogDescription>Update FAQ information. Click save when you're done.</DialogDescription>
          </DialogHeader>
          {currentFAQ && (
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit_question">Question</Label>
                <Input
                  id="edit_question"
                  value={currentFAQ.question}
                  onChange={(e) => setCurrentFAQ({ ...currentFAQ, question: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_answer">Answer</Label>
                <Textarea
                  id="edit_answer"
                  value={currentFAQ.answer}
                  onChange={(e) => setCurrentFAQ({ ...currentFAQ, answer: e.target.value })}
                  className="min-h-[100px]"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit_category">Category</Label>
                  <Select
                    value={currentFAQ.category}
                    onValueChange={(value) => setCurrentFAQ({ ...currentFAQ, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_display_order">Display Order</Label>
                  <Input
                    id="edit_display_order"
                    type="number"
                    value={currentFAQ.display_order}
                    onChange={(e) => setCurrentFAQ({ ...currentFAQ, display_order: Number.parseInt(e.target.value) })}
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="edit_is_active"
                  checked={currentFAQ.is_active}
                  onCheckedChange={(checked) => setCurrentFAQ({ ...currentFAQ, is_active: checked as boolean })}
                />
                <Label htmlFor="edit_is_active">Active</Label>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditFAQ}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete FAQ Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete FAQ</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this FAQ? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {currentFAQ && (
            <div className="py-4">
              <p>You are about to delete the following FAQ:</p>
              <p className="mt-2 font-medium">{currentFAQ.question}</p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteFAQ}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

