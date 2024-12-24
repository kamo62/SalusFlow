import Link from 'next/link'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger, Button } from '@/components/ui'

const FAQ_ITEMS = [
  {
    question: 'What is included in the 30-day free trial?',
    answer: 'The free trial includes full access to all features of our Cloud Solution plan. You can use all features without any restrictions for 30 days. No credit card is required to start the trial.'
  },
  {
    question: 'Can I switch between monthly and annual billing?',
    answer: 'Yes, you can switch between monthly and annual billing at any time. When switching to annual billing, you will immediately start saving up to 16.7% on your subscription.'
  },
  {
    question: 'What happens after the free trial ends?',
    answer: 'After the 30-day trial period, you will need to choose a plan to continue using SalusFlow. We will notify you before the trial ends, and you can choose to subscribe or cancel at any time.'
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards, debit cards, and EFT payments. For Enterprise plans, we can also accommodate purchase orders and bank transfers.'
  },
  {
    question: 'Is there a setup fee?',
    answer: 'No, there are no setup fees for our Cloud Solution or Self-Hosted Pro plans. For Enterprise deployments, setup fees may apply based on your specific requirements.'
  },
  {
    question: 'Can I cancel my subscription at any time?',
    answer: 'Yes, you can cancel your subscription at any time. For monthly plans, you will have access until the end of your current billing period. For annual plans, we offer prorated refunds for the unused portion.'
  },
  {
    question: 'Do you offer discounts for multiple practices?',
    answer: 'Yes, we offer volume discounts for multiple practices. Please contact our sales team for custom pricing based on your needs.'
  },
  {
    question: 'What kind of support is included?',
    answer: 'Cloud Solution includes 24/7 premium support. Self-Hosted Pro includes basic support with 48-hour response time. Enterprise plans include dedicated support options.'
  }
]

export default function FAQPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Frequently Asked Questions</h1>
        <p className="text-xl text-muted-foreground">
          Everything you need to know about our pricing and plans
        </p>
      </div>

      <div className="max-w-3xl mx-auto mb-12">
        <Accordion type="single" collapsible>
          {FAQ_ITEMS.map((item, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger>{item.question}</AccordionTrigger>
              <AccordionContent>{item.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      <div className="text-center">
        <p className="text-muted-foreground mb-6">
          Still have questions? We're here to help.
        </p>
        <div className="flex justify-center gap-4">
          <Button variant="outline" asChild>
            <Link href="/contact">Contact Sales</Link>
          </Button>
          <Button asChild>
            <Link href="/pricing">View Pricing</Link>
          </Button>
        </div>
      </div>
    </div>
  )
} 