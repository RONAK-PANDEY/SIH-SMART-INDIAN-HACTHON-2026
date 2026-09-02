import { Page, expect } from '@playwright/test';

export class BookingPage {
  constructor(private page: Page) {}

  async expectLoaded() {
    await expect(this.page.getByTestId('booking-slots')).toBeVisible();
  }

  async selectFirstAvailableSlot() {
    const slot = this.page.getByTestId('slot-available').first();
    await expect(slot).toBeVisible();
    await slot.click();
  }

  async confirmBooking() {
    await this.page.getByTestId('booking-confirm').click();
  }

  async expectTokenIssued(): Promise<string> {
    const tokenEl = this.page.getByTestId('appointment-token');
    await expect(tokenEl).toBeVisible({ timeout: 15_000 });
    const token = (await tokenEl.textContent())?.trim() ?? '';
    expect(token.length).toBeGreaterThan(0);
    return token;
  }

  async goToQueueTracker() {
    await this.page.getByTestId('view-queue-status').click();
  }
}
