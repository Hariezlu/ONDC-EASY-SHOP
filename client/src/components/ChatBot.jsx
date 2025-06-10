import React, { useState, useEffect, useRef } from "react";

const ChatBot = () => {
  const [messages, setMessages] = useState([
    { from: "bot", text: "Hi! How can I help you today?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [expectingOrderId, setExpectingOrderId] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleUserInput = async () => {
    if (!input.trim() || loading) return;
    setLoading(true);

    const userMessage = { from: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);

    let botMessage;
    if (expectingOrderId) {
      botMessage = getDummyTrackingDetails(input.trim());
      setExpectingOrderId(false);
    } else {
      botMessage = await generateBotReply(input);
    }

    setMessages((prev) => [...prev, botMessage]);
    setInput("");
    setLoading(false);
  };

  const getDummyTrackingDetails = (orderId) => {
    const trackingDetails = `
Order ID: ${orderId}
Status: In Transit

Tracking History:
- 2025-05-17 10:30 AM: Order Placed
- 2025-05-18 02:00 PM: Packed at warehouse
- 2025-05-19 09:45 AM: Shipped via Flipkart Logistics
- 2025-05-20 04:20 PM: Out for delivery
- 2025-05-20 08:00 PM: Delivered (left at doorstep)
    `;

    return { from: "bot", text: trackingDetails.trim() };
  };

  const generateBotReply = async (msg) => {
    const lower = msg.toLowerCase();

    if (lower.includes("order") && lower.includes("track")) {
      setExpectingOrderId(true);
      return {
        from: "bot",
        text: "Please provide your order ID to track your order.",
      };
    } else if (lower.includes("return")) {
      return {
        from: "bot",
        text: "You can return products within 7 days from delivery.",
      };
    } else if (lower.includes("recommend") || lower.includes("suggest")) {
      try {
        const response = await fetch(
          "http://localhost:5050/api/products/recommend?category=electronics"
        );
        const products = await response.json();
        const productList = products.map((p) => `• ${p.name}`).join("\n");

        return {
          from: "bot",
          text: `Here are some product recommendations for you:\n${productList}`,
        };
      } catch (error) {
        return {
          from: "bot",
          text: "Sorry, I couldn't fetch product recommendations right now.",
        };
      }
    } else if (lower.includes("shipping")) {
      return {
        from: "bot",
        text: "Standard shipping takes 3–5 business days.",
      };
    } else if (lower.includes("hello") || lower.includes("hi")) {
      return {
        from: "bot",
        text: "Hello! How can I assist you today?",
      };
    } else if (lower.includes("cancel")) {
      return {
        from: "bot",
        text: "Yes, you can cancel your order before it's shipped. Go to 'My Orders' > Select order > Cancel.",
      };
    } else if (
      lower.includes("payment") ||
      lower.includes("pay later") ||
      lower.includes("emi") ||
      lower.includes("upi")
    ) {
      return {
        from: "bot",
        text: "We accept UPI, debit/credit cards, net banking, and also offer EMI and 'Pay Later' options.",
      };
    } else if (lower.includes("available") || lower.includes("in stock")) {
      return {
        from: "bot",
        text: "To check product availability, please search for the product on our site. If it's out of stock, it will be mentioned clearly.",
      };
    } else if (
      lower.includes("offer") ||
      lower.includes("discount") ||
      lower.includes("sale")
    ) {
      return {
        from: "bot",
        text: "Yes! We have seasonal and bank offers. Please check the home page banners or product pages for current deals.",
      };
    } else if (
      lower.includes("support") ||
      lower.includes("help") ||
      lower.includes("customer care")
    ) {
      return {
        from: "bot",
        text: "You can reach our support team at support@example.com or call 1800-123-4567 (9 AM to 6 PM, Mon–Sat).",
      };
    } else if (
      lower.includes("delivery time") ||
      lower.includes("how long") ||
      lower.includes("when will") ||
      lower.includes("when can i get")
    ) {
      return {
        from: "bot",
        text: "Standard delivery takes 3–5 business days. For metro cities, delivery is usually quicker.",
      };
    } else if (
      lower.includes("warranty") ||
      lower.includes("guarantee") ||
      lower.includes("protect")
    ) {
      return {
        from: "bot",
        text: "Most electronics come with brand warranty. You can also buy extended warranty plans during checkout.",
      };
    } else if (lower.includes("prime") || lower.includes("flipkart plus")) {
      return {
        from: "bot",
        text: "Amazon Prime/Flipkart Plus offers free delivery, early access to deals, and exclusive benefits. Check your account for eligibility.",
      };
    }

    return {
      from: "bot",
      text: "Sorry, I didn't understand that. Can you please rephrase?",
    };
  };

  return (
    <>
      {/* Chat Toggle Icon Button */}
      {!isChatOpen && (
        <button
          onClick={() => setIsChatOpen(true)}
          style={{
            position: "fixed",
            bottom: "20px",
            right: "20px",
            width: "50px",
            height: "50px",
            borderRadius: "50%",
            backgroundColor: "#007bff",
            color: "#fff",
            fontSize: "24px",
            border: "none",
            cursor: "pointer",
            boxShadow: "0px 2px 10px rgba(0,0,0,0.2)",
            zIndex: 1000,
          }}
        >
          💬
        </button>
      )}

      {/* Chat Window */}
      {isChatOpen && (
        <div
          style={{
            position: "fixed",
            bottom: "20px",
            right: "20px",
            width: "320px",
            background: "#f9f9f9",
            border: "1px solid #ccc",
            borderRadius: "12px",
            padding: "16px",
            boxShadow: "0px 2px 10px rgba(0,0,0,0.2)",
            fontFamily: "Arial, sans-serif",
            fontSize: "14px",
            zIndex: 1000,
          }}
        >
          {/* Close Button */}
          <div style={{ textAlign: "right", marginBottom: "5px" }}>
            <button
              onClick={() => setIsChatOpen(false)}
              style={{
                background: "transparent",
                border: "none",
                fontSize: "16px",
                cursor: "pointer",
              }}
            >
              ❌
            </button>
          </div>

          {/* Chat Messages */}
          <div
            style={{
              height: "250px",
              overflowY: "auto",
              marginBottom: "10px",
              whiteSpace: "pre-wrap",
              paddingRight: "10px",
            }}
          >
            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  textAlign: msg.from === "bot" ? "left" : "right",
                  margin: "8px 0",
                }}
              >
                <span
                  style={{
                    background: msg.from === "bot" ? "#e1e1e1" : "#cce5ff",
                    padding: "8px 12px",
                    borderRadius: "18px",
                    display: "inline-block",
                    whiteSpace: "pre-wrap",
                    maxWidth: "80%",
                    wordWrap: "break-word",
                  }}
                >
                  {msg.text}
                </span>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input */}
          <div style={{ display: "flex" }}>
            <input
              style={{
                flexGrow: 1,
                padding: "8px",
                borderRadius: "8px",
                border: "1px solid #ccc",
              }}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleUserInput()}
              placeholder="Type your message..."
              disabled={loading}
            />
            <button
              onClick={handleUserInput}
              disabled={loading}
              style={{
                marginLeft: "5px",
                padding: "8px 14px",
                borderRadius: "8px",
                border: "none",
                background: loading ? "#aaa" : "#007bff",
                color: "#fff",
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              ➤
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBot;
