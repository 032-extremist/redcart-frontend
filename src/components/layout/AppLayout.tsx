import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { ChatAssistant } from "../chat/ChatAssistant";

export function AppLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50/40 via-white to-zinc-50 font-body text-brand-ink">
      <Navbar />
      <main className="mx-auto w-full max-w-7xl px-4 py-6">
        <Outlet />
      </main>
      <Footer />
      <ChatAssistant />
    </div>
  );
}
