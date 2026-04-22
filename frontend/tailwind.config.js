export default {
    content: ["./index.html", "./src/**/*.{ts,tsx}"],
    theme: {
        extend: {
            colors: {
                moss: "#2E7D32",
                leaf: "#4CAF50",
                sage: "#A5D6A7",
                bark: "#8D6E63",
                cream: "#F5F5DC",
                mist: "#F7F5EF",
            },
            fontFamily: {
                heading: ["Poppins", "sans-serif"],
                body: ["Inter", "sans-serif"],
            },
            boxShadow: {
                soft: "0 18px 40px rgba(46, 125, 50, 0.12)",
            },
            backgroundImage: {
                hero: "radial-gradient(circle at top left, rgba(165,214,167,0.45), transparent 35%), linear-gradient(135deg, #f7f5ef 0%, #ffffff 55%, #eef8ef 100%)",
            },
        },
    },
    plugins: [],
};
