# DOOR PACKET 001

DVOTE can hold `static.door-packet/0.1` as an external candidate.

Import preserves the packet's source identity and Scripture coordinate, but it does not select a door disposition and does not create a witness receipt.

```text
IMPORT != CROSSING
CANDIDATE != TAKE
CANDIDATE != HOLD
CANDIDATE != PASS
IMPORT != WITNESS
```

The v0 adapter refuses private room material, non-null authority, non-null requested effect, unsupported fields, and malformed Scripture ranges.

A future reader-facing surface may present an imported candidate for an explicit human disposition. That UI is outside this slice.
