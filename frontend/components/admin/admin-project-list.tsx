"use client"

import { useState, useEffect } from "react"
import { ethers } from "ethers"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { useWeb3 } from "@/context/web3-context"
import { 
  List, 
  ExternalLink, 
  RefreshCw, 
  Package, 
  MapPin, 
  DollarSign,
  Users,
  Leaf
} from "lucide-react"

interface ProjectData {
  id: number
  name: string
  location: string
  totalTons: number
  pricePerTon: string
  pricePerTonFormatted: string
}

interface ProjectBalance {
  projectId: number
  totalSupply: number
  ownerBalance: number
  circulatingSupply: number
}

export default function AdminProjectList() {
  const { toast } = useToast()
  const { carbonCreditContract, account, isConnected } = useWeb3()
  const [projects, setProjects] = useState<ProjectData[]>([])
  const [projectBalances, setProjectBalances] = useState<Record<number, ProjectBalance>>({})
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [nextProjectId, setNextProjectId] = useState<number>(0)

  const fetchProjects = async () => {
    if (!carbonCreditContract || !isConnected) {
      setLoading(false)
      return
    }

    try {
      setRefreshing(true)
      
      // Get the next project ID to know how many projects exist
      const nextId = await carbonCreditContract.nextProjectId()
      const nextIdNumber = Number(nextId)
      setNextProjectId(nextIdNumber)

      if (nextIdNumber === 0) {
        setProjects([])
        setProjectBalances({})
        setLoading(false)
        setRefreshing(false)
        return
      }

      // Fetch project info for each project
      const projectPromises = []
      const balancePromises = []

      for (let i = 0; i < nextIdNumber; i++) {
        // Fetch project info
        projectPromises.push(
          carbonCreditContract.projectInfo(i).then((info: any) => ({
            id: i,
            name: info.name,
            location: info.location,
            totalTons: Number(info.totalTons),
            pricePerTon: info.pricePerTon.toString(),
            pricePerTonFormatted: ethers.formatUnits(info.pricePerTon, 6)
          }))
        )

        // Fetch balances - we'll get the owner's balance and total supply
        balancePromises.push(
          Promise.all([
            carbonCreditContract.balanceOf(account, i),
            // Note: ERC1155 doesn't have totalSupply by default, so we'll use the initial totalTons
            // For a more accurate implementation, you might want to track minted/burned amounts
          ]).then(([ownerBalance]) => ({
            projectId: i,
            totalSupply: 0, // Will be set from project info
            ownerBalance: Number(ownerBalance),
            circulatingSupply: 0 // Will be calculated
          }))
        )
      }

      const [projectResults, balanceResults] = await Promise.all([
        Promise.all(projectPromises),
        Promise.all(balancePromises)
      ])

      // Combine project info with balance info
      const balanceMap: Record<number, ProjectBalance> = {}
      balanceResults.forEach((balance, index) => {
        const project = projectResults[index]
        balanceMap[balance.projectId] = {
          ...balance,
          totalSupply: project.totalTons,
          circulatingSupply: project.totalTons // For now, assume all minted tokens are circulating
        }
      })

      setProjects(projectResults)
      setProjectBalances(balanceMap)
      
    } catch (error) {
      console.error("Error fetching projects:", error)
      toast({
        title: "Error",
        description: "Failed to fetch project data",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchProjects()
  }, [carbonCreditContract, account, isConnected])

  const handleRefresh = () => {
    fetchProjects()
  }

  const getProjectTypeColor = (projectId: number) => {
    const colors = [
      "bg-green-500/20 text-green-400 border-green-500/30",
      "bg-blue-500/20 text-blue-400 border-blue-500/30", 
      "bg-purple-500/20 text-purple-400 border-purple-500/30",
      "bg-orange-500/20 text-orange-400 border-orange-500/30",
      "bg-pink-500/20 text-pink-400 border-pink-500/30"
    ]
    return colors[projectId % colors.length]
  }

  if (loading) {
    return (
      <Card className="bg-black/50 backdrop-blur-sm border-primary/30">
        <CardHeader>
          <CardTitle className="gold-gradient flex items-center">
            <List className="h-6 w-6 mr-2" />
            Project Management
          </CardTitle>
          <CardDescription>
            View and manage existing carbon credit projects
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 rounded-lg bg-black/60 border border-primary/20">
              <div className="flex justify-between items-start mb-3">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-6 w-20" />
              </div>
              <div className="grid md:grid-cols-4 gap-4">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-black/50 backdrop-blur-sm border-primary/30">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="gold-gradient flex items-center">
              <List className="h-6 w-6 mr-2" />
              Project Management
            </CardTitle>
            <CardDescription>
              View and manage existing carbon credit projects
            </CardDescription>
          </div>
          <Button 
            onClick={handleRefresh} 
            disabled={refreshing}
            variant="outline"
            size="sm"
            className="border-primary/30 hover:border-primary/50"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <div className="grid md:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg bg-black/60 border border-primary/20">
            <div className="flex items-center space-x-2 mb-2">
              <Package className="h-5 w-5 text-primary" />
              <span className="text-sm text-white/70">Total Projects</span>
            </div>
            <p className="text-2xl font-bold text-white">{projects.length}</p>
          </div>
          
          <div className="p-4 rounded-lg bg-black/60 border border-primary/20">
            <div className="flex items-center space-x-2 mb-2">
              <Leaf className="h-5 w-5 text-green-400" />
              <span className="text-sm text-white/70">Total Credits</span>
            </div>
            <p className="text-2xl font-bold text-white">
              {Object.values(projectBalances).reduce((sum, balance) => sum + balance.totalSupply, 0).toLocaleString()}
            </p>
          </div>

          <div className="p-4 rounded-lg bg-black/60 border border-primary/20">
            <div className="flex items-center space-x-2 mb-2">
              <Users className="h-5 w-5 text-blue-400" />
              <span className="text-sm text-white/70">Your Credits</span>
            </div>
            <p className="text-2xl font-bold text-white">
              {Object.values(projectBalances).reduce((sum, balance) => sum + balance.ownerBalance, 0).toLocaleString()}
            </p>
          </div>

          <div className="p-4 rounded-lg bg-black/60 border border-primary/20">
            <div className="flex items-center space-x-2 mb-2">
              <DollarSign className="h-5 w-5 text-yellow-400" />
              <span className="text-sm text-white/70">Avg. Price</span>
            </div>
            <p className="text-2xl font-bold text-white">
              {projects.length > 0 
                ? `$${(projects.reduce((sum, p) => sum + Number(p.pricePerTonFormatted), 0) / projects.length).toFixed(2)}` 
                : '$0.00'
              }
            </p>
          </div>
        </div>

        {projects.length === 0 ? (
          <Alert className="border-primary/30 bg-primary/10">
            <Package className="h-4 w-4" />
            <AlertDescription>
              No projects found. Use the "Add New Project" tab to create your first carbon credit project.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-4">
            {projects.map((project) => {
              const balance = projectBalances[project.id]
              return (
                <div 
                  key={project.id} 
                  className="p-6 rounded-lg bg-black/60 border border-primary/20 hover:border-primary/40 transition-all duration-300"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-xl font-bold text-white">{project.name}</h3>
                        <Badge className={getProjectTypeColor(project.id)}>
                          Project #{project.id}
                        </Badge>
                      </div>
                      <div className="flex items-center text-white/70 text-sm">
                        <MapPin className="h-4 w-4 mr-1" />
                        {project.location}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-primary/30 hover:border-primary/50"
                      onClick={() => window.open(`https://sepolia.basescan.org/address/${carbonCreditContract?.target}`, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Contract
                    </Button>
                  </div>

                  <div className="grid md:grid-cols-4 gap-4">
                    <div className="p-3 rounded-md bg-black/40 border border-primary/10">
                      <p className="text-xs text-white/60 mb-1">Total Supply</p>
                      <p className="text-lg font-bold text-white">
                        {balance?.totalSupply.toLocaleString() || project.totalTons.toLocaleString()}
                      </p>
                      <p className="text-xs text-white/50">credits minted</p>
                    </div>

                    <div className="p-3 rounded-md bg-black/40 border border-primary/10">
                      <p className="text-xs text-white/60 mb-1">Your Balance</p>
                      <p className="text-lg font-bold text-primary">
                        {balance?.ownerBalance.toLocaleString() || '0'}
                      </p>
                      <p className="text-xs text-white/50">credits owned</p>
                    </div>

                    <div className="p-3 rounded-md bg-black/40 border border-primary/10">
                      <p className="text-xs text-white/60 mb-1">Price per Credit</p>
                      <p className="text-lg font-bold text-green-400">
                        ${project.pricePerTonFormatted}
                      </p>
                      <p className="text-xs text-white/50">mUSDC</p>
                    </div>

                    <div className="p-3 rounded-md bg-black/40 border border-primary/10">
                      <p className="text-xs text-white/60 mb-1">Total Value</p>
                      <p className="text-lg font-bold text-yellow-400">
                        ${(Number(project.pricePerTonFormatted) * (balance?.totalSupply || project.totalTons)).toLocaleString()}
                      </p>
                      <p className="text-xs text-white/50">mUSDC</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
} 