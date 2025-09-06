"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="bottom-right"
      expand={true}
      richColors={true}
      closeButton={true}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--success-bg": "hsl(143 85% 96%)",
          "--success-text": "hsl(140 100% 27%)",
          "--success-border": "hsl(145 92% 91%)",
          "--error-bg": "hsl(0 93% 94%)",
          "--error-text": "hsl(0 84% 60%)",
          "--error-border": "hsl(0 93% 94%)",
          "--warning-bg": "hsl(49 100% 97%)",
          "--warning-text": "hsl(31 92% 45%)",
          "--warning-border": "hsl(49 91% 91%)",
          "--info-bg": "hsl(208 100% 97%)",
          "--info-text": "hsl(210 92% 45%)",
          "--info-border": "hsl(221 91% 91%)",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
