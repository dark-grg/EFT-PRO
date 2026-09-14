# Security Specification - EFT PRO Firebase Integration

## 1. Data Invariants
- **Identity Enforcement**: A user cannot impersonate another player; any user-authored record (`wheel_spins`, `transactions`, `tactics`) must match `request.auth.uid`.
- **RBAC & Admin Privilege**: Administrative collections and privileged fields (`tournaments`, `matches`, `news`, `wheel_rewards`) can only be modified by authenticated administrators (`sjadbrhm5@gmail.com` or users listed in `/admins/{uid}`).
- **Document ID Protection**: Path variables must be valid identifiers constrained by regex `^[a-zA-Z0-9_\-]+$` and size limits (`<= 128`).
- **Connection Handshake**: `/test/connection` must be readable for system readiness checks.

## 2. The "Dirty Dozen" Threat Payloads
1. **Payload 1 (Ghost Admin Injection)**: Non-admin writes to `/admins/attacker_uid`.
2. **Payload 2 (Impersonated Spin)**: User A writes spin record with `userId: 'User_B'`.
3. **Payload 3 (Unauthorized Tournament Deletion)**: Regular player attempts to delete a tournament `/tournaments/{id}`.
4. **Payload 4 (Match Score Tampering)**: Player attempts to edit final score on `/matches/{id}` without admin privileges.
5. **Payload 5 (Reward Pool Tampering)**: Regular player alters `probability` or `value` on `/wheel_rewards/{id}`.
6. **Payload 6 (Private Ledger Snooping)**: User A attempts to list transactions belonging to User B.
7. **Payload 7 (Junk ID Injection)**: 2MB junk string sent as document ID to `/tactics/{junkId}`.
8. **Payload 8 (Arbitrary User Profile Escalation)**: Regular player modifies their user document to set `isAdmin: true`.
9. **Payload 9 (Notification Spying)**: Player reads notifications addressed to another user ID.
10. **Payload 10 (News Vandalism)**: Unauthenticated visitor attempts to create news article.
11. **Payload 11 (Unauthenticated Spin Injection)**: Visitor without auth attempts to write to `/wheel_spins`.
12. **Payload 12 (Foreign Tactic Mutation)**: User A tries to overwrite User B's saved tactic.

## 3. Test Runner
All payloads tested against rules must yield `PERMISSION_DENIED`.
