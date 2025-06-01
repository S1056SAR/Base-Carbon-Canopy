"use client"

import { useState, useEffect } from "react"
import { ethers } from "ethers"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { useWeb3 } from "@/context/web3-context"
import { Plus, CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"

// Form validation schema
const projectSchema = z.object({
  name: z.string().min(3, "Project name must be at least 3 characters").max(100, "Project name too long"),
  location: z.string().min(2, "Location must be at least 2 characters").max(50, "Location too long"),
  type: z.string().min(1, "Please select a project type"),
  description: z.string().min(10, "Description must be at least 10 characters").max(500, "Description too long"),
  initialSupply: z.string().refine((val) => {
    const num = Number(val)
    return !isNaN(num) && num > 0 && num <= 1000000
  }, "Initial supply must be a number between 1 and 1,000,000"),
  pricePerTon: z.string().refine((val) => {
    const num = Number(val)
    return !isNaN(num) && num > 0 && num <= 1000
  }, "Price per ton must be a number between 0.01 and 1000"),
  recipientAddress: z.string().refine((val) => {
    try {
      ethers.getAddress(val)
      return true
    } catch {
      return false
    }
  }, "Invalid Ethereum address"),
  coordinates: z.object({
    lat: z.string().refine((val) => {
      const num = Number(val)
      return !isNaN(num) && num >= -90 && num <= 90
    }, "Latitude must be between -90 and 90"),
    lng: z.string().refine((val) => {
      const num = Number(val)
      return !isNaN(num) && num >= -180 && num <= 180
    }, "Longitude must be between -180 and 180")
  })
})

type ProjectFormData = z.infer<typeof projectSchema>

const PROJECT_TYPES = [
  "Reforestation",
  "Renewable Energy", 
  "Methane Capture",
  "Energy Efficiency - Domestic",
  "Solar Thermal - Electricity",
  "Biogas - Electricity",
  "Biogas - Heat",
  "Peatland Restoration",
  "Efficient Cookstoves",
  "Wind Power",
  "Hydroelectric",
  "Other"
]

const PREDEFINED_LOCATIONS = [
  { name: "India", coordinates: { lat: "20.5937", lng: "78.9629" } },
  { name: "Kenya", coordinates: { lat: "-1.2921", lng: "36.8219" } },
  { name: "Brazil", coordinates: { lat: "-14.2350", lng: "-51.9253" } },
  { name: "Indonesia", coordinates: { lat: "-0.7893", lng: "113.9213" } },
  { name: "Ghana", coordinates: { lat: "7.9465", lng: "-1.0232" } },
  { name: "Nigeria", coordinates: { lat: "9.0820", lng: "8.6753" } },
  { name: "Ethiopia", coordinates: { lat: "9.1450", lng: "40.4897" } },
  { name: "Peru", coordinates: { lat: "-9.1900", lng: "-75.0152" } },
  { name: "Philippines", coordinates: { lat: "12.8797", lng: "121.7740" } },
  { name: "Bangladesh", coordinates: { lat: "23.6850", lng: "90.3563" } }
]

export default function AdminProjectForm() {
  const { toast } = useToast()
  const { carbonCreditContract, account } = useWeb3()
  const [loading, setLoading] = useState(false)
  const [transactionStatus, setTransactionStatus] = useState<"idle" | "pending" | "success" | "error">("idle")
  const [txHash, setTxHash] = useState<string>("")

  const form = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: "",
      location: "",
      type: "",
      description: "",
      initialSupply: "",
      pricePerTon: "",
      recipientAddress: "",
      coordinates: {
        lat: "",
        lng: ""
      }
    }
  })

  // Update recipient address when account is available
  useEffect(() => {
    if (account && !form.getValues().recipientAddress) {
      form.setValue("recipientAddress", account)
    }
  }, [account, form])

  const onSubmit = async (data: ProjectFormData) => {
    if (!carbonCreditContract) {
      toast({
        title: "Error",
        description: "Contract not initialized",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    setTransactionStatus("pending")

    try {
      console.log("Creating project with data:", data)

      // Convert price to USDC format (6 decimals)
      const priceInUSDC = ethers.parseUnits(data.pricePerTon, 6)
      
      // Call the mintNewProject function
      const tx = await carbonCreditContract.mintNewProject(
        data.name,
        data.location,
        Number(data.initialSupply),
        priceInUSDC,
        data.recipientAddress
      )

      setTxHash(tx.hash)
      console.log("Transaction sent:", tx.hash)

      // Wait for confirmation
      const receipt = await tx.wait()
      console.log("Transaction confirmed:", receipt)

      setTransactionStatus("success")
      toast({
        title: "Success!",
        description: `Project "${data.name}" created successfully!`,
      })

      // Reset form
      form.reset({
        name: "",
        location: "",
        type: "",
        description: "",
        initialSupply: "",
        pricePerTon: "",
        recipientAddress: account || "",
        coordinates: {
          lat: "",
          lng: ""
        }
      })

      // Reset status after 5 seconds
      setTimeout(() => {
        setTransactionStatus("idle")
        setTxHash("")
      }, 5000)

    } catch (error: any) {
      console.error("Error creating project:", error)
      setTransactionStatus("error")
      
      let errorMessage = "Failed to create project"
      if (error.reason) {
        errorMessage = error.reason
      } else if (error.message) {
        errorMessage = error.message
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleLocationSelect = (locationName: string) => {
    const location = PREDEFINED_LOCATIONS.find(loc => loc.name === locationName)
    if (location) {
      form.setValue("location", locationName)
      form.setValue("coordinates.lat", location.coordinates.lat)
      form.setValue("coordinates.lng", location.coordinates.lng)
    }
  }

  const getStatusIcon = () => {
    switch (transactionStatus) {
      case "pending":
        return <Loader2 className="h-4 w-4 animate-spin" />
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <Plus className="h-4 w-4" />
    }
  }

  return (
    <Card className="bg-black/50 backdrop-blur-sm border-primary/30">
      <CardHeader>
        <CardTitle className="gold-gradient flex items-center">
          <Plus className="h-6 w-6 mr-2" />
          Add New Carbon Credit Project
        </CardTitle>
        <CardDescription>
          Create a new carbon offset project and mint initial credits
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {transactionStatus === "success" && (
          <Alert className="border-green-500/30 bg-green-500/10">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Project created successfully! {txHash && (
                <a 
                  href={`https://sepolia.basescan.org/tx/${txHash}`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-green-400 hover:underline ml-1"
                >
                  View transaction
                </a>
              )}
            </AlertDescription>
          </Alert>
        )}

        {transactionStatus === "error" && (
          <Alert className="border-red-500/30 bg-red-500/10">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to create project. Please try again.
            </AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Project Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Kenya Reforestation Initiative"
                        className="bg-black/60 border-primary/30"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Project Type */}
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-black/60 border-primary/30">
                          <SelectValue placeholder="Select project type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {PROJECT_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Location Selection */}
            <div className="grid md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <Select onValueChange={handleLocationSelect} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-black/60 border-primary/30">
                          <SelectValue placeholder="Select location" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {PREDEFINED_LOCATIONS.map((location) => (
                          <SelectItem key={location.name} value={location.name}>
                            {location.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="coordinates.lat"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Latitude</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., -1.2921"
                        className="bg-black/60 border-primary/30"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="coordinates.lng"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Longitude</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., 36.8219"
                        className="bg-black/60 border-primary/30"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the carbon offset project, its impact, and sustainability goals..."
                      className="bg-black/60 border-primary/30 min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Provide a detailed description of the project's environmental impact
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid md:grid-cols-3 gap-6">
              {/* Initial Supply */}
              <FormField
                control={form.control}
                name="initialSupply"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Initial Credit Supply</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="e.g., 1000"
                        className="bg-black/60 border-primary/30"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>Number of carbon credits to mint</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Price Per Ton */}
              <FormField
                control={form.control}
                name="pricePerTon"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price Per Credit (mUSDC)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="e.g., 10.50"
                        className="bg-black/60 border-primary/30"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>Price in mock USDC</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Recipient Address */}
              <FormField
                control={form.control}
                name="recipientAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Recipient Address</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="0x..."
                        className="bg-black/60 border-primary/30"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>Address to receive the minted credits</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button 
              type="submit" 
              disabled={loading || transactionStatus === "pending"}
              className="w-full bg-primary hover:bg-primary/90 text-black font-semibold"
            >
              {getStatusIcon()}
              {loading ? "Creating Project..." : "Create Project"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
} 