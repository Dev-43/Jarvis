---
version: alpha
name: Taut-AI-Safety-Gateway-Design-System
description: |
  A precision-engineered developer interface for runtime AI agent oversight and cyber-defense.
  Rooted in the design languages of VoltAgent, NVIDIA, and Linear: a deep void-black canvas
  (#07070a / #0c0d14) structured with crisp hairline borders (#23242c), NVIDIA signature green
  (#76b900) for telemetry and official model marks, and high-contrast semantic indicators:
  crimson (#f43f5e) for policy halts and exfiltration attempts, emerald (#10b981) for clean runs,
  amber (#f59e0b) for ratchet versioning, and cyber-cyan (#06b6d4) for Nemotron inference.
  Zero decorative neon tropes, zero artificial blur; built for high information density,
  tamper-evident audit logs, and microsecond visual comprehension.

colors:
  canvas-deep: "#07070a"
  canvas: "#0c0d14"
  canvas-subtle: "#12141e"
  canvas-elevated: "#181a26"
  surface-border: "#23242c"
  surface-border-strong: "#353745"
  
  # Typography
  text-primary: "#ffffff"
  text-secondary: "#a1a1aa"
  text-muted: "#71717a"
  text-dim: "#52525b"
  
  # NVIDIA & Nebius Accent
  nvidia-green: "#76b900"
  nvidia-green-glow: "rgba(118, 185, 0, 0.15)"
  nebius-cyan: "#06b6d4"
  nebius-cyan-soft: "rgba(6, 182, 212, 0.12)"
  
  # Semantic Security States
  security-danger: "#f43f5e"
  security-danger-subtle: "rgba(244, 63, 94, 0.12)"
  security-danger-border: "#881337"
  
  security-safe: "#10b981"
  security-safe-subtle: "rgba(16, 185, 129, 0.12)"
  security-safe-border: "#064e3b"
  
  security-warning: "#f59e0b"
  security-warning-subtle: "rgba(245, 158, 11, 0.12)"
  security-warning-border: "#78350f"

typography:
  display-hero:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "48px"
    fontWeight: "800"
    lineHeight: "1.15"
    letterSpacing: "-0.03em"
  heading-xl:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "24px"
    fontWeight: "700"
    lineHeight: "1.25"
    letterSpacing: "-0.02em"
  heading-md:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "18px"
    fontWeight: "600"
    lineHeight: "1.35"
    letterSpacing: "-0.01em"
  body-base:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "14px"
    fontWeight: "400"
    lineHeight: "1.5"
  body-sm:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "13px"
    fontWeight: "400"
    lineHeight: "1.4"
  mono-code:
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
    fontSize: "12px"
    fontWeight: "500"
    lineHeight: "1.4"
  mono-micro:
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
    fontSize: "10.5px"
    fontWeight: "600"
    letterSpacing: "0.04em"

rounded:
  none: "0px"
  xs: "3px"
  sm: "6px"
  md: "10px"
  lg: "14px"
  full: "9999px"

spacing:
  card-padding: "20px"
  timeline-gap: "12px"
  chip-padding: "2px 8px"

components:
  top-navbar:
    backgroundColor: "{colors.canvas}/95"
    borderBottom: "1px solid {colors.surface-border}"
    height: "56px"
    sticky: true
    backdropFilter: "blur(12px)"
    
  kpi-strip-item:
    backgroundColor: "{colors.canvas-subtle}"
    border: "1px solid {colors.surface-border}"
    borderRadius: "{rounded.md}"
    padding: "16px"
    
  scenario-hero-card:
    backgroundColor: "{colors.canvas}"
    border: "1px solid {colors.surface-border}"
    hoverBorder: "1px solid {colors.surface-border-strong}"
    borderRadius: "{rounded.lg}"
    padding: "24px"
    
  timeline-event-card:
    backgroundColor: "{colors.canvas-subtle}"
    border: "1px solid {colors.surface-border}"
    borderRadius: "{rounded.sm}"
    padding: "12px 16px"
    
  terminal-window:
    backgroundColor: "{colors.canvas-deep}"
    border: "1px solid {colors.surface-border}"
    borderRadius: "{rounded.md}"
    headerBorderBottom: "1px solid {colors.surface-border}"
    
  tier-badge:
    fontFamily: "{typography.mono-micro.fontFamily}"
    fontSize: "10px"
    textTransform: "uppercase"
    borderRadius: "{rounded.xs}"
    padding: "2px 6px"
    border: "1px solid"
    
  ratchet-counter:
    fontFamily: "{typography.mono-code.fontFamily}"
    color: "{colors.security-warning}"
    backgroundColor: "{colors.security-warning-subtle}"
    border: "1px solid {colors.security-warning-border}"
    borderRadius: "{rounded.sm}"
---
