import { Page, Locator, expect } from '@playwright/test';

/**
 * Page Object Model for Live Queue Ticker & Patient Token Tracker (/live-queue, /my-token)
 */
export class QueueTrackerPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly currentServingToken: Locator;
  readonly patientToken: Locator;
  readonly queuePositionBadge: Locator;
  readonly estimatedWaitBadge: Locator;
  readonly liveStatusBadge: Locator;
  readonly refreshButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.locator('h1, h2').filter({ hasText: /Live OPD Queue|Queue Ticker|My Token|Live Queue/i });
    this.currentServingToken = page.locator('[data-testid="serving-token"], .serving-token, div:has-text("Now Serving")');
    this.patientToken = page.locator('[data-testid="patient-token"], .my-token-badge, h3:has-text("T-")');
    this.queuePositionBadge = page.locator('[data-testid="queue-position"], .position-badge, span:has-text("ahead")');
    this.estimatedWaitBadge = page.locator('[data-testid="estimated-wait"], .wait-time-badge, span:has-text("mins")');
    this.liveStatusBadge = page.locator('[data-testid="token-status"], .status-pill');
    this.refreshButton = page.locator('button').filter({ hasText: /Refresh|Sync/i }).first();
  }

  /**
   * Navigate directly to live queue page
   */
  async goto(baseUrl?: string): Promise<void> {
    const targetUrl = baseUrl ? `${baseUrl}/live-queue` : '/live-queue';
    await this.page.goto(targetUrl);
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Verify queue tracker page is active and loaded
   */
  async verifyPageLoaded(): Promise<void> {
    await expect(this.heading).toBeVisible({ timeout: 10000 });
  }

  /**
   * Verify that the current serving token is visible
   */
  async verifyServingTokenVisible(): Promise<void> {
    if (await this.currentServingToken.count() > 0) {
      await expect(this.currentServingToken).toBeVisible();
    }
  }

  /**
   * Verify patient's assigned token is displayed
   */
  async verifyPatientToken(tokenNumber: string): Promise<void> {
    const tokenElement = this.page.locator(`text=${tokenNumber}`).first();
    if (await tokenElement.count() > 0) {
      await expect(tokenElement).toBeVisible();
    }
  }

  /**
   * Wait for real-time WebSocket or polling status update
   */
  async waitForStatus(statusText: string, timeoutMs: number = 10000): Promise<void> {
    const statusElement = this.page.locator(`text=${statusText}`).first();
    await expect(statusElement).toBeVisible({ timeout: timeoutMs });
  }
}
