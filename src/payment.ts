// Copyright 2026 Connecting Solution & Applications Ltd under the Apache License, Version 2.0.
// Selectively migrated neutral contracts; source attribution is retained in NOTICE.
/** Provider identifiers only; provider reconciliation and authorization stay server-owned. */
export const PaymentProviderIds = Object.freeze({Stripe: 'STRIPE', EvmTransfer: 'EVM_TRANSFER'} as const)

/** Non-operational payment values reused by gateway contract tests. No wallet or RPC key is included. */
export const PAYMENT_TEST_EXAMPLES = Object.freeze({
  priceText: '10', currency: 'USD', quantity: 1,
  invoiceId: 'invoice_test_01', transactionHash: `0x${'a'.repeat(64)}` as `0x${string}`,
})
