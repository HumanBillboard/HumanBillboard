import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { VideoPlaylist } from "@/components/video-playlist"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0f0f0f]">
      {/* Top Nav */}
      <nav className="sticky top-0 z-30 border-b border-[#D9D9D9]/15 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-xl font-semibold text-[#D9D9D9]">
            Human<span className="text-[#8BFF61]">Billboard</span>
          </Link>
          <div className="hidden items-center gap-6 text-sm text-[#D9D9D9]/80 md:flex">
            <Link href="/advertiser/campaigns">Campaigns</Link>
            <Link href="/business/dashboard">Businesses</Link>
            <Link href="#how">How it works</Link>
            <Link href="#resources">Resources</Link>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/auth/login">
              <Button variant="ghost" className="text-[#D9D9D9] hover:bg-white/5">Sign in</Button>
            </Link>
            <Link href="/auth/signup">
              <Button className="bg-[#8BFF61] text-[#0f0f0f] hover:bg-[#8BFF61]/90">Get started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero - left copy, right media */}
      <section className="border-b border-[#D9D9D9]/10">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-6 py-14 md:grid-cols-2 md:py-20">
          <div>
            <p className="mb-3 text-xs uppercase tracking-widest text-[#D9D9D9]/60">Platform</p>
            <h1 className="text-balance text-4xl font-bold leading-tight text-[#D9D9D9] sm:text-5xl lg:text-6xl">
              The center for human advertising
            </h1>
            <p className="mt-5 max-w-xl text-pretty text-lg leading-relaxed text-[#D9D9D9]/80">
              Get paid to wear local brands and help them reach real people
              through everyday moments. Businesses create campaigns, people
              apply, then show up — simple.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/auth/signup?type=advertiser">
                <Button size="lg" className="bg-[#8BFF61] text-[#0f0f0f] hover:bg-[#8BFF61]/90">
                  Start earning
                </Button>
              </Link>
              <Link href="/auth/signup?type=business">
                <Button size="lg" variant="outline" className="border-white/20 text-[#D9D9D9]">
                  Create a campaign
                </Button>
              </Link>
            </div>
          </div>
          <div className="relative">
            <div className="relative overflow-hidden rounded-xl border border-white/10 bg-black/40">
              <VideoPlaylist
                className="h-[420px] md:h-[520px]"
                sources={[
                  "/api/media/media1.mp4",
                  "/api/media/media2.mp4",
                  "/api/media/media3.mp4",
                  "/api/media/media4.mp4",
                ]}
                poster="/placeholder.svg?height=560&width=720"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="how" className="border-b border-[#D9D9D9]/10 py-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-xl text-center">
            <p className="mb-2 text-xs uppercase tracking-widest text-[#D9D9D9]/60">Features</p>
            <h2 className="text-2xl font-semibold text-[#D9D9D9]">Advertising reimagined</h2>
            <p className="mt-2 text-sm text-[#D9D9D9]/70">Smart options connecting businesses with local brand ambassadors.</p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {[{
              title: "Boost local brand awareness",
              desc: "Hire nearby ambassadors to walk your message into community hubs.",
            },{
              title: "Cost-effective marketing solution",
              desc: "Pay for presence, not impressions. Control budgets and timelines.",
            },{
              title: "Build genuine connections",
              desc: "Create memorable interactions with real people in real places.",
            }].map((f, i) => (
              <Card key={i} className="border-white/10 bg-[#121212]">
                <CardHeader className="gap-4">
                  <div className="overflow-hidden rounded-md border border-white/10">
                    <Image
                      src={`/placeholder.svg?height=180&width=480&text=Image+${i+1}`}
                      alt="feature"
                      width={480}
                      height={180}
                      className="h-40 w-full object-cover"
                    />
                  </div>
                  <CardTitle className="text-[#D9D9D9]">{f.title}</CardTitle>
                  <CardDescription className="text-[#D9D9D9]/70">{f.desc}</CardDescription>
                </CardHeader>
                <CardFooter className="pt-0">
                  <div className="flex w-full items-center justify-between text-xs text-[#D9D9D9]/60">
                    <span className="hover:text-[#D9D9D9] transition">Explore →</span>
                    <span className="hover:text-[#D9D9D9] transition">Learn more →</span>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Value prop split */}
      <section className="border-b border-[#D9D9D9]/10 py-16">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-6 md:grid-cols-2">
          <div>
            <p className="mb-2 text-xs uppercase tracking-widest text-[#D9D9D9]/60">For talents</p>
            <h3 className="text-2xl font-semibold text-[#D9D9D9]">Transform your everyday look into marketing magic</h3>
            <p className="mt-3 text-[#D9D9D9]/75">
              Match with local brands and earn money simply by being out and
              about. Choose shifts, wear the merch, and make an impact.
            </p>
            <ul className="mt-6 space-y-3 text-sm text-[#D9D9D9]">
              <li className="flex items-start gap-2"><span className="mt-[6px] size-1.5 rounded-full bg-[#8BFF61]"/><span>Pick campaigns that fit your schedule and area.</span></li>
              <li className="flex items-start gap-2"><span className="mt-[6px] size-1.5 rounded-full bg-[#8BFF61]"/><span>Simple check-ins prove presence — no awkward selling.</span></li>
              <li className="flex items-start gap-2"><span className="mt-[6px] size-1.5 rounded-full bg-[#8BFF61]"/><span>Get paid quickly and transparently for your time.</span></li>
            </ul>
            <div className="mt-6 flex gap-3">
              <Link href="/auth/signup?type=advertiser"><Button>Become an ambassador</Button></Link>
              <Link href="/advertiser/campaigns"><Button variant="outline" className="border-white/20 text-[#D9D9D9]">Browse campaigns</Button></Link>
            </div>
          </div>
          <div className="relative">
            <div className="overflow-hidden rounded-xl border border-white/10">
              <Image src="/placeholder.svg?height=520&width=640" alt="Ambassador" width={640} height={520} className="h-full w-full object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* About + hero image */}
      <section className="border-b border-[#D9D9D9]/10 py-16">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <p className="mb-2 text-xs uppercase tracking-widest text-[#D9D9D9]/60">About</p>
          <h3 className="text-2xl font-semibold text-[#D9D9D9]">Connecting brands with real people</h3>
          <p className="mt-2 text-sm text-[#D9D9D9]/70">
            HumanBillboard transforms traditional advertising by creating direct connections between
            businesses and community members.
          </p>
          <div className="mt-6 flex items-center justify-center gap-6 text-xs text-[#D9D9D9]/60">
            <span className="hover:text-[#D9D9D9] transition">About us</span>
            <span className="hover:text-[#D9D9D9] transition">Our mission</span>
          </div>
        </div>
        <div className="mx-auto mt-10 max-w-7xl px-6">
          <div className="overflow-hidden rounded-xl border border-white/10">
            <Image src="/placeholder.svg?height=560&width=1280" alt="Hero" width={1280} height={560} className="h-auto w-full object-cover" />
          </div>
        </div>
      </section>

      {/* Testimonial slice */}
      <section className="border-b border-[#D9D9D9]/10 py-16">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-8 px-6 md:grid-cols-[280px_1fr]">
          <div className="overflow-hidden rounded-xl border border-white/10">
            <Image src="/placeholder.svg?height=260&width=280" alt="Customer" width={280} height={260} className="h-full w-full object-cover" />
          </div>
          <Card className="border-white/10 bg-[#121212]">
            <CardContent className="py-6">
              <div className="flex items-center gap-2 text-[#8BFF61]">
                <span>★★★★★</span>
              </div>
              <p className="mt-2 text-sm text-[#D9D9D9]/80">
                “This platform changed how we reach our local customers. It’s authentic and
                effective.”
              </p>
              <p className="mt-3 text-xs text-[#D9D9D9]/60">Sarah Martinez — Owner, Local Coffee House</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <h3 className="text-2xl font-semibold text-[#D9D9D9]">Ready to start advertising differently</h3>
          <p className="mt-2 text-sm text-[#D9D9D9]/70">
            Join our community of brand ambassadors and local businesses creating meaningful connections.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link href="/auth/signup?type=business"><Button className="bg-[#8BFF61] text-[#0f0f0f] hover:bg-[#8BFF61]/90">Create campaign</Button></Link>
            <Link href="/auth/signup?type=advertiser"><Button variant="outline" className="border-white/20 text-[#D9D9D9]">Join as talent</Button></Link>
          </div>
        </div>
        <div className="mx-auto mt-10 max-w-5xl px-6">
          <div className="overflow-hidden rounded-xl border border-white/10">
            <Image src="/placeholder.svg?height=520&width=1024" alt="Showcase" width={1024} height={520} className="h-auto w-full object-cover" />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-10 px-6 text-sm text-[#D9D9D9]/70 md:grid-cols-5">
          <div className="col-span-2 md:col-span-1">
            <div className="text-lg font-semibold text-[#D9D9D9]">Human<span className="text-[#8BFF61]">Billboard</span></div>
            <p className="mt-2 text-xs">© {new Date().getFullYear()} All rights reserved.</p>
          </div>
          <div>
            <div className="mb-3 text-[#D9D9D9]">Platform</div>
            <ul className="space-y-2">
              <li><Link href="/advertiser/campaigns" className="hover:text-[#D9D9D9]">Campaigns</Link></li>
              <li><Link href="/business/dashboard" className="hover:text-[#D9D9D9]">For businesses</Link></li>
              <li><Link href="#" className="hover:text-[#D9D9D9]">Pricing</Link></li>
            </ul>
          </div>
          <div>
            <div className="mb-3 text-[#D9D9D9]">About</div>
            <ul className="space-y-2">
              <li><Link href="#" className="hover:text-[#D9D9D9]">Our mission</Link></li>
              <li><Link href="#" className="hover:text-[#D9D9D9]">Careers</Link></li>
              <li><Link href="#" className="hover:text-[#D9D9D9]">Contact</Link></li>
            </ul>
          </div>
          <div>
            <div className="mb-3 text-[#D9D9D9]">Resources</div>
            <ul className="space-y-2">
              <li><Link href="#" className="hover:text-[#D9D9D9]">Guides</Link></li>
              <li><Link href="#" className="hover:text-[#D9D9D9]">Support</Link></li>
              <li><Link href="#" className="hover:text-[#D9D9D9]">Community</Link></li>
            </ul>
          </div>
          <div>
            <div className="mb-3 text-[#D9D9D9]">Legal</div>
            <ul className="space-y-2">
              <li><Link href="#" className="hover:text-[#D9D9D9]">Terms</Link></li>
              <li><Link href="#" className="hover:text-[#D9D9D9]">Privacy</Link></li>
              <li><Link href="#" className="hover:text-[#D9D9D9]">Cookies</Link></li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  )
}
