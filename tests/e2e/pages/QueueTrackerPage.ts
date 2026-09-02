import { Page, expect } from '@playwright/test';

export class QueueTrackerPage {
  constructor(private page: Page) {}

  async expectLoaded(token: string) {
    await expect(this.page.getByTestId('queue-tracker')).toBeVisible();
    await expect(this.page.getByTestId('my-token')).toHaveText(token);
  }

  async getCurrentPosition(): Promise<number> {
    const posText = await this.page.getByTestId('queue-position').textContent();
    return Number(posText?.replace(/\D/g, '') ?? '-1');
  }

  async waitForPositionToAdvance(previousPosition: number, timeoutMs = 30_000) {
    await expect(async () => {
      const pos = await this.getCurrentPosition();
      expect(pos).toBeLessThan(previousPosition);
    }).toPass({ timeout: timeoutMs });
  }

  async waitForCalledStatus(timeoutMs = 30_000) {
    await expect(this.page.getByTestId('queue-status')).toHaveText(/called/i, { timeout: timeoutMs });
  }
}
