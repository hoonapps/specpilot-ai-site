---
version: alpha
name: SpecPilot Calm Purchase Desk
description: A focused question-and-answer product interface for PC and laptop purchase decisions.
colors:
  primary: "#171C1A"
  secondary: "#5F6B66"
  tertiary: "#0B6F66"
  accent: "#B45309"
  neutral: "#F4F6F2"
  surface: "#FFFFFF"
  surface-muted: "#EEF3EF"
  line: "#D7DED8"
  success: "#15803D"
  warning: "#B45309"
  danger: "#B91C1C"
typography:
  h1:
    fontFamily: Inter
    fontSize: 3rem
    fontWeight: 900
    lineHeight: 1.05
    letterSpacing: "0"
  h2:
    fontFamily: Inter
    fontSize: 1.65rem
    fontWeight: 850
    lineHeight: 1.18
    letterSpacing: "0"
  body:
    fontFamily: Inter
    fontSize: 1rem
    fontWeight: 500
    lineHeight: 1.65
    letterSpacing: "0"
  label:
    fontFamily: Inter
    fontSize: 0.78rem
    fontWeight: 850
    lineHeight: 1.2
    letterSpacing: "0"
rounded:
  sm: 6px
  md: 8px
  lg: 12px
spacing:
  xs: 6px
  sm: 10px
  md: 16px
  lg: 24px
  xl: 40px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.surface}"
    rounded: "{rounded.md}"
    padding: 12px 16px
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.primary}"
    rounded: "{rounded.md}"
    padding: 12px 16px
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.primary}"
    rounded: "{rounded.md}"
    padding: 12px 14px
---

## Overview

SpecPilot AI should feel like a calm purchase desk, not a feature showroom. The product promise is simple: a user asks whether a PC or laptop purchase is safe, and the interface returns a practical answer with evidence, risks, and next steps.

## Colors

The palette uses high-contrast ink, quiet warm neutrals, and one restrained teal interaction color. Amber appears only for warnings and purchase caution. Red is reserved for blocker states.

## Typography

Headlines should be confident but compact. Avoid oversized marketing typography inside product surfaces. Body text should read like a decision memo: short, concrete, and scannable.

## Layout

The primary page is a two-column Q&A workspace on desktop and a single-column flow on mobile. Keep the first viewport focused on the question input and the answer. Detailed tools belong on separate pages.

## Elevation & Depth

Use thin borders and light shadows for functional panels only. Do not stack cards inside cards. Avoid decorative blobs, oversized gradients, or purely aesthetic sections.

## Shapes

Cards and controls use 8px radius or less unless a larger surface needs a subtle 12px radius. Buttons should be compact and icon-led when the action is familiar.

## Components

Primary actions submit or continue an analysis. Secondary actions copy, open tools, or navigate to evidence pages. Inputs are dense, labeled, and optimized for pasted product text.

## Do's and Don'ts

Do keep `/launch` centered on question and answer.
Do split advanced workflows into focused pages.
Do show why the answer is safe or risky.
Do make portfolio value obvious: architecture, product thinking, verification, and launch readiness.
Don't bury the user under every feature on the first page.
Don't use generic SaaS hero sections when the product is an interactive purchase advisor.
Don't let long Korean copy overflow buttons, cards, or mobile viewports.
