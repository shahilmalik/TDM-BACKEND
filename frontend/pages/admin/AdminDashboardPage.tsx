import React from "react";

// This file exists to progressively split the gigantic AdminDashboard.tsx into smaller modules
// without breaking routes or changing UI.
//
// For now, it simply re-exports the existing implementation. We'll move tabs/modals/hooks
// into this folder incrementally.

export { default } from "../AdminDashboard";
