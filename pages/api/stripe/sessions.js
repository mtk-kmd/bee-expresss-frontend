import Stripe from "stripe";

const stripe = new Stripe(process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY);

export default async function handler(req, res) {
    if (req.method !== "GET") {
        return res.status(405).json({ message: "Method not allowed" });
    }

    try {
        const sessions = await stripe.checkout.sessions.list({
            limit: 100,
            expand: ["data.line_items"],
        });

        res.status(200).json(sessions);
    } catch (error) {
        console.error("Stripe error:", error);
        res.status(500).json({ message: "Error fetching sessions", error: error.message });
    }
}
