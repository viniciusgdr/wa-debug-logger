import { useEffect, useRef } from "react"

type Message = {
  data: any
}

type Props = {
  messages: Message[]
}

export default function OtherLogs({ messages }: Props) {
  const logsEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  return (
    <div className="bg-gray-900 p-4 overflow-y-auto">
      <h2 className="text-2xl font-bold mb-4">WhatsApp Web Logs</h2>
      {messages.map((message, index) => (
        <div key={index} className="mb-2">
          <span>
            {JSON.stringify(message.data)}
          </span>
        </div>
      ))}
      <div ref={logsEndRef} />
    </div>
  )
}

