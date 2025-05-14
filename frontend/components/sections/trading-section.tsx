"use client"

import { useState, useEffect } from "react"
import { ethers } from "ethers"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { useWeb3 } from "@/context/web3-context"
import { Wallet, RefreshCw, CheckCircle, AlertCircle, ShoppingCart, RotateCcw } from "lucide-react"
import TradeHistoryTable from "@/components/trade-history-table"
import { Badge } from "@/components/ui/badge"
import type React from "react"

// Define the project type to match projects.json structure
interface ProjectData {
  id: number // Corresponds to blockchain projectId
  gsid?: number
  name: string
  locationName?: string // Optional, as not directly used in trading UI but good for consistency
  coordinates?: [number, number]
  type: string
  description?: string
  totalMinted?: number // May not be directly used here but good for consistency
  mockPricePerToken: string // Price in mUSDC as a string, e.g., "10.50"
}

export default function TradingSection() {
  const { toast } = useToast()
  const {
    isConnected,
    account,
    carbonCreditContract,
    mockUSDCContract,
    balance: usdcBalance,
    connectWallet, // Added to prompt connection
    defaultSellerAddress, // Added from context
    isCorrectNetwork, // Added for network check
    switchNetwork, // Added for switching network
  } = useWeb3()

  const [projects, setProjects] = useState<ProjectData[]>([])
  const [selectedProjectId, setSelectedProjectId] = useState<string>("")
  const [amount, setAmount] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(false)
  const [transactionStatus, setTransactionStatus] = useState<"idle" | "pending" | "success" | "error">("idle")
  const [creditBalances, setCreditBalances] = useState<Record<number, string>>({})

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch("/data/projects.json")
        if (!response.ok) throw new Error("Failed to fetch projects from /data/projects.json")
        const data: ProjectData[] = await response.json()
        setProjects(data)
        if (data.length > 0) {
          // setSelectedProjectId(data[0].id.toString()) // Optionally pre-select first project
        }
      } catch (error) {
        console.error("Error loading projects:", error)
        setProjects([])
      }
    }
    fetchProjects()
  }, [])

  useEffect(() => {
    const fetchCreditBalances = async () => {
      if (!carbonCreditContract || !account || projects.length === 0 || !isConnected) return

      try {
        const balancePromises = projects.map(async (project: ProjectData) => {
          const balance = await carbonCreditContract.balanceOf(account, project.id)
          return { projectId: project.id, balance: balance.toString() }
        })

        const results = await Promise.all(balancePromises)
        const balanceMap: Record<number, string> = {}

        results.forEach(({ projectId, balance }: { projectId: number; balance: string }) => {
          balanceMap[projectId] = balance
        })

        setCreditBalances(balanceMap)
      } catch (error) {
        console.error("Error fetching credit balances:", error)
        setCreditBalances({})
      }
    }

    fetchCreditBalances()
  }, [carbonCreditContract, account, projects, isConnected])

  const handleTransaction = async (action: "buy" | "retire") => {
    if (!isConnected) {
      toast({ title: "Wallet Not Connected", description: "Please connect your wallet first.", variant: "destructive" })
      connectWallet() // Prompt connection
      return
    }
    if (!isCorrectNetwork) {
      toast({ title: "Wrong Network", description: "Please switch to Base Sepolia testnet.", variant: "destructive" })
      switchNetwork() // Prompt network switch
      return
    }

    if (!selectedProjectId || !amount || Number.parseFloat(amount) <= 0) {
      toast({ title: "Invalid Input", description: "Please select a project and enter a valid amount.", variant: "destructive" })
      return
    }

    const projectIdNum = Number.parseInt(selectedProjectId)
    const project = projects.find((p: ProjectData) => p.id === projectIdNum)

    if (!project) {
      toast({ title: "Project Not Found", variant: "destructive" })
      return
    }

    setLoading(true)
    setTransactionStatus("pending")

    try {
      const tokenAmountBigInt = ethers.parseUnits(amount, 0)

      if (action === "buy") {
        if (!mockUSDCContract || !carbonCreditContract || !defaultSellerAddress || defaultSellerAddress === "0x0000000000000000000000000000000000000000") {
          toast({ title: "Configuration Error", description: "USDC contract or Seller Address not configured.", variant: "destructive" })
          throw new Error("Buy prerequisites not met")
        }
        const pricePerTokenInSmallestUnit = ethers.parseUnits(project.mockPricePerToken, 6)
        const totalCost = pricePerTokenInSmallestUnit * tokenAmountBigInt

        const userUSDCBalance = ethers.parseUnits(usdcBalance, 6)
        if (userUSDCBalance < totalCost) {
          toast({ title: "Insufficient mUSDC", description: `You need ${ethers.formatUnits(totalCost, 6)} mUSDC. Your balance: ${usdcBalance} mUSDC.`, variant: "destructive" })
          throw new Error("Insufficient mUSDC balance")
        }

        const allowance = await mockUSDCContract.allowance(account, carbonCreditContract.address)
        if (allowance < totalCost) {
          const approveTx = await mockUSDCContract.approve(carbonCreditContract.address, totalCost)
          toast({ title: "Approval Required", description: "Approving mUSDC spending...", variant: "default" })
          await approveTx.wait()
          toast({ title: "Approval Successful", description: "mUSDC spending approved. Proceeding with purchase...", variant: "default" })
        }
        
        const buyTx = await carbonCreditContract.buyCredits(
          projectIdNum,
          tokenAmountBigInt,
          pricePerTokenInSmallestUnit,
          defaultSellerAddress
        )
        await buyTx.wait()
        toast({ title: "Purchase Successful!", description: `Successfully bought ${amount} credits from ${project.name}.`, variant: "default" })

      } else if (action === "retire") {
        if (!carbonCreditContract) throw new Error("CarbonCredit contract not available")
        const currentBalance = creditBalances[projectIdNum] ? ethers.parseUnits(creditBalances[projectIdNum], 0) : BigInt(0)
        if (tokenAmountBigInt > currentBalance) {
          toast({ title: "Insufficient Credits", description: `You only have ${ethers.formatUnits(currentBalance, 0)} credits to retire.`, variant: "destructive" })
          throw new Error("Insufficient credits to retire")
        }
        const retireTx = await carbonCreditContract.retireCredits(projectIdNum, tokenAmountBigInt)
        await retireTx.wait()
        toast({ title: "Retirement Successful!", description: `Successfully retired ${amount} credits from ${project.name}.`, variant: "default" })
      }

      setTransactionStatus("success")
      if (carbonCreditContract && account) {
        const updatedCreditBalance = await carbonCreditContract.balanceOf(account, projectIdNum)
        setCreditBalances((prev: Record<number, string>) => ({ ...prev, [projectIdNum]: updatedCreditBalance.toString() }))
      }

    } catch (error: any) {
      console.error(`Error ${action} credits:`, error)
      setTransactionStatus("error")
      const errorMessage = error.reason || error.message || `Failed to ${action} credits.`
      toast({ title: "Transaction Failed", description: errorMessage.substring(0, 100), variant: "destructive" })
    } finally {
      setLoading(false)
      setTimeout(() => setTransactionStatus("idle"), 5000)
      setAmount("")
    }
  }

  const getStatusIcon = () => {
    switch (transactionStatus) {
      case "pending":
        return <RefreshCw className="animate-spin h-5 w-5 ml-2" />
      case "success":
        return <CheckCircle className="h-5 w-5 ml-2 text-green-500" />
      case "error":
        return <AlertCircle className="h-5 w-5 ml-2 text-red-500" />
      default:
        return null
    }
  }

  const formDisabled = !isConnected || loading

  return (
    <section id="trading" className="py-20 bg-black circuit-pattern">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 gold-gradient">Carbon Credit Trading</h2>
          <p className="text-lg text-white/80 max-w-3xl mx-auto">
            Acquire and manage your carbon credits. All transactions are transparently recorded on the Base Sepolia testnet.
          </p>
        </div>

        <Card className="max-w-2xl mx-auto bg-black/70 backdrop-blur-md border-primary/30 shadow-xl">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="gold-gradient text-2xl">Trade & Retire Credits</CardTitle>
              {isConnected && (
                <Badge variant="outline" className="border-green-500/50 bg-green-500/10 text-green-400">
                  <Wallet className="h-4 w-4 mr-2" /> {account?.substring(0, 6)}...{account?.substring(account.length - 4)}
                </Badge>
              )}
            </div>
            <CardDescription>Your mUSDC Balance: <span className="font-bold text-primary">{isConnected ? usdcBalance : 'N/A'} mUSDC</span></CardDescription>
          </CardHeader>
          <Tabs defaultValue="buy" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4 bg-black/50 border-primary/20">
              <TabsTrigger value="buy" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
                <ShoppingCart className="h-4 w-4 mr-2" />Buy Credits</TabsTrigger>
              <TabsTrigger value="retire" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
                <RotateCcw className="h-4 w-4 mr-2" />Retire Credits</TabsTrigger>
            </TabsList>
            <TabsContent value="buy">
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="buy-project" className="text-white/80">Project</Label>
                  <Select onValueChange={setSelectedProjectId} value={selectedProjectId} disabled={formDisabled}>
                    <SelectTrigger id="buy-project" className="bg-black/80 border-primary/40">
                      <SelectValue placeholder="Select a project to buy credits from" />
                    </SelectTrigger>
                    <SelectContent className="bg-black border-primary/50 text-white">
                      {projects.map((project: ProjectData) => (
                        <SelectItem key={project.id} value={project.id.toString()} className="hover:bg-primary/20 focus:bg-primary/20">
                          {project.name} ({project.mockPricePerToken} mUSDC/credit) - Bal: {creditBalances[project.id] || '0'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="buy-amount" className="text-white/80">Amount of Credits</Label>
                  <Input id="buy-amount" type="number" placeholder="e.g., 100" value={amount} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAmount(e.target.value)} min="1" className="bg-black/80 border-primary/40" disabled={formDisabled} />
                </div>
                <Button onClick={() => handleTransaction('buy')} className="w-full bg-gradient-to-r from-primary to-yellow-600 hover:from-primary/90 hover:to-yellow-600/90 text-black font-semibold" disabled={formDisabled || !selectedProjectId || !amount}>
                  {loading && transactionStatus === "pending" ? "Processing..." : "Buy Credits"}
                  {getStatusIcon()}
                </Button>
              </CardContent>
            </TabsContent>
            <TabsContent value="retire">
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="retire-project" className="text-white/80">Project</Label>
                  <Select onValueChange={setSelectedProjectId} value={selectedProjectId} disabled={formDisabled}>
                    <SelectTrigger id="retire-project" className="bg-black/80 border-primary/40">
                      <SelectValue placeholder="Select a project to retire credits from" />
                    </SelectTrigger>
                    <SelectContent className="bg-black border-primary/50 text-white">
                      {projects.filter((p: ProjectData) => creditBalances[p.id] && Number(creditBalances[p.id]) > 0).map((project: ProjectData) => (
                        <SelectItem key={project.id} value={project.id.toString()} className="hover:bg-primary/20 focus:bg-primary/20">
                          {project.name} (Your Balance: {creditBalances[project.id] || '0'})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="retire-amount" className="text-white/80">Amount to Retire</Label>
                  <Input id="retire-amount" type="number" placeholder="e.g., 10" value={amount} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAmount(e.target.value)} min="1" className="bg-black/80 border-primary/40" disabled={formDisabled} />
                </div>
                <Button onClick={() => handleTransaction('retire')} className="w-full bg-gradient-to-r from-red-600 to-red-800 hover:from-red-600/90 hover:to-red-800/90 text-white font-semibold" disabled={formDisabled || !selectedProjectId || !amount}>
                  {loading && transactionStatus === "pending" ? "Processing..." : "Retire Credits"}
                  {getStatusIcon()}
                </Button>
              </CardContent>
            </TabsContent>
          </Tabs>
          <CardFooter className="mt-6">
            <TradeHistoryTable />
          </CardFooter>
        </Card>
      </div>
    </section>
  )
}
