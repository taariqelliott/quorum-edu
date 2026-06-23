"use client"

import { QRCodeSVG } from "qrcode.react"
import { useEffect, useState } from "react"

export function QRCode({ code }: { code: string }) {
  const [url, setUrl] = useState("")

  useEffect(() => {
    const origin = process.env.NEXT_PUBLIC_APP_URL ?? window.location.origin
    setUrl(`${origin}/join?code=${code}`)
  }, [code])

  if (!url) return <div className="h-[220px] w-[220px] rounded bg-muted animate-pulse" />
  return <QRCodeSVG value={url} size={220} />
}
