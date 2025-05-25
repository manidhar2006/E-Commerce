"use client";

import React, { useState, useEffect, useRef } from "react";
import { Container, TextField, Button, Typography, Paper, Box } from "@mui/material";

export default function Support() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const chatEndRef = useRef(null);

    const sendMessage = async () => {
        if (!input.trim()) return;
        const userMessage = { role: "user", content: input };
        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setLoading(true);

        try {
            const response = await fetch("http://localhost:5000/api/support", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ messages: [...messages, userMessage] }),
            });
            
            if (!response.ok) throw new Error("Chatbot request failed");

            const data = await response.json();
            const botMessage = { role: "bot", content: data.response };
            setMessages((prev) => [...prev, botMessage]);
        } catch (error) {
            console.error("Error:", error);
            setMessages((prev) => [...prev, { role: "bot", content: "Something went wrong. Try again later!" }]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    return (
        <Container maxWidth="sm" sx={{ mt: 4, minHeight: "85vh" }}>
            <Typography variant="h4" gutterBottom>Chat Support</Typography>
            <Paper sx={{ p: 2, maxHeight: "60vh", overflowY: "auto", mb: 2, borderRadius: 2 }}>
                {messages.map((msg, index) => (
                    <Box key={index} sx={{ textAlign: msg.role === "user" ? "right" : "left", mb: 1 }}>
                        <Typography
                            variant="body1"
                            sx={{
                                backgroundColor: msg.role === "user" ? "#4CAF50" : "#f1f1f1",
                                color: msg.role === "user" ? "#fff" : "#000",
                                p: 1,
                                borderRadius: 1,
                                display: "inline-block",
                                maxWidth: "80%"
                            }}
                        >
                            {msg.content}
                        </Typography>
                    </Box>
                ))}
                <div ref={chatEndRef} />
            </Paper>

            <TextField
                fullWidth
                variant="outlined"
                placeholder="Type your message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                disabled={loading}
                sx={{ mb: 2 }}
            />
            <Button 
                variant="contained" 
                color="primary" 
                onClick={sendMessage} 
                fullWidth 
                disabled={loading}
            >
                {loading ? "Sending..." : "Send"}
            </Button>
        </Container>
    );
}
