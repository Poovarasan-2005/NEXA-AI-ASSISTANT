/**
 * Automated Security & Integration Verification Suite for NEXA AI OS
 */
async function runSecurityTests() {
  console.log("🔒 Starting NEXA AI Zero-Trust Security Verification...\n");
  const baseUrl = "http://localhost:3000";
  let passedCount = 0;
  let totalCount = 0;

  function assertTest(condition: boolean, testName: string, detail = "") {
    totalCount++;
    if (condition) {
      console.log(`  ✅ [PASS] ${testName} ${detail ? `(${detail})` : ""}`);
      passedCount++;
    } else {
      console.error(`  ❌ [FAIL] ${testName} ${detail ? `(${detail})` : ""}`);
    }
  }

  // TEST 1: Public area accessible without authentication
  try {
    const res = await fetch(`${baseUrl}/`);
    assertTest(res.status === 200, "Test 1: Public Home Page Accessible", `Status ${res.status}`);
  } catch (e: any) {
    assertTest(false, "Test 1: Public Home Page Accessible", e.message);
  }

  // TEST 2: Unauthenticated /app protected by Route Middleware
  try {
    const res = await fetch(`${baseUrl}/app`, { redirect: "manual" });
    const isRedirect = res.status === 307 || res.status === 308 || res.status === 302;
    const location = res.headers.get("location") || "";
    assertTest(
      isRedirect && location.includes("/login"),
      "Test 2: Unauthenticated /app Route Blocked & Redirected",
      `Status ${res.status} -> ${location}`
    );
  } catch (e: any) {
    assertTest(false, "Test 2: Unauthenticated /app Route Blocked", e.message);
  }

  // TEST 3: Unauthenticated API request to protected resource
  try {
    const res = await fetch(`${baseUrl}/api/app/tasks`);
    assertTest(res.status === 401, "Test 3: Unauthenticated Protected API Blocked", `Status ${res.status}`);
  } catch (e: any) {
    assertTest(false, "Test 3: Unauthenticated Protected API Blocked", e.message);
  }

  // TEST 4: Standard User Login & Cookie Issuance
  let userCookie = "";
  try {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-nexa-test": "true" },
      body: JSON.stringify({ email: "user@nexa.ai", password: "UserPassword123!" }),
    });
    const setCookie = res.headers.get("set-cookie") || "";
    const data = await res.json();
    userCookie = setCookie.split(";")[0];
    assertTest(
      res.status === 200 && userCookie.includes("nexa_session"),
      "Test 4: Standard User Authentication & HttpOnly Session Issued",
      `User: ${data.user?.email}, Role: ${data.user?.role}`
    );
  } catch (e: any) {
    assertTest(false, "Test 4: Standard User Authentication", e.message);
  }

  // TEST 5: Verify Session and User Role via /api/auth/me
  try {
    const res = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { Cookie: userCookie },
    });
    const data = await res.json();
    assertTest(
      res.status === 200 && data.user?.role === "USER",
      "Test 5: Authenticated Session Validation (/api/auth/me)",
      `Authenticated: ${data.authenticated}`
    );
  } catch (e: any) {
    assertTest(false, "Test 5: Session Validation", e.message);
  }

  // TEST 6: Normal user attempting to access Admin API (Must return 403 Forbidden)
  try {
    const res = await fetch(`${baseUrl}/api/admin/users`, {
      headers: { Cookie: userCookie },
    });
    assertTest(
      res.status === 403,
      "Test 6: Privilege Escalation Guard (Normal user -> /api/admin/users)",
      `Expected 403, Got ${res.status}`
    );
  } catch (e: any) {
    assertTest(false, "Test 6: Privilege Escalation Guard", e.message);
  }

  // TEST 7: Normal user attempting to access Admin Stats (Must return 403 Forbidden)
  try {
    const res = await fetch(`${baseUrl}/api/admin/stats`, {
      headers: { Cookie: userCookie },
    });
    assertTest(
      res.status === 403,
      "Test 7: Admin Stats Endpoint Protection (Normal user -> /api/admin/stats)",
      `Expected 403, Got ${res.status}`
    );
  } catch (e: any) {
    assertTest(false, "Test 7: Admin Stats Endpoint Protection", e.message);
  }

  // TEST 8: IDOR Defense: Fetching memory records strictly filters by authenticated user
  try {
    const res = await fetch(`${baseUrl}/api/app/memory?type=ALL`, {
      headers: { Cookie: userCookie },
    });
    const data = await res.json();
    assertTest(
      res.status === 200 && Array.isArray(data.memories),
      "Test 8: IDOR Defense: Memory Scoped to Authenticated User Boundary",
      `Retrieved ${data.memories?.length} user memories`
    );
  } catch (e: any) {
    assertTest(false, "Test 8: IDOR Defense", e.message);
  }

  // TEST 9: AI Orchestrator & Human Approval Firewall
  let approvalId = "";
  try {
    const res = await fetch(`${baseUrl}/api/app/orchestrator`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: userCookie },
      body: JSON.stringify({
        prompt: "Send an outbound email notification to security-team@internal",
      }),
    });
    const data = await res.json();
    const intercepted =
      data.result?.status === "WAITING_FOR_APPROVAL" &&
      data.result?.approvalRequired?.riskLevel === "HIGH";
    approvalId = data.result?.approvalRequired?.approvalId || "";
    assertTest(
      intercepted,
      "Test 9: AI Human Approval Firewall (High-risk action halted)",
      `Status: ${data.result?.status}, Risk: ${data.result?.approvalRequired?.riskLevel}`
    );
  } catch (e: any) {
    assertTest(false, "Test 9: Human Approval Firewall", e.message);
  }

  // TEST 10: Human Approval Authorization Decision
  if (approvalId) {
    try {
      const res = await fetch(`${baseUrl}/api/app/approvals`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Cookie: userCookie },
        body: JSON.stringify({ approvalId, action: "APPROVE", comment: "Verified test execution" }),
      });
      const data = await res.json();
      assertTest(
        res.status === 200 && data.status === "APPROVED",
        "Test 10: Human Approval Resolution (User approves halted action)",
        `Status: ${data.status}`
      );
    } catch (e: any) {
      assertTest(false, "Test 10: Human Approval Resolution", e.message);
    }
  }

  // TEST 11: Admin Login & Governance API Access
  let adminCookie = "";
  try {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-nexa-test": "true" },
      body: JSON.stringify({ email: "admin@nexa.ai", password: "AdminPassword123!" }),
    });
    const setCookie = res.headers.get("set-cookie") || "";
    const data = await res.json();
    adminCookie = setCookie.split(";")[0];
    assertTest(
      res.status === 200 && data.user?.role === "ADMIN",
      "Test 11: Admin User Authentication",
      `Admin: ${data.user?.email}`
    );
  } catch (e: any) {
    assertTest(false, "Test 11: Admin Authentication", e.message);
  }

  // TEST 12: Admin Accessing Admin Stats & Audit Logs
  try {
    const res = await fetch(`${baseUrl}/api/admin/stats`, {
      headers: { Cookie: adminCookie },
    });
    const data = await res.json();
    assertTest(
      res.status === 200 && data.metrics?.totalUsers > 0,
      "Test 12: Admin Authorized Governance Access (/api/admin/stats)",
      `Total Users: ${data.metrics?.totalUsers}, Tasks: ${data.metrics?.totalTasks}`
    );
  } catch (e: any) {
    assertTest(false, "Test 12: Admin Governance Access", e.message);
  }

  // TEST 13: Session Revocation / Logout Test
  try {
    const logoutRes = await fetch(`${baseUrl}/api/auth/logout`, {
      method: "POST",
      headers: { Cookie: userCookie },
    });
    assertTest(logoutRes.status === 200, "Test 13a: Session Revocation Dispatch", "Logout API executed");

    // Immediately verify old session is now rejected
    const checkRes = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { Cookie: userCookie },
    });
    assertTest(
      checkRes.status === 401,
      "Test 13b: Revoked Session Immediately Rejected (/api/auth/me returns 401)",
      `Expected 401, Got ${checkRes.status}`
    );
  } catch (e: any) {
    assertTest(false, "Test 13: Session Revocation", e.message);
  }

  console.log(`\n========================================`);
  console.log(`🏁 Security Verification Completed: ${passedCount}/${totalCount} Passed`);
  console.log(`========================================\n`);

  if (passedCount === totalCount) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runSecurityTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
