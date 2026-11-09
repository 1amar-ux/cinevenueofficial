import { describe, it } from "node:test";
import assert from "node:assert";
import { validateStagingTargetUrl } from "../../scripts/staging_url_validator";

describe("CineVenue Staging Smoke Test Hostname Safety Guard", () => {
  // 1. Allowed Staging Hosts
  describe("1. Allowed Staging Hosts", () => {
    it("permits http://localhost:5000", () => {
      const res = validateStagingTargetUrl("http://localhost:5000");
      assert.strictEqual(res.valid, true);
      assert.strictEqual(res.hostname, "localhost");
      assert.strictEqual(res.normalizedUrl, "http://localhost:5000");
    });

    it("permits http://127.0.0.1:3000", () => {
      const res = validateStagingTargetUrl("http://127.0.0.1:3000");
      assert.strictEqual(res.valid, true);
      assert.strictEqual(res.hostname, "127.0.0.1");
      assert.strictEqual(res.normalizedUrl, "http://127.0.0.1:3000");
    });

    it("permits https://staging.cinevenue.com", () => {
      const res = validateStagingTargetUrl("https://staging.cinevenue.com");
      assert.strictEqual(res.valid, true);
      assert.strictEqual(res.hostname, "staging.cinevenue.com");
      assert.strictEqual(res.normalizedUrl, "https://staging.cinevenue.com");
    });

    it("permits https://staging-api.cinevenue.com", () => {
      const res = validateStagingTargetUrl("https://staging-api.cinevenue.com");
      assert.strictEqual(res.valid, true);
      assert.strictEqual(res.hostname, "staging-api.cinevenue.com");
    });
  });

  // 2. Strict Rejection of Production Hosts
  describe("2. Unconditional Rejection of Production Hosts", () => {
    const prodHosts = [
      "https://cinevenue.com",
      "https://www.cinevenue.com",
      "https://api.cinevenue.com",
      "https://app.cinevenue.com",
      "https://admin.cinevenue.com",
      "https://prod.cinevenue.com",
      "https://production.cinevenue.com"
    ];

    for (const url of prodHosts) {
      it(`strictly rejects production host: ${url}`, () => {
        const res = validateStagingTargetUrl(url);
        assert.strictEqual(res.valid, false);
        assert.match(res.error!, /PRODUCTION domain/i);
      });
    }

    it("rejects arbitrary unapproved CineVenue subdomains", () => {
      const res1 = validateStagingTargetUrl("https://dev.cinevenue.com");
      assert.strictEqual(res1.valid, false);
      assert.match(res1.error!, /Arbitrary subdomain/i);

      const res2 = validateStagingTargetUrl("https://internal.cinevenue.com");
      assert.strictEqual(res2.valid, false);
      assert.match(res2.error!, /Arbitrary subdomain/i);
    });
  });

  // 3. Rejection of Generic Cloud Wildcard Domains
  describe("3. Rejection of Generic Cloud Hosting Domains", () => {
    it("rejects generic vercel.app domains", () => {
      const res = validateStagingTargetUrl("https://cinevenue-staging-random.vercel.app");
      assert.strictEqual(res.valid, false);
      assert.match(res.error!, /NOT in the explicit staging allowlist/i);
    });

    it("rejects generic railway.app domains", () => {
      const res = validateStagingTargetUrl("https://cinevenue-staging.railway.app");
      assert.strictEqual(res.valid, false);
      assert.match(res.error!, /NOT in the explicit staging allowlist/i);
    });

    it("rejects generic onrender.com domains", () => {
      const res = validateStagingTargetUrl("https://cinevenue.onrender.com");
      assert.strictEqual(res.valid, false);
      assert.match(res.error!, /NOT in the explicit staging allowlist/i);
    });

    it("permits a specific Vercel preview domain ONLY when explicitly allowlisted", () => {
      const explicitHost = "cinevenue-git-staging-preview-123.vercel.app";
      // Rejected without explicit allowlist
      const resDenied = validateStagingTargetUrl(`https://${explicitHost}`);
      assert.strictEqual(resDenied.valid, false);

      // Permitted when explicitly allowlisted
      const resAllowed = validateStagingTargetUrl(`https://${explicitHost}`, [explicitHost]);
      assert.strictEqual(resAllowed.valid, true);
      assert.strictEqual(resAllowed.hostname, explicitHost);
    });
  });

  // 4. Malformed URLs & Missing Targets (Fail Closed)
  describe("4. Fail-Closed on Malformed and Empty Targets", () => {
    it("fails closed on null or undefined input", () => {
      assert.strictEqual(validateStagingTargetUrl(null).valid, false);
      assert.strictEqual(validateStagingTargetUrl(undefined).valid, false);
      assert.strictEqual(validateStagingTargetUrl("").valid, false);
      assert.strictEqual(validateStagingTargetUrl("   ").valid, false);
    });

    it("fails closed on invalid URL string syntax", () => {
      const res = validateStagingTargetUrl("not-a-valid-url");
      assert.strictEqual(res.valid, false);
      assert.match(res.error!, /Malformed staging URL/i);
    });

    it("fails closed on missing host or scheme", () => {
      assert.strictEqual(validateStagingTargetUrl("://localhost").valid, false);
      assert.strictEqual(validateStagingTargetUrl("http://").valid, false);
    });
  });

  // 5. Protocol and Security Evasion Guards
  describe("5. Protocol and Network Security Guards", () => {
    it("rejects non-HTTP/HTTPS protocols (ftp, file, ws)", () => {
      assert.strictEqual(validateStagingTargetUrl("ftp://staging.cinevenue.com").valid, false);
      assert.strictEqual(validateStagingTargetUrl("file:///etc/passwd").valid, false);
      assert.strictEqual(validateStagingTargetUrl("ws://staging.cinevenue.com").valid, false);
    });

    it("enforces HTTPS for external staging hosts (rejects plain HTTP)", () => {
      const res = validateStagingTargetUrl("http://staging.cinevenue.com");
      assert.strictEqual(res.valid, false);
      assert.match(res.error!, /must use HTTPS/i);
    });

    it("rejects userinfo injection (user:password@host)", () => {
      const res = validateStagingTargetUrl("https://admin:secret@staging.cinevenue.com");
      assert.strictEqual(res.valid, false);
      assert.match(res.error!, /userinfo/i);
    });

    it("rejects cloud metadata / SSRF target IP 169.254.169.254", () => {
      const res = validateStagingTargetUrl("http://169.254.169.254/latest/meta-data");
      assert.strictEqual(res.valid, false);
      assert.match(res.error!, /reserved\/metadata IP/i);
    });

    it("rejects 0.0.0.0 address", () => {
      const res = validateStagingTargetUrl("http://0.0.0.0:5000");
      assert.strictEqual(res.valid, false);
      assert.match(res.error!, /reserved\/metadata IP/i);
    });
  });
});

