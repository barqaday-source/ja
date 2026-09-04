# OKX Payment Integration Notes

## Sources

- https://web3.okx.com/onchainos/dev-docs/payments/service-seller-sdk — OKX Onchain OS seller SDK documentation.
- https://www.okx.com/docs-v5/en/ — OKX API guide and authentication documentation.

## Verified constraints

The official seller SDK documentation describes a server-side business backend, an EVM-compatible recipient wallet, an OKX Developer Portal API key, and a payment flow based on the x402 protocol with server-side verification. The example uses X Layer testnet network identifier `eip155:196`; this must not be treated as a production or Iraqi-currency configuration without provider approval.

The OKX API guide documents private REST headers `OK-ACCESS-KEY`, `OK-ACCESS-SIGN`, `OK-ACCESS-TIMESTAMP`, and `OK-ACCESS-PASSPHRASE`, with an HMAC-SHA256 Base64 signature over timestamp, uppercase method, request path, and body. API keys may have Read, Trade, or Withdraw permissions; least privilege and IP binding are required. Secrets must remain server-side and must never be placed in the Expo client.

The project should therefore implement a typed payment adapter and a not-configured preview state first. Do not invent endpoint paths, claim payment success from a client callback, or enable transfers in the mock application. Production activation requires selecting the correct OKX product, region, network, wallet, compliance flow, webhook/settlement verification, and credentials from the official provider documentation.
