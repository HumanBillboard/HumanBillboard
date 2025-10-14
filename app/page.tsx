import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#171717]">
      {/* Navigation */}
      <nav className="border-b border-[#D9D9D9]/20">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="text-2xl font-bold text-[#D9D9D9]">
            Human<span className="text-[#8BFF61]">Billboard</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/auth/login">
              <Button
                variant="ghost"
                className="text-[#D9D9D9] hover:bg-[#D9D9D9]/10 hover:text-[#D9D9D9]"
                style={{ borderRadius: "5px" }}
              >
                Sign in
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button className="bg-[#8BFF61] text-[#171717] hover:bg-[#8BFF61]/90" style={{ borderRadius: "5px" }}>
                Get started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section with Video Background */}
      <section className="relative overflow-hidden">
        {/* Video Background */}
        <div className="absolute inset-0 z-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="h-full w-full object-cover opacity-30"
            poster="/people-wearing-branded-merchandise-in-urban-settin.jpg"
          >
            <source src="/hero-video.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-[#171717]/50 via-[#171717]/70 to-[#171717]" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 mx-auto max-w-7xl px-6 py-24 md:py-32 lg:py-40">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="mb-6 text-balance text-5xl font-bold leading-tight text-[#D9D9D9] md:text-6xl lg:text-7xl">
              Turn People Into <span className="text-[#8BFF61]">Walking Billboards</span>
            </h1>
            <p className="mb-8 text-pretty text-xl leading-relaxed text-[#D9D9D9]/80 md:text-2xl">
              Connect businesses with brand ambassadors. Get paid to wear merchandise in public, or hire people to
              promote your brand in the real world.
            </p>

            {/* Dual CTAs */}
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/auth/signup?type=advertiser" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="w-full bg-[#8BFF61] text-[#171717] hover:bg-[#8BFF61]/90 sm:w-auto"
                  style={{ borderRadius: "5px" }}
                >
                  Start earning money
                </Button>
              </Link>
              <Link href="/auth/signup?type=business" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full border-[#D9D9D9] text-[#D9D9D9] hover:bg-[#D9D9D9]/10 sm:w-auto bg-transparent"
                  style={{ borderRadius: "5px" }}
                >
                  Hire brand ambassadors
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="border-t border-[#D9D9D9]/20 bg-[#171717] py-20">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="mb-12 text-center text-4xl font-bold text-[#D9D9D9]">How It Works</h2>

          <div className="grid gap-8 md:grid-cols-2">
            {/* For Advertisers */}
            <Card className="border-[#D9D9D9]/20 bg-[#171717]" style={{ borderRadius: "5px" }}>
              <CardContent className="p-8">
                <h3 className="mb-6 text-2xl font-bold text-[#8BFF61]">For Advertisers</h3>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#8BFF61] text-[#171717] font-bold">
                      1
                    </div>
                    <div>
                      <h4 className="mb-1 font-semibold text-[#D9D9D9]">Browse Campaigns</h4>
                      <p className="text-[#D9D9D9]/70">Find opportunities that match your location and schedule</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#8BFF61] text-[#171717] font-bold">
                      2
                    </div>
                    <div>
                      <h4 className="mb-1 font-semibold text-[#D9D9D9]">Apply to Campaigns</h4>
                      <p className="text-[#D9D9D9]/70">Submit your application with a brief message</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#8BFF61] text-[#171717] font-bold">
                      3
                    </div>
                    <div>
                      <h4 className="mb-1 font-semibold text-[#D9D9D9]">Get Accepted & Earn</h4>
                      <p className="text-[#D9D9D9]/70">Wear the merchandise and get paid for your time</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* For Businesses */}
            <Card className="border-[#D9D9D9]/20 bg-[#171717]" style={{ borderRadius: "5px" }}>
              <CardContent className="p-8">
                <h3 className="mb-6 text-2xl font-bold text-[#8BFF61]">For Businesses</h3>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#8BFF61] text-[#171717] font-bold">
                      1
                    </div>
                    <div>
                      <h4 className="mb-1 font-semibold text-[#D9D9D9]">Create a Campaign</h4>
                      <p className="text-[#D9D9D9]/70">Post your opportunity with details and compensation</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#8BFF61] text-[#171717] font-bold">
                      2
                    </div>
                    <div>
                      <h4 className="mb-1 font-semibold text-[#D9D9D9]">Review Applications</h4>
                      <p className="text-[#D9D9D9]/70">Browse applicants and select the best brand ambassadors</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#8BFF61] text-[#171717] font-bold">
                      3
                    </div>
                    <div>
                      <h4 className="mb-1 font-semibold text-[#D9D9D9]">Grow Your Brand</h4>
                      <p className="text-[#D9D9D9]/70">Get real-world visibility with human billboards</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-t border-[#D9D9D9]/20 bg-[#171717] py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="mb-2 text-5xl font-bold text-[#8BFF61]">$15-50</div>
              <div className="text-[#D9D9D9]/70">Average hourly rate</div>
            </div>
            <div className="text-center">
              <div className="mb-2 text-5xl font-bold text-[#8BFF61]">100%</div>
              <div className="text-[#D9D9D9]/70">Real-world visibility</div>
            </div>
            <div className="text-center">
              <div className="mb-2 text-5xl font-bold text-[#8BFF61]">24/7</div>
              <div className="text-[#D9D9D9]/70">Campaign management</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-[#D9D9D9]/20 bg-[#171717] py-20">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="mb-6 text-balance text-4xl font-bold text-[#D9D9D9]">Ready to Get Started?</h2>
          <p className="mb-8 text-pretty text-xl text-[#D9D9D9]/80">
            Join the marketplace connecting brands with people. Start earning or hiring today.
          </p>
          <Link href="/auth/signup">
            <Button
              size="lg"
              className="bg-[#8BFF61] text-[#171717] hover:bg-[#8BFF61]/90"
              style={{ borderRadius: "5px" }}
            >
              Create your free account
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#D9D9D9]/20 bg-[#171717] py-8">
        <div className="mx-auto max-w-7xl px-6 text-center text-[#D9D9D9]/70">
          <p>&copy; 2025 HumanBillboard. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
