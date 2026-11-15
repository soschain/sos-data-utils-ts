# Profile recovery storage contracts

`profile-recovery-contract` describes controller recovery identity, encrypted
share records and notification outbox data. It carries neither a wallet seed nor
decrypted recovery shares and provides no recovery authorization.

Existing email records retain their `verifiedEmail` field and historical version
discriminators. Phone records use `verifiedTelephone`, an explicit phone contact
kind and a separate SOS version. The discriminated union rejects mixed contact
branches. These field/version distinctions also select the runtime's separate
authenticated-data transcript; types alone do not authenticate stored data.

Generation, timestamp and identity validation, custody, one-use compare-and-swap,
profile resealing and atomic session revocation belong in the runtime and its
trusted transactional repository. Outbox data does not send a message or imply
that a delivery channel has been verified.
