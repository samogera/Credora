
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Mail, Phone } from "lucide-react";

const faqs = [
    {
        question: "What is a Credora Score?",
        answer: "Your Credora Score is a comprehensive, decentralized credit score calculated using a blend of your on-chain Stellar activity and verified off-chain financial data. It's designed to provide a fairer, more holistic view of your creditworthiness than traditional scoring models."
    },
    {
        question: "Is my data secure?",
        answer: "Yes. Security is our top priority. You have full control over what data you share. Off-chain documents are encrypted and stored on decentralized networks like IPFS, and we only anchor a verifiable proof of your score on the Soroban smart contract, not the raw data itself."
    },
    {
        question: "How can I improve my score?",
        answer: "You can improve your score by demonstrating consistent financial responsibility. This includes maintaining healthy Stellar account activity, paying utility bills on time, and linking verified off-chain identifiers. Our AI provides personalized suggestions on your dashboard."
    },
    {
        question: "Which wallets are supported?",
        answer: "Credora supports a variety of Stellar wallets. Our primary recommended wallet is Freighter, but you can also connect using Albedo, xBull, and other wallets that adhere to Stellar's standards. We aim to be as inclusive as possible."
    },
    {
        question: "How do loan applications work?",
        answer: "Once you have a Credora Score, you can browse and apply for loans from our lending partners directly from your dashboard. Your score is securely shared with the lender, who then reviews your application. Approvals and loan agreements are executed via secure Soroban smart contracts."
    },
];


export default function SupportPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="space-y-4 mb-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-primary">Support Center</h1>
        <p className="text-xl text-muted-foreground">
          Have questions? We're here to help.
        </p>
      </div>
      
      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-2">
            <Card>
                <CardHeader>
                    <CardTitle>Frequently Asked Questions</CardTitle>
                    <CardDescription>Find answers to the most common questions about Credora.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                        {faqs.map((faq, index) => (
                             <AccordionItem value={`item-${index + 1}`} key={index}>
                                <AccordionTrigger>{faq.question}</AccordionTrigger>
                                <AccordionContent>
                                    {faq.answer}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </CardContent>
            </Card>
        </div>

        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Contact Us</CardTitle>
                    <CardDescription>Can't find your answer? Reach out directly.</CardDescription>
                </CardHeader>
                 <CardContent className="space-y-4">
                    <div className="flex items-start gap-4">
                        <Mail className="h-6 w-6 text-primary mt-1" />
                        <div>
                            <h4 className="font-semibold">Email Support</h4>
                            <p className="text-sm text-muted-foreground">support@credora.app</p>
                        </div>
                    </div>
                     <div className="flex items-start gap-4">
                        <Phone className="h-6 w-6 text-primary mt-1" />
                        <div>
                            <h4 className="font-semibold">Phone Support</h4>
                            <p className="text-sm text-muted-foreground">(+1) 555-123-4567</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
