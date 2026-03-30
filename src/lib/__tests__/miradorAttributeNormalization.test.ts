import { describe, expect, it } from "vitest";

import { normalizeMiradorAttributePayload } from "@/lib/mirador/attributeNormalization";

describe("mirador attribute normalization", () => {
  it("normalizes primitive and structured values while dropping empty strings", () => {
    expect(
      normalizeMiradorAttributePayload({
        stringValue: "value",
        emptyString: "",
        numberValue: 7,
        booleanValue: false,
        objectValue: { ok: true },
        nullValue: null,
        undefinedValue: undefined,
      })
    ).toEqual({
      stringValue: "value",
      numberValue: "7",
      booleanValue: "false",
      objectValue: '{"ok":true}',
    });
  });
});
