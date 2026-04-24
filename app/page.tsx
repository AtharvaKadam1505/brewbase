import Link from 'next/link'
import { Coffee, Zap, Users, TrendingUp, ArrowRight, Star } from 'lucide-react'
import NavBar from '@/components/layout/Navbar'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-surface-light overflow-hidden">
      <NavBar />

      {/* Hero */}
      <section className="pt-32 pb-20 px-4 relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 -right-32 w-96 h-96 bg-brand-primary/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-10 -left-20 w-80 h-80 bg-brand-secondary/15 rounded-full blur-3xl" />
        </div>

        <div className="max-w-4xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 badge-primary mb-6 text-sm px-4 py-1.5">
            <Star className="w-3.5 h-3.5" />
            <span>The warmest way to support creators</span>
          </div>

          <h1 className="font-display text-5xl sm:text-7xl font-bold text-text-light leading-tight mb-6">
            Support creators<br />
            <span className="text-gradient">you truly love</span>
          </h1>

          <p className="text-xl text-text-muted max-w-2xl mx-auto mb-10 leading-relaxed">
            One-time tips or monthly memberships — BrewBase helps creators earn from their passion with zero hassle.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/sign-up" className="btn-primary text-base px-8 py-3.5 flex items-center gap-2">
              Start your page <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/explore" className="btn-secondary text-base px-8 py-3.5">
              Explore creators
            </Link>
          </div>

          <p className="mt-6 text-sm text-text-muted">Free to start · No monthly fees · Razorpay-powered</p>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 bg-surface-card border-y border-border-light">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-display text-3xl font-bold text-center text-text-light mb-12">
            Everything you need to get supported
          </h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              {
                icon: <Coffee className="w-6 h-6" />,
                title: 'One-time tips',
                desc: 'Accept instant coffee-sized donations from your fans with a personal message.',
              },
              {
                icon: <Users className="w-6 h-6" />,
                title: 'Monthly memberships',
                desc: 'Build recurring income with tier-based subscriptions and exclusive content.',
              },
              {
                icon: <TrendingUp className="w-6 h-6" />,
                title: 'Real-time dashboard',
                desc: 'Track supporters, messages, and earnings in one beautiful place.',
              },
            ].map((f, i) => (
              <div key={i} className={`card p-6 animate-fade-up stagger-${i + 1}`} style={{ opacity: 0 }}>
                <div className="w-12 h-12 rounded-2xl bg-orange-100 text-brand-primary flex items-center justify-center mb-4">
                  {f.icon}
                </div>
                <h3 className="font-display text-lg font-bold text-text-light mb-2">{f.title}</h3>
                <p className="text-text-muted text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <Zap className="w-10 h-10 text-brand-secondary mx-auto mb-4" />
          <h2 className="font-display text-4xl font-bold text-text-light mb-4">
            Ready to brew something great?
          </h2>
          <p className="text-text-muted mb-8">
            Set up your creator page in under 2 minutes.
          </p>
          <Link href="/sign-up" className="btn-primary text-base px-8 py-3.5 inline-flex items-center gap-2">
            Create your page free <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border-light py-8 px-4 text-center text-text-muted text-sm">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Coffee className="w-4 h-4 text-brand-primary" />
          <span className="font-display font-bold text-text-light">BrewBase</span>
        </div>
        <p>© {new Date().getFullYear()} BrewBase. Made with ☕ for creators everywhere.</p>
      </footer>
    </div>
  )
}