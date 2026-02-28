import { FormEvent, useMemo, useState } from "react";
import { MessageCircle, Send, X } from "lucide-react";
import { aiApi } from "../../api/ai";
import { useAuth } from "../../context/AuthContext";

type Message = {
  id: string;
  from: "user" | "assistant";
  text: string;
};

export function ChatAssistant() {
  const { isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      from: "assistant",
      text: "Hello. I can help with products, pricing, stock, recommendations, and order status.",
    },
  ]);

  const hint = useMemo(
    () =>
      isAuthenticated
        ? "Ask about products, stock, checkout, orders"
        : "Ask about products, pricing, and stock (login required for order tracking)",
    [isAuthenticated],
  );

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!input.trim() || loading) {
      return;
    }

    const question = input.trim();
    setInput("");
    setLoading(true);
    setMessages((prev) => [...prev, { id: crypto.randomUUID(), from: "user", text: question }]);

    try {
      const response = await aiApi.chat(question);
      setMessages((prev) => [...prev, { id: crypto.randomUUID(), from: "assistant", text: response.reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          from: "assistant",
          text: "I could not process that request right now. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-40">
      {open ? (
        <div className="w-[320px] rounded-2xl border border-red-200 bg-white shadow-card md:w-[360px]">
          <div className="flex items-center justify-between border-b border-red-100 bg-brand-red px-4 py-3 text-white">
            <h4 className="font-display text-sm font-semibold">RedCart AI Assistant</h4>
            <button type="button" onClick={() => setOpen(false)}>
              <X size={16} />
            </button>
          </div>

          <div className="max-h-72 space-y-3 overflow-y-auto p-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`max-w-[90%] rounded-xl px-3 py-2 text-sm ${
                  message.from === "user"
                    ? "ml-auto bg-brand-red text-white"
                    : "bg-zinc-100 text-zinc-700"
                }`}
              >
                {message.text}
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="border-t border-zinc-200 p-3">
            <p className="mb-2 text-xs text-zinc-500">{hint}</p>
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Type your message"
                className="flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-brand-red"
              />
              <button
                type="submit"
                disabled={loading}
                className="rounded-lg bg-brand-red px-3 text-white disabled:opacity-50"
              >
                <Send size={14} />
              </button>
            </div>
          </form>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 rounded-full bg-brand-red px-4 py-3 text-sm font-semibold text-white shadow-card transition hover:bg-brand-deep"
        >
          <MessageCircle size={16} /> AI Assistant
        </button>
      )}
    </div>
  );
}
