"use client"

import { useState } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal, Eye } from "lucide-react"
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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type Subscription = {
  id_abonnement: number
  id_client: number
  type_abonnement: string
  frequence: string
  adresse_livraison: string | null
  disponibilites: string | null
  dates_ateliers: string | null
  date_souscription: string
  date_echeance: string | null
  statut: "abonné" | "résilié" | "suspendu"
  client_name?: string
}

const initialSubscriptions: Subscription[] = [
  {
    id_abonnement: 9,
    id_client: 1,
    type_abonnement: "Ateliers Floraux",
    frequence: "Trimestriel",
    adresse_livraison: "Adresse de livraison 1, Ville 1",
    disponibilites: null,
    dates_ateliers: "Chaque samedi matin",
    date_souscription: "2024-04-26 15:32:05",
    date_echeance: "2025-12-03 22:44:31",
    statut: "abonné",
    client_name: "Sophie Martin",
  },
  {
    id_abonnement: 10,
    id_client: 6,
    type_abonnement: "Conseil en Décoration",
    frequence: "Hebdomadaire",
    adresse_livraison: "Adresse de livraison 2, Ville 2",
    disponibilites: "Lundi et Mercredi après-midi",
    dates_ateliers: null,
    date_souscription: "2024-10-10 22:20:39",
    date_echeance: "2025-12-04 21:23:17",
    statut: "résilié",
    client_name: "Thomas Dubois",
  },
  {
    id_abonnement: 11,
    id_client: 4,
    type_abonnement: "Conseil en Décoration",
    frequence: "Trimestriel",
    adresse_livraison: "Adresse de livraison 3, Ville 3",
    disponibilites: "Lundi et Mercredi après-midi",
    dates_ateliers: null,
    date_souscription: "2024-11-26 22:50:37",
    date_echeance: "2025-09-03 05:40:52",
    statut: "abonné",
    client_name: "Marie Leroy",
  },
  {
    id_abonnement: 12,
    id_client: 8,
    type_abonnement: "Floral",
    frequence: "Hebdomadaire",
    adresse_livraison: "Adresse de livraison 4, Ville 4",
    disponibilites: null,
    dates_ateliers: null,
    date_souscription: "2024-10-03 01:15:16",
    date_echeance: "2025-08-16 08:52:57",
    statut: "suspendu",
    client_name: "Jean Dupont",
  },
  {
    id_abonnement: 13,
    id_client: 15,
    type_abonnement: "Ateliers Floraux",
    frequence: "Trimestriel",
    adresse_livraison: "Adresse de livraison 5, Ville 5",
    disponibilites: null,
    dates_ateliers: "Chaque samedi matin",
    date_souscription: "2024-04-04 18:03:05",
    date_echeance: "2025-06-28 12:48:09",
    statut: "abonné",
    client_name: "Camille Petit",
  },
]

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(initialSubscriptions);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditStatusDialogOpen, setIsEditStatusDialogOpen] = useState(false);
  const [currentSubscription, setCurrentSubscription] = useState<Subscription | null>(null);
  const { toast } = useToast();

  const handleUpdateStatus = () => {
    if (!currentSubscription) return;
    
    setSubscriptions(
      subscriptions.map((subscription) => (subscription.id_abonnement === currentSubscription.id_abonnement ? currentSubscription : subscription))
    );
    setIsEditStatusDialogOpen(false);
    
    toast({
      title: "Subscription status updated",
      description: `Subscription status has been updated to ${currentSubscription.statut}.`,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "abonné":
        return "bg-green-100 text-green-800";
      case "résilié":
        return "bg-red-100 text-red-800";
      case "suspendu":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Floral":
        return "bg-pink-100 text-pink-800";
      case "Conseil en Décoration":
        return "bg-purple-100 text-purple-800";
      case "Ateliers Floraux":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const columns: ColumnDef<Subscription>[] = [
    {
      accessorKey: "id_abonnement",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          ID
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
    },
    {
      accessorKey: "client_name",
      header: "Client",
    },
    {
      accessorKey: "type_abonnement",
      header: "Type",
      cell: ({ row }) => {
        const type = row.getValue("type_abonnement") as string;
        return (
          <Badge className={getTypeColor(type)}>
            {type}
          </Badge>
        );
      },
    },
    {
      accessorKey: "frequence",
      header: "Frequency",
    },
    {
      accessorKey: "date_souscription",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Start Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const date = row.getValue("date_souscription") as string;
        return <div>{format(new Date(date), "PPP")}</div>;
      },
    },
    {
      accessorKey: "date_echeance",
      header: "End Date",
      cell: ({ row }) => {
        const date = row.getValue("date_echeance") as string | null;
        return <div>{date ? format(new Date(date), "PPP") : "-"}</div>;
      },
    },
    {
      accessorKey: "statut",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("statut") as string;
        return (
          <Badge className={getStatusColor(status)}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const subscription = row.original;
        
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
                  setCurrentSubscription(subscription);
                  setIsViewDialogOpen(true);
                }}
              >
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setCurrentSubscription(subscription);
                  setIsEditStatusDialogOpen(true);
                }}
              >
                Update Status
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Subscriptions</h1>
        <p className="text-muted-foreground">Manage customer subscriptions</p>
      </div>

      <div className="flex items-center space-x-4 bg-muted/50 p-4 rounded-lg">
        <div className="flex items-center space-x-2">
          <Badge className="bg-green-100 text-green-800">Active</Badge>
          <span className="text-sm font-medium">{subscriptions.filter(s => s.statut === "abonné").length}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Badge className="bg-yellow-100 text-yellow-800">Suspended</Badge>
          <span className="text-sm font-medium">{subscriptions.filter(s => s.statut === "suspendu").length}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Badge className="bg-red-100 text-red-800">Cancelled</Badge>
          <span className="text-sm font-medium">{subscriptions.filter(s => s.statut === "résilié").length}</span>
        </div>
      </div>

      <DataTable 
        columns={columns} 
        data={subscriptions} 
        searchColumn="client_name"
        searchPlaceholder="Search by client name..."
      />

      {/* View Subscription Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Subscription Details</DialogTitle>
            <DialogDescription>
              Subscription #{currentSubscription?.id_abonnement}
            </DialogDescription>
          </DialogHeader>
          {currentSubscription && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Client Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>
                      <div className="font-medium">Name</div>
                      <div>{currentSubscription.client_name}</div>
                    </div>
                    <div>
                      <div className="font-medium">Client ID</div>
                      <div>{currentSubscription.id_client}</div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Subscription Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>
                      <div className="font-medium">Type</div>
                      <Badge className={getTypeColor(currentSubscription.type_abonnement)}>
                        {currentSubscription.type_abonnement}
                      </Badge>
                    </div>
                    <div>
                      <div className="font-medium">Frequency</div>
                      <div>{currentSubscription.frequence}</div>
                    </div>
                    <div>
                      <div className="font-medium">Status</div>
                      <Badge className={getStatusColor(currentSubscription.statut)}>
                        {currentSubscription.statut.charAt(0).toUpperCase() + currentSubscription.statut.slice(1)}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Subscription Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="font-medium">Start Date</div>
                      <div>{format(new Date(currentSubscription.date_souscription), "PPP")}</div>
                    </div>
                    <div>
                      <div className="font-medium">End Date</div>
                      <div>
                        {currentSubscription.date_echeance 
                          ? format(new Date(currentSubsc\

