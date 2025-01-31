import { useEffect, useRef, useState } from "react";
import { Message } from "../page";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "./Header";

type Props = {
  messages: Message[];
  title: string;
  bgcolor: string;
};

export default function Logs({ messages, bgcolor, title }: Props) {
  const logsEndRef = useRef<HTMLDivElement>(null);
  const [value, setValue] = useState("");

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logsEndRef]); //Fixed unnecessary dependency

  const filteredMessages = value
    ? messages.filter((msg) =>
        msg.type.toLowerCase().startsWith(value.toLowerCase())
      )
    : messages;

  return (
    <div className="bg-gray-100 overflow-y-auto " >
      <Header
        title={title}
        bgcolor={bgcolor}
        setValue={setValue}
        value={value}
      />
      <div className="grid grid-cols-1 gap-4 p-4">
        {filteredMessages.map((message, index) => (
          <Card key={index} className="shadow-lg">
            <CardHeader className="p-2">
              <CardTitle className="ml-1.5 mt-0.5 text-sm text-gray-500">
                <p>#{message.type}</p>
              </CardTitle>
            </CardHeader>
            <CardContent className="mx-2 mb-2">
              <p>{message.data}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <div ref={logsEndRef} />
    </div>
  );
}
