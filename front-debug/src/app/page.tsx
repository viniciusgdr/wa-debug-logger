"use client";

import { useState, useEffect, useRef } from "react";
import WhatsmeowLogs from "./components/WhatsmeowLogs";
import OtherLogs from "./components/OtherLogs";

type Message = {
  type: string;
  content: string;
  timestamp: number;
};

export default function Home() {
  const [whatsmeowMessages, setWhatsmeowMessages] = useState<any[]>([]);
  const [otherMessages, setOtherMessages] = useState<any[]>([]);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    // Substitua 'YOUR_WEBSOCKET_URL' pela URL real do seu WebSocket
    wsRef.current = new WebSocket("ws://localhost:8080");

    wsRef.current.onopen = () => {
      console.log("WebSocket connection established");
      // send tag frontapp
      wsRef.current?.send(
        JSON.stringify({
          tag: "frontapp",
        })
      );
    };

    wsRef.current.onmessage = (event) => {
      const message: Message = JSON.parse(event.data);
      if (message.type === "whatsmeow") {
        setWhatsmeowMessages((prev) => [...prev, message]);
      } else {
        setOtherMessages((prev) => [...prev, message]);
      }
    };

    wsRef.current.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    wsRef.current.onclose = () => {
      console.log("WebSocket connection closed");
    };

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  return (
    <main className="grid grid-cols-2 h-screen">
      <WhatsmeowLogs messages={whatsmeowMessages} />
      <OtherLogs messages={otherMessages} />
    </main>
  );
}
