import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, ShoppingBag, Package, DollarSign, ArrowUpRight, ArrowDownRight } from "lucide-react"

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to your admin dashboard</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <span className="text-green-500 flex items-center mr-1">
                <ArrowUpRight className="w-3 h-3 mr-1" />
                20%
              </span>
              from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <span className="text-green-500 flex items-center mr-1">
                <ArrowUpRight className="w-3 h-3 mr-1" />
                5%
              </span>
              from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingBag className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <span className="text-red-500 flex items-center mr-1">
                <ArrowDownRight className="w-3 h-3 mr-1" />
                10%
              </span>
              from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">26,655.90XAF</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <span className="text-green-500 flex items-center mr-1">
                <ArrowUpRight className="w-3 h-3 mr-1" />
                15%
              </span>
              from last month
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Latest 5 orders placed on the platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  id: "544f0684-053f-11f0-9224-0250ca70a034",
                  client: "Nexus1 nexus",
                  total: "8,886.90XAF",
                  status: "en attente de livraison",
                },
                {
                  id: "cf0fb28b-0398-11f0-a6d9-0250ca70a034",
                  client: "Nexus1 nexus",
                  total: "8,882.00XAF",
                  status: "en attente de livraison",
                },
                {
                  id: "a8940df4-fe7d-11ef-9b2a-0250ca70a034",
                  client: "Nexus1 nexus",
                  total: "2,964.00XAF",
                  status: "en attente de livraison",
                },
                {
                  id: "679caba8-fe7c-11ef-9b2a-0250ca70a034",
                  client: "Nexus1 nexus",
                  total: "5,923.00XAF",
                  status: "en attente de livraison",
                },
              ].map((order) => (
                <div key={order.id} className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{order.client}</p>
                    <p className="text-xs text-muted-foreground">{order.id.substring(0, 8)}...</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-sm font-medium">{order.total}</div>
                    <div className="rounded-full px-2 py-1 text-xs bg-yellow-100 text-yellow-800">{order.status}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Users</CardTitle>
            <CardDescription>Latest users registered on the platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { id: 30, name: "admin admin", email: "admin2@gmail.com", role: "superadmin", status: "active" },
                { id: 29, name: "admin adminm", email: "admin@gmail.com", role: "admin", status: "active" },
                { id: 28, name: "fhug khjbvg", email: "dorianbat8@gmail.com", role: "client", status: "active" },
                { id: 27, name: "Nexus1 nexus", email: "latifnjimoluh@gmail.com", role: "client", status: "active" },
                { id: 26, name: "Nexus Latif", email: "nexuslatif35@gmail.com", role: "client", status: "active" },
              ].map((user) => (
                <div key={user.id} className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className={`rounded-full px-2 py-1 text-xs ${
                        user.role === "superadmin"
                          ? "bg-purple-100 text-purple-800"
                          : user.role === "admin"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-green-100 text-green-800"
                      }`}
                    >
                      {user.role}
                    </div>
                    <div className="rounded-full px-2 py-1 text-xs bg-green-100 text-green-800">{user.status}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

