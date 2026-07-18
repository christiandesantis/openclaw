import { Value } from "typebox/value";
import { describe, expect, it } from "vitest";
import {
  ClientModeForbiddenErrorDetailsSchema,
  ErrorCodes,
  GatewayErrorDetailCodes,
  GatewayErrorDetailsSchema,
  MissingScopeErrorDetailsSchema,
  missingScopeErrorShape,
} from "./error-codes.js";

describe("gateway error details", () => {
  it("validates missing-scope details", () => {
    const details = {
      code: GatewayErrorDetailCodes.MISSING_SCOPE,
      missingScope: "operator.write",
      requiredScopes: ["operator.write"],
    };

    expect(Value.Check(MissingScopeErrorDetailsSchema, details)).toBe(true);
    expect(Value.Check(GatewayErrorDetailsSchema, details)).toBe(true);
    expect(Value.Check(MissingScopeErrorDetailsSchema, { ...details, requiredScopes: [] })).toBe(
      false,
    );
  });

  it("validates client-mode restriction details", () => {
    const details = {
      code: GatewayErrorDetailCodes.CLIENT_MODE_FORBIDDEN,
      clientId: "webchat-ui",
      clientMode: "ui",
      action: "patch",
    };

    expect(Value.Check(ClientModeForbiddenErrorDetailsSchema, details)).toBe(true);
    expect(Value.Check(GatewayErrorDetailsSchema, details)).toBe(true);
    expect(Value.Check(ClientModeForbiddenErrorDetailsSchema, { ...details, action: "" })).toBe(
      false,
    );
  });

  it("builds a distinct forbidden missing-scope response", () => {
    expect(
      missingScopeErrorShape({
        missingScope: "operator.approvals",
        requiredScopes: ["operator.read", "operator.approvals"],
      }),
    ).toEqual({
      code: ErrorCodes.FORBIDDEN,
      message: "missing scope: operator.approvals",
      details: {
        code: GatewayErrorDetailCodes.MISSING_SCOPE,
        missingScope: "operator.approvals",
        requiredScopes: ["operator.read", "operator.approvals"],
      },
    });
  });

  it("keeps requiredScopes non-empty when a caller has no method metadata", () => {
    expect(
      missingScopeErrorShape({ missingScope: "operator.admin", requiredScopes: [] }).details,
    ).toEqual({
      code: GatewayErrorDetailCodes.MISSING_SCOPE,
      missingScope: "operator.admin",
      requiredScopes: ["operator.admin"],
    });
  });
});
