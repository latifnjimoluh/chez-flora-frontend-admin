import LoginForm from "@/components/login-form"

export default function Home() {
  // In a real app, you would check if the user is already logged in
  // and redirect to the dashboard if they are
  // const session = await getSession();
  // if (session) redirect("/dashboard");

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-green-50 to-green-100 p-4">
      <LoginForm />
    </div>
  )
}

