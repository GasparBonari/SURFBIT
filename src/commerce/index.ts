import "server-only";
import { mockProvider } from "./mock/provider";
import type { CommerceProvider } from "./types";

/**
 * Server-side entry point for commerce. The mock provider is the store
 * (ARCHITECTURE.md → D16); a real backend would implement CommerceProvider
 * and be selected here.
 */
export const commerce: CommerceProvider = mockProvider;
