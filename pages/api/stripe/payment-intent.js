import Stripe from "stripe";

const stripe = new Stripe(process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY);

export default async function handler(req, res) {
    if (req.method !== "GET") {
        return res.status(405).json({ message: "Method not allowed" });
    }

    const { payment_intent_id } = req.query;

    if (!payment_intent_id) {
        return res.status(400).json({ message: "Payment Intent ID is required" });
    }

    try {
        const paymentIntent = await stripe.paymentIntents.retrieve(payment_intent_id);
        res.status(200).json(paymentIntent);
    } catch (error) {
        console.error("Stripe error:", error);
        res.status(500).json({ message: "Error retrieving payment intent", error: error.message });
    }
}