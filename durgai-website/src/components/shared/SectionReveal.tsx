'use client'

import React from 'react'

export type RevealStyle =
  | 'slide-up'       // comes from below
  | 'slide-up-hard'  // more aggressive lift (for big sections)
  | 'fade-blur'      // pure opacity + blur (subtle, for strips)
  | 'from-left'      // slides in from left
  | 'from-right'     // slides in from right
  | 'scale-up'       // scales up from slightly small + fades

interface SectionRevealProps {
  children: React.ReactNode
  /** How much of the section must be visible before triggering (0–1). Default 0.08 */
  amount?: number
  style?: RevealStyle
  /** Extra delay before the section starts animating in (seconds) */
  delay?: number
  className?: string
}

export default function SectionReveal({
  children,
  amount = 0.08,
  style = 'slide-up',
  delay = 0,
  className,
}: SectionRevealProps) {
  void amount
  void style
  void delay

  return (
    <div className={className}>
      {children}
    </div>
  )
}
