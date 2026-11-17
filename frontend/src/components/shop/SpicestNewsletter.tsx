import { useState } from 'react'
import { Check, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function SpicestNewsletter() {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email.trim()) {
      setSubscribed(true)
      setTimeout(() => {
        setSubscribed(false)
        setEmail('')
      }, 3000)
    }
  }

  return (
    <section className="py-12 bg-white" id="newsletter">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-[#FEF4E5] p-8 sm:p-12 lg:p-14 border border-orange-100 flex flex-col md:flex-row items-center justify-between gap-8 shadow-sm">
          
          {/* Left Text */}
          <div className="space-y-2 text-center md:text-left max-w-md">
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              Be Always Updated With Us
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 font-sans">
              Join our email subscription now to get exclusive discounts and fresh spice updates.
            </p>
          </div>

          {/* Right Email Input Form */}
          <div className="w-full md:w-auto min-w-[300px] sm:min-w-[420px]">
            {subscribed ? (
              <div className="flex items-center justify-center gap-2 rounded-full bg-emerald-100 py-3.5 px-6 text-sm font-bold text-emerald-800 animate-in fade-in">
                <Check className="size-5" />
                <span>Thank you! You are subscribed.</span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="relative flex items-center">
                <div className="absolute left-4 text-gray-400">
                  <Mail className="size-4" />
                </div>
                <input
                  type="email"
                  required
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-full border border-orange-200 bg-white py-3.5 pl-11 pr-32 text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#E85D19] focus:outline-none focus:ring-1 focus:ring-[#E85D19] shadow-inner"
                />
                <Button
                  type="submit"
                  size="sm"
                  className="absolute right-1.5 rounded-full bg-[#E85D19] hover:bg-[#d24e0f] text-white px-6 py-2 text-xs sm:text-sm font-bold shadow-md transition-all"
                >
                  Subscribe
                </Button>
              </form>
            )}
          </div>

        </div>
      </div>
    </section>
  )
}
