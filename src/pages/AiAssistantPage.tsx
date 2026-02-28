import { FormEvent, useState } from "react";
import { aiApi } from "../api/ai";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
}

export function AiAssistantPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async (event: FormEvent) => {
    event.preventDefault();
    if (!input.trim() || loading) {
      return;
    }

    const text = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: "user", text }]);
    setLoading(true);

    try {
      const response = await aiApi.chat(text);
      setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: "assistant", text: response.reply }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl rounded-2xl border border-zinc-200 bg-white p-6 shadow-soft">
      <h1 className="font-display text-3xl font-semibold">AI Assistant Interface</h1>
      <p className="mt-1 text-sm text-zinc-600">
        Ask for product recommendations, pricing, stock availability, or order tracking.
      </p>
      <p className="mt-2 text-xs text-zinc-500">Order tracking queries require login. Product support works for guests.</p>

      <div className="mt-5 h-[420px] space-y-3 overflow-y-auto rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
        {messages.length === 0 && (
          <p className="text-sm text-zinc-500">Start by asking something like: "Recommend a laptop under $1200".</p>
        )}
        {messages.map((message) => (
          <div
            key={message.id}
            className={`max-w-[85%] rounded-xl px-4 py-2 text-sm ${
              message.role === "user"
                ? "ml-auto bg-brand-red text-white"
                : "bg-white text-zinc-700 shadow-soft"
            }`}
          >
            {message.text}
          </div>
        ))}
      </div>

      <form onSubmit={handleSend} className="mt-4 flex gap-2">
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Type your question"
          className="flex-1 rounded-xl border border-zinc-300 px-4 py-3 text-sm"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-brand-red px-6 py-3 text-sm font-semibold text-white"
        >
          {loading ? "Sending..." : "Send"}
        </button>
      </form>
    </div>
  );
}
