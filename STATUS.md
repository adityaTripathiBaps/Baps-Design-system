# BAPS Design System — Project Status

This document tracks the overall progress of the BAPS Design System, specifically focusing on the ongoing migration and implementation of the React components (`@org/ui-kit-react`), shared styling, and consumer integrations.

## 🟢 Completed Tasks

* **Batch 1 & 2 React Components (Except Link & Progress Bar):**
  * Implemented and fully tested reusable components (Icon, Button, Avatar, Badge, Tag, Alert, Card, Divider, Spinner, Skeleton, Form elements, Toggle Switch, Segmented, etc.).
* **Batch 3 React Components (14/14 Completed):**
  * Implemented and verified Navbar, Internal Navbar, Toolbar, Breadcrumb, Tabs, Accordion, Stepper, Menu Item, Popover, Tooltip, Dialog, Drawer, Toast, Split Button.
  * Verified keyboard and accessibility behavior for Batch 3.
  * Reused shared DS tokens/CSS; no React-local duplicated styling.
* **Shared CSS Architecture Alignment:**
  * Canonical shared CSS updated with MyBKY, Sampark, light, and dark selectors.
  * Styles structured to simultaneously support PrimeNG/Angular consumers and React consumers seamlessly without duplicating visual rules.
* **Storybook & Tooling Validation:**
  * Static build, snippet/style guards, and visual baselines are all green.
* **React Integration Fixtures:**
  * Strict React consumer and Next.js client/server test fixtures integrated and compiling successfully.

## 🟡 In Progress / Blocked (Partial)

* **Link (Batch 2):** React implementation is functional but marked as PARTIAL. Blocked by a live `color-contrast` accessibility violation in the default Storybook story. Needs a token update or approved visual-baseline decision before being marked DONE.
* **Progress Bar (Batch 2):** React implementation passes runtime tests but marked as PARTIAL. The live Angular/PrimeNG story still reports `aria-allowed-attr`, `aria-valid-attr-value`, and `aria-progressbar-name` issues, blocking the Angular regression-safety gate.

## 🔴 Pending Investigation / Action Items

* **Visual Bug:** Investigate image avatar radius/sizing issue in Sampark. The hover background appears, but width/height default and radius do not match Sampark standard theme.
* **Update Consumer:** Ensure all completed React components are updated and exported for the `react-app-shell-sampark` project. Confirm changes are updated.

## 🔴 Not Started

* **Batch 4 React Components:** Implementation of the final batch of standard React components (Table, Table Column Config, Table Sort Config, Users Dropdown, Form Field).
* **Table.tsx Migration:** Moving and adapting the complex data table components for the React ecosystem.
* **React Shell Migration:** Migrating the BAPS React App Shell to consume the new `@org/ui-kit-react` packages.
