import { expect, test } from "@playwright/test";

/**
 * Browser checks for admin Bookings (run against local dev).
 *
 * Credentials (defaults = drizzle/seed.ts + .env.example):
 *   E2E_ADMIN_EMAIL / E2E_ADMIN_PASSWORD
 *   or ADMIN_SEED_EMAIL / ADMIN_SEED_PASSWORD
 *
 * Prereq: `npm run dev`, DB migrated, seed recommended (`npm run db:seed`).
 */

function getAdminCreds(): { email: string; password: string } {
  const email =
    process.env.E2E_ADMIN_EMAIL ??
    process.env.ADMIN_SEED_EMAIL ??
    "admin@example.com";
  const password =
    process.env.E2E_ADMIN_PASSWORD ??
    process.env.ADMIN_SEED_PASSWORD ??
    "ChangeMe!123";
  return { email, password };
}

async function signInAsAdmin(page: import("@playwright/test").Page) {
  const { email, password } = getAdminCreds();
  await page.goto("/admin/login");
  await page.getByLabel(/Email/i).fill(email);
  await page.getByLabel(/^Password/i).fill(password);
  await page.getByRole("button", { name: /Sign in/i }).click();
  await page.waitForURL(/\/admin(?!\/login)/, { timeout: 25_000 });
}

test.describe("Admin bookings (browser)", () => {
  test("unauthenticated /admin/bookings redirects to login", async ({ page }) => {
    await page.goto("/admin/bookings");
    await expect(page).toHaveURL(/\/admin\/login/);
    await expect(page.getByRole("heading", { name: /Admin sign in/i })).toBeVisible();
  });

  test("login → bookings list loads", async ({ page }) => {
    await signInAsAdmin(page);
    await page.goto("/admin/bookings");
    await expect(page.getByRole("heading", { name: "Bookings" })).toBeVisible({ timeout: 15_000 });
    await expect(page.getByRole("button", { name: /Apply/i })).toBeVisible();
  });

  test("Apply filters sends page=1 (no empty page from stale page=99)", async ({ page }) => {
    await signInAsAdmin(page);
    await page.goto("/admin/bookings?page=99");
    await page.getByRole("button", { name: /Apply/i }).click();
    await page.waitForLoadState("networkidle");
    expect(page.url()).toContain("page=1");
  });

  test("manual booking without phone succeeds", async ({ page }) => {
    test.setTimeout(90_000);
    await signInAsAdmin(page);
    await page.goto("/admin/bookings");

    const trigger = page.getByRole("button", { name: "New manual booking" });
    if ((await trigger.count()) === 0) {
      test.skip(true, "No tours in DB — manual booking button not rendered");
    }

    const responsePromise = page.waitForResponse(
      (res) =>
        res.url().includes("/api/admin/bookings/manual") &&
        res.request().method() === "POST" &&
        res.status() !== 0
    );

    await trigger.click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible({ timeout: 10_000 });

    const dateInput = dialog.locator('input[type="date"]');
    const minDate = await dateInput.getAttribute("min");
    if (!minDate) throw new Error("Expected date input min (Brisbane today)");
    const far = new Date(`${minDate}T12:00:00`);
    far.setDate(far.getDate() + 30);
    await dateInput.fill(far.toISOString().slice(0, 10));

    const selects = dialog.locator("select");
    await expect(selects.first()).toBeVisible();
    const depSelect = selects.nth(1);
    const depOptions = await depSelect.locator("option").count();
    if (depOptions < 2) {
      test.skip(true, "No departure options for default tour — seed DB");
    }
    await depSelect.selectOption({ index: 1 });

    // Labels are not wired with htmlFor; target inputs by section order (after guest counts).
    // Dialog inputs in DOM order: date, adults#, children#, infants#, first, last, email, phone (no htmlFor on labels).
    const inps = dialog.locator("input");
    await expect(inps.nth(4)).toBeVisible();
    await inps.nth(4).fill("E2E");
    await inps.nth(5).fill("Browser");
    await inps.nth(6).fill(`e2e-manual-${Date.now()}@example.com`);

    await dialog.getByRole("button", { name: /Create booking/i }).click();
    const res = await responsePromise;
    const json = (await res.json()) as { success?: boolean; message?: string };
    expect(res.status(), json.message ?? res.statusText()).toBeLessThan(400);
    expect(json.success).toBe(true);
  });

  test("booking detail: clearing phone then Save — records PATCH status", async ({ page }) => {
    await signInAsAdmin(page);
    await page.goto("/admin/bookings");

    const viewLink = page.getByRole("link", { name: "View" }).first();
    if ((await viewLink.count()) === 0) {
      test.skip(true, "No bookings — open a booking detail after seeding");
    }

    const updatePromise = page.waitForResponse(
      (r) => r.url().includes("/api/admin/bookings/update") && r.request().method() === "PATCH"
    );

    await viewLink.click();
    await expect(page.getByRole("heading", { name: /Edit booking/i })).toBeVisible({ timeout: 15_000 });

    await page.getByLabel(/^Phone$/i).fill("");
    await page.getByRole("button", { name: /Save changes/i }).click();

    const updateRes = await updatePromise;
    const status = updateRes.status();
    const body = (await updateRes.json().catch(() => ({}))) as { message?: string; success?: boolean };

    // eslint-disable-next-line no-console -- e2e documents live API behaviour for humans/CI logs
    console.log(
      `[e2e] PATCH /api/admin/bookings/update (phone cleared): ${status} ${JSON.stringify(body)}`
    );

    expect(status).toBe(200);
    expect(body.success).toBe(true);
  });
});
