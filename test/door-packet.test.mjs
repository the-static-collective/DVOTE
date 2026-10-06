import test from "node:test";
import assert from "node:assert/strict";
import { holdDoorPacket } from "../door-packet.js";

const packet = {
  schema: "static.door-packet/0.1",
  packetRef: "door:upper-room:001",
  source: { system: "upper-room", sourceRef: "selection:john-1-5", doorKind: "selection" },
  anchor: { translationId: "webp", book: "JHN", chapter: 1, startVerse: 5, endVerse: 5 },
  disclosure: {
    includesPrivateText: false,
    includesHumanNote: false,
    includesParticipantIdentity: false,
  },
  authority: null,
  requestedEffect: null,
};

test("importing a door does not cross it or manufacture a witness", () => {
  const held = holdDoorPacket(packet);
  assert.deepEqual(held, {
    schema: "dvote.external-door-candidate/0.1",
    packetRef: packet.packetRef,
    source: packet.source,
    anchor: packet.anchor,
    disposition: null,
    witnessReceipt: null,
    authority: null,
    law: "IMPORT != CROSSING",
  });
});

test("private or authoritative packets are refused", () => {
  assert.throws(() => holdDoorPacket({ ...packet, authority: "upper-room" }), /authority/i);
  assert.throws(
    () => holdDoorPacket({
      ...packet,
      disclosure: { ...packet.disclosure, includesParticipantIdentity: true },
    }),
    /private/i,
  );
});
