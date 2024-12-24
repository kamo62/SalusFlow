import Link from 'next/link'
import { Button, Card, Badge, CheckCircle } from '@/components/ui'
import { PricingDialog } from '@/components/pricing/dialog'

const PRICING = {
  SAAS: {
    name: 'Cloud Solution',
    monthly: 1200,
    annual: 12000,
    features: [
      'Automatic updates & backups',
      'Premium 24/7 support',
      'Cloud hosting included',
      'Automatic scaling',
      'Real-time sync across devices',
      'Advanced analytics',
      'Priority feature requests'
    ]
  },
  SELF_HOSTED_SUB: {
    name: 'Self-Hosted Pro',
    monthly: 1100,
    annual: 11000,
    features: [
      'Full source code access',
      'Basic support (48h response)',
      'All features included',
      'Manual updates',
      'Security patches',
      'Community access',
      'Custom deployment options'
    ]
  },
  SELF_HOSTED_PERPETUAL: {
    name: 'Enterprise',
    contactSales: true,
    features: [
      'One-time payment',
      'Initial setup support',
      'One major version update',
      'Source code access',
      'Custom deployment',
      'Basic onboarding',
      'Migration assistance'
    ]
  }
}

export default function PricingPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h1>
        <p className="text-xl text-muted-foreground">
          Choose the perfect plan for your practice
        </p>
      </div>

      {/* Free Trial Banner */}
      <div className="bg-primary/10 rounded-lg p-6 mb-12 text-center">
        <h2 className="text-2xl font-semibold mb-2">
          Try SalusFlow Free for 30 Days
        </h2>
        <p className="text-muted-foreground mb-4">
          No credit card required. Full access to all features.
        </p>
        <Button variant="default" size="lg" asChild>
          <Link href="/signup">Start Free Trial</Link>
        </Button>
      </div>

      <div className="grid md:grid-cols-3 gap-8 mb-12">
        {/* SaaS Plan */}
        <Card className="p-6 relative">
          <Badge className="absolute top-4 right-4" variant="secondary">
            Most Popular
          </Badge>
          <h3 className="text-2xl font-bold mb-2">{PRICING.SAAS.name}</h3>
          <div className="mb-4">
            <span className="text-3xl font-bold">R{PRICING.SAAS.monthly}</span>
            <span className="text-muted-foreground">/month</span>
          </div>
          <p className="text-muted-foreground mb-6">
            or R{PRICING.SAAS.annual / 12}/month billed annually
          </p>
          <Button className="w-full mb-6" asChild>
            <Link href="/signup">Get Started</Link>
          </Button>
          <ul className="space-y-3">
            {PRICING.SAAS.features.map((feature, index) => (
              <li key={index} className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </Card>

        {/* Self-Hosted Subscription */}
        <Card className="p-6">
          <h3 className="text-2xl font-bold mb-2">{PRICING.SELF_HOSTED_SUB.name}</h3>
          <div className="mb-4">
            <span className="text-3xl font-bold">R{PRICING.SELF_HOSTED_SUB.monthly}</span>
            <span className="text-muted-foreground">/month</span>
          </div>
          <p className="text-muted-foreground mb-6">
            or R{PRICING.SELF_HOSTED_SUB.annual / 12}/month billed annually
          </p>
          <Button className="w-full mb-6" variant="outline" asChild>
            <Link href="/signup">Select Plan</Link>
          </Button>
          <ul className="space-y-3">
            {PRICING.SELF_HOSTED_SUB.features.map((feature, index) => (
              <li key={index} className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </Card>

        {/* Self-Hosted Perpetual */}
        <Card className="p-6">
          <h3 className="text-2xl font-bold mb-2">{PRICING.SELF_HOSTED_PERPETUAL.name}</h3>
          <div className="mb-4">
            <span className="text-3xl font-bold">Custom Quote</span>
          </div>
          <p className="text-muted-foreground mb-6">
            One-time payment for perpetual license
          </p>
          <Button className="w-full mb-6" variant="outline" asChild>
            <Link href="/contact">Contact Sales</Link>
          </Button>
          <ul className="space-y-3">
            {PRICING.SELF_HOSTED_PERPETUAL.features.map((feature, index) => (
              <li key={index} className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <PricingDialog />

      <div className="text-center mt-12">
        <Button variant="link" asChild>
          <Link href="/pricing/faq">
            View Frequently Asked Questions
          </Link>
        </Button>
      </div>
    </div>
  )
} 