"use client";

import { useState, useEffect, useRef } from "react";
import Logs from "./components/Logs"; 

export type Message = {
  type: string;
  data: string;
};

const messages: Message[] = [
  {
    type: "whatsmeow",
    data: "Hello, Whatsmeow!",
  },
  {
    type: "other",
    data: "Hello, Other!",
  },
];

export default function Home() {
  const [whatsmeowMessages, setWhatsmeowMessages] =
    useState<Message[]>(messages);
  const [otherMessages, setOtherMessages] = useState<Message[]>(messages);
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
    <main className="flex flex-col md:grid grid-cols-2 h-screen gap-1">
      <div className="min-h-screen ">
        <Logs
          messages={whatsmeowMessages}
          title="Whatsmeow Messages"
          bgcolor="bg-slate-600"
        />
      </div>
      <div className="min-h-screen">
      <Logs
        messages={otherMessages}
        title="Whatsapp Web Messages"
        bgcolor="bg-gray-800"
      />
      </div>
    </main>
  );
}
