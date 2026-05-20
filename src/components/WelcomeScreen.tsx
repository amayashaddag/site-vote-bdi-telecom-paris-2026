import { type ReactNode } from 'react'

interface WelcomeScreenProps {
  title: string
  description: string
  children: ReactNode
}

export default function WelcomeScreen({ title, description, children }: WelcomeScreenProps) {
  return (
    <section className="welcome-screen">
      <div className="welcome-copy">
        <p className="eyebrow">Village International</p>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      <div className="welcome-actions">{children}</div>
    </section>
  )
}
