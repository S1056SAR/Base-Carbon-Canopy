"use client"

import { Button } from "@/components/ui/button"
import { useWeb3 } from "@/context/web3-context"
import { Wallet } from "lucide-react"

export default function WalletConnectButton() {
  const { isConnected, account, connectWallet, isCorrectNetwork, switchNetwork } = useWeb3()

  const shortenAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  if (!isConnected) {
    return (
      <Button onClick={connectWallet} className="bg-primary text-black hover:bg-primary/90">
        <Wallet className="mr-2 h-4 w-4" />
        Connect Wallet
      </Button>
    )
  }

  if (!isCorrectNetwork) {
    return (
      <Button onClick={switchNetwork} variant="destructive">
        Switch to Base Sepolia
      </Button>
    )
  }

  return (
    <Button variant="outline" className="border-primary text-primary hover:bg-primary/10">
      <Wallet className="mr-2 h-4 w-4" />
      {account ? shortenAddress(account) : "Connected"}
    </Button>
  )
}
