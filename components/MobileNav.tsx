'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
        aria-label="Toggle menu"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="lg:hidden fixed top-16 left-0 right-0 bg-white shadow-lg z-50 border-b border-gray-200">
            <div className="px-4 py-4 space-y-2">
              <Link
                href="#features"
                onClick={() => setIsOpen(false)}
                className="block px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors font-medium"
              >
                Features
              </Link>
              <Link
                href="#solutions"
                onClick={() => setIsOpen(false)}
                className="block px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors font-medium"
              >
                Solutions
              </Link>
              <Link
                href="#pricing"
                onClick={() => setIsOpen(false)}
                className="block px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors font-medium"
              >
                Pricing
              </Link>
              <Link
                href="/auth/signin"
                onClick={() => setIsOpen(false)}
                className="block px-4 py-3 rounded-lg bg-gradient-to-r from-primary to-accent text-white font-medium text-center hover:opacity-90 transition-opacity"
              >
                Login
              </Link>
            </div>
          </div>
        </>
      )}
    </>
  )
}

