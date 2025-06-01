"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Menu, X, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import WalletConnectButton from "@/components/wallet-connect-button"
import { useWeb3 } from "@/context/web3-context"

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isOwner, setIsOwner] = useState(false)
  const { carbonCreditContract, account, isConnected } = useWeb3()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Check if the connected account is the contract owner
  useEffect(() => {
    const checkOwnership = async () => {
      if (!carbonCreditContract || !account || !isConnected) {
        setIsOwner(false)
        return
      }

      try {
        const owner = await carbonCreditContract.owner()
        setIsOwner(account.toLowerCase() === owner.toLowerCase())
      } catch (error) {
        console.error("Error checking ownership:", error)
        setIsOwner(false)
      }
    }

    checkOwnership()
  }, [carbonCreditContract, account, isConnected])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-black/90 backdrop-blur-md py-2" : "bg-transparent py-4"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/basecarboncanopylogo.jpg-6UbIahjPnj1GorTUg21LD3zArZuiDv.jpeg"
              alt="Base Carbon Canopy Logo"
              width={40}
              height={40}
              className="h-10 w-auto"
            />
            <span className="font-montserrat font-bold text-xl md:text-2xl gold-gradient">Base Carbon Canopy</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link href="#about" className="text-white/80 hover:text-primary transition-colors">
              About
            </Link>
            <Link href="#map" className="text-white/80 hover:text-primary transition-colors">
              Projects Map
            </Link>
            <Link href="#trading" className="text-white/80 hover:text-primary transition-colors">
              Trading
            </Link>
            <Link href="#impact-scores" className="text-white/80 hover:text-primary transition-colors">
              Impact Scores
            </Link>
            {isOwner && (
              <Link href="/admin" className="text-primary hover:text-primary/80 transition-colors flex items-center gap-1">
                <Shield className="h-4 w-4" />
                Admin
              </Link>
            )}
            <WalletConnectButton />
          </nav>

          {/* Mobile Menu Button */}
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-black/95 backdrop-blur-md absolute top-full left-0 right-0 p-4 flex flex-col gap-4 border-t border-primary/20">
          <Link
            href="#about"
            className="text-white/80 hover:text-primary transition-colors py-2"
            onClick={() => setIsMenuOpen(false)}
          >
            About
          </Link>
          <Link
            href="#map"
            className="text-white/80 hover:text-primary transition-colors py-2"
            onClick={() => setIsMenuOpen(false)}
          >
            Projects Map
          </Link>
          <Link
            href="#trading"
            className="text-white/80 hover:text-primary transition-colors py-2"
            onClick={() => setIsMenuOpen(false)}
          >
            Trading
          </Link>
          <Link
            href="#impact-scores"
            className="text-white/80 hover:text-primary transition-colors py-2"
            onClick={() => setIsMenuOpen(false)}
          >
            Impact Scores
          </Link>
          {isOwner && (
            <Link
              href="/admin"
              className="text-primary hover:text-primary/80 transition-colors py-2 flex items-center gap-1"
              onClick={() => setIsMenuOpen(false)}
            >
              <Shield className="h-4 w-4" />
              Admin Panel
            </Link>
          )}
          <div className="pt-2">
            <WalletConnectButton />
          </div>
        </div>
      )}
    </header>
  )
}
