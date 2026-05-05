"use client";

import { useState, useRef, useEffect } from "react";
import { C } from "@/lib/tokens";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTED_PROMPTS = [
  "Compare 5-year MYGA options for a $250K client",
  "Explain MVA and when it matters",
  "What's the current rate environment for MYGAs?",
  "Best RILA buffer strategies for conservative clients",
];

function MessageBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === "user";
  const disclaimerIdx = msg.content.indexOf("\n---\n*This output");
  const mainText = disclaimerIdx >= 0 ? msg.content.slice(0, disclaimerIdx) : msg.content;
  const hasDisclaimer = disclaimerIdx >= 0;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: isUser ? "flex-end" : "flex-start",
        marginBottom: 12,
      }}
    >
      <div
        style={{
          maxWidth: "85%",
          background: isUser ? C.blue : C.surface,
          color: isUser ? "#fff" : C.text,
          borderRadius: isUser ? "16px 16px 4px 16px" : "4px 16px 16px 16px",
          padding: "10px 14px",
          fontSize: 13,
          lineHeight: 1.6,
          whiteSpace: "pre-wrap",
          border: isUser ? "none" : `1px solid ${C.border}`,
        }}
      >
        {isUser ? (
          msg.content
        ) : (
          <>
            {mainText}
            {hasDisclaimer && (
              <div
                style={{
                  marginTop: 10,
                  paddingTop: 10,
                  borderTop: `1px solid ${C.border}`,
                  fontSize: 11,
                  color: C.textDim,
                  fontStyle: "italic",
                }}
              >
                This output is for research and informational purposes only. It does not constitute a product recommendation or investment advice. Suitability determinations require a full assessment of the client&apos;s financial situation by a licensed professional.
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", marginBottom: 12 }}>
      <div
        style={{
          background: C.surface,
          border: `1px solid ${C.border}`,
          borderRadius: "4px 16px 16px 16px",
          padding: "10px 16px",
          display: "flex",
          gap: 4,
          alignItems: "center",
        }}
      >
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: C.textDim,
              animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

export function YieldBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingText, loading]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  async function send(text?: string) {
    const content = (text ?? input).trim();
    if (!content || loading) return;

    const userMsg: Message = { role: "user", content };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    setStreamingText("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!res.ok) throw new Error("API error");

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let full = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        full += decoder.decode(value, { stream: true });
        setStreamingText(full);
      }

      setMessages((prev) => [...prev, { role: "assistant", content: full }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "I encountered an error processing your request. Please try again.\n\n---\n*This output is for research and informational purposes only. It does not constitute a product recommendation or investment advice. Suitability determinations require a full assessment of the client's financial situation by a licensed professional.*",
        },
      ]);
    } finally {
      setLoading(false);
      setStreamingText("");
    }
  }

  return (
    <>
      <style>{`
        @keyframes pulse {
          0%, 80%, 100% { transform: scale(0.7); opacity: 0.5; }
          40% { transform: scale(1); opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>

      {/* FAB */}
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          position: "fixed",
          bottom: 28,
          right: 28,
          width: 52,
          height: 52,
          borderRadius: "50%",
          background: open ? C.surface : C.blue,
          border: open ? `1px solid ${C.border}` : "none",
          color: open ? C.textDim : "#fff",
          fontSize: open ? 20 : 22,
          cursor: "pointer",
          zIndex: 1000,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
          transition: "all 0.2s",
        }}
        title={open ? "Close YieldBot" : "Open YieldBot"}
      >
        {open ? "✕" : "◈"}
      </button>

      {/* Chat panel */}
      {open && (
        <div
          style={{
            position: "fixed",
            bottom: 92,
            right: 28,
            width: 400,
            height: 560,
            background: C.bg,
            border: `1px solid ${C.border}`,
            borderRadius: 16,
            display: "flex",
            flexDirection: "column",
            zIndex: 999,
            boxShadow: "0 8px 40px rgba(0,0,0,0.5)",
            animation: "slideUp 0.2s ease-out",
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "14px 18px",
              borderBottom: `1px solid ${C.border}`,
              display: "flex",
              alignItems: "center",
              gap: 10,
              background: C.surface,
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: C.blue,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 16,
                color: "#fff",
              }}
            >
              ◈
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>YieldBot</div>
              <div style={{ fontSize: 11, color: C.textDim }}>AI Research Assistant · Not financial advice</div>
            </div>
            <div
              style={{
                marginLeft: "auto",
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "#22c55e",
              }}
            />
          </div>

          {/* Messages */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "16px 14px",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {messages.length === 0 && !loading && (
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 13, color: C.textDim, marginBottom: 16, lineHeight: 1.5 }}>
                  Research MYGAs, RILAs, rate environments, and product features. Ask anything.
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {SUGGESTED_PROMPTS.map((p) => (
                    <button
                      key={p}
                      onClick={() => send(p)}
                      style={{
                        background: C.surface,
                        border: `1px solid ${C.border}`,
                        borderRadius: 8,
                        padding: "8px 12px",
                        fontSize: 12,
                        color: C.text,
                        cursor: "pointer",
                        textAlign: "left",
                        transition: "border-color 0.15s",
                      }}
                      onMouseEnter={(e) =>
                        ((e.currentTarget as HTMLButtonElement).style.borderColor = C.blue)
                      }
                      onMouseLeave={(e) =>
                        ((e.currentTarget as HTMLButtonElement).style.borderColor = C.border)
                      }
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m, i) => (
              <MessageBubble key={i} msg={m} />
            ))}

            {loading && !streamingText && <TypingIndicator />}

            {streamingText && (
              <MessageBubble
                msg={{ role: "assistant", content: streamingText + "▌" }}
              />
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div
            style={{
              padding: "12px 14px",
              borderTop: `1px solid ${C.border}`,
              display: "flex",
              gap: 8,
              background: C.surface,
            }}
          >
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
              placeholder="Ask about products, rates, or strategy..."
              disabled={loading}
              style={{
                flex: 1,
                background: C.bg,
                border: `1px solid ${C.border}`,
                borderRadius: 8,
                padding: "8px 12px",
                fontSize: 13,
                color: C.text,
                outline: "none",
                fontFamily: "inherit",
              }}
            />
            <button
              onClick={() => send()}
              disabled={loading || !input.trim()}
              style={{
                background: loading || !input.trim() ? C.border : C.blue,
                border: "none",
                borderRadius: 8,
                width: 36,
                height: 36,
                cursor: loading || !input.trim() ? "not-allowed" : "pointer",
                color: "#fff",
                fontSize: 16,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "background 0.15s",
                flexShrink: 0,
              }}
            >
              ↑
            </button>
          </div>
        </div>
      )}
    </>
  );
}
