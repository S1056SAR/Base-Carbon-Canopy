"use client"

import { useEffect, useState } from "react"
import { useWeb3 } from "@/context/web3-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield, ArrowLeft } from "lucide-react"
import Link from "next/link"
import AdminProjectForm from "@/components/admin/admin-project-form"
import AdminProjectList from "@/components/admin/admin-project-list"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function AdminPage() {
  const { isConnected, account, carbonCreditContract, connectWallet, isCorrectNetwork, switchNetwork } = useWeb3()
  const [isOwner, setIsOwner] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(true)
  const [contractOwner, setContractOwner] = useState<string>("")

  useEffect(() => {
    const checkOwnership = async () => {
      if (!carbonCreditContract || !account || !isConnected) {
        setIsOwner(false)
        setLoading(false)
        return
      }

      try {
        const owner = await carbonCreditContract.owner()
        setContractOwner(owner.toLowerCase())
        setIsOwner(account.toLowerCase() === owner.toLowerCase())
      } catch (error) {
        console.error("Error checking ownership:", error)
        setIsOwner(false)
      } finally {
        setLoading(false)
      }
    }

    checkOwnership()
  }, [carbonCreditContract, account, isConnected])

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Card className="bg-black/50 backdrop-blur-sm border-primary/30 w-full max-w-md">
          <CardHeader className="text-center">
            <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
            <CardTitle className="gold-gradient">Admin Access Required</CardTitle>
            <CardDescription>Connect your wallet to access the admin panel</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={connectWallet} className="w-full">
              Connect Wallet
            </Button>
            <Link href="/">
              <Button variant="outline" className="w-full">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Main App
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!isCorrectNetwork) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Card className="bg-black/50 backdrop-blur-sm border-primary/30 w-full max-w-md">
          <CardHeader className="text-center">
            <Shield className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <CardTitle className="text-red-400">Wrong Network</CardTitle>
            <CardDescription>Please switch to Base Sepolia testnet</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={switchNetwork} className="w-full">
              Switch Network
            </Button>
            <Link href="/">
              <Button variant="outline" className="w-full">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Main App
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-white/80">Checking admin permissions...</p>
        </div>
      </div>
    )
  }

  if (!isOwner) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Card className="bg-black/50 backdrop-blur-sm border-red-500/30 w-full max-w-md">
          <CardHeader className="text-center">
            <Shield className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <CardTitle className="text-red-400">Access Denied</CardTitle>
            <CardDescription>Only the contract owner can access this admin panel</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="border-red-500/30 bg-red-500/10">
              <AlertDescription className="text-sm">
                <strong>Your address:</strong> {account}<br />
                <strong>Contract owner:</strong> {contractOwner}
              </AlertDescription>
            </Alert>
            <Link href="/">
              <Button variant="outline" className="w-full">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Main App
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="border-b border-primary/20 bg-black/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Shield className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold gold-gradient">Admin Panel</h1>
                <p className="text-sm text-white/60">Carbon Credit Project Management</p>
              </div>
            </div>
            <Link href="/">
              <Button variant="outline" className="border-primary/30 hover:border-primary/50">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Main App
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Alert className="mb-8 border-primary/30 bg-primary/10">
          <Shield className="h-4 w-4" />
          <AlertDescription>
            Welcome, Contract Owner! You can manage carbon credit projects from this admin panel.
          </AlertDescription>
        </Alert>

        <Tabs defaultValue="add-project" className="space-y-8">
          <TabsList className="grid w-full grid-cols-2 bg-black/50 border border-primary/30">
            <TabsTrigger value="add-project" className="data-[state=active]:bg-primary/20">
              Add New Project
            </TabsTrigger>
            <TabsTrigger value="manage-projects" className="data-[state=active]:bg-primary/20">
              Manage Projects
            </TabsTrigger>
          </TabsList>

          <TabsContent value="add-project">
            <AdminProjectForm />
          </TabsContent>

          <TabsContent value="manage-projects">
            <AdminProjectList />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
} 