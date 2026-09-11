import { Page, Locator, expect } from '@playwright/test';
import { BookingDetails } from '../fixtures/test-data';

/**
 * Page Object Model for OPD Appointment & Token Booking Page (/book-appointment)
 */
export class BookingPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly dateInput: Locator;
  readonly slotPills: Locator;
  readonly confirmBookingButton: Locator;
  readonly tokenConfirmationCard: Locator;
  readonly tokenNumberDisplay: Locator;
  readonly trackQueueButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.locator('h1, h2').filter({ hasText: /Book OPD Appointment|Book Appointment|Appointment/i });
    this.dateInput = page.locator('input[type="date"], input#booking-date');
    this.slotPills = page.locator('button, .slot-pill').filter({ hasText: /AM|PM/i });
    this.confirmBookingButton = page.locator('button').filter({ hasText: /Confirm|Generate Token|Book/i }).first();
    this.tokenConfirmationCard = page.locator('[data-testid="token-card"], .token-card, .bg-white:has-text("Token")');
    this.tokenNumberDisplay = page.locator('[data-testid="token-number"], .token-id, span:has-text("T-"), h2:has-text("T-")');
    this.trackQueueButton = page.locator('button, a').filter({ hasText: /Track Queue|Live Queue|My Token|View Token/i }).first();
  }

  /**
   * Navigate directly to booking page
   */
  async goto(baseUrl?: string): Promise<void> {
    const targetUrl = baseUrl ? `${baseUrl}/book-appointment` : '/book-appointment';
    await this.page.goto(targetUrl);
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Verify booking page is loaded
   */
  async verifyPageLoaded(): Promise<void> {
    await expect(this.heading).toBeVisible({ timeout: 10000 });
  }

  /**
   * Select date for consultation
   */
  async selectDate(date: string): Promise<void> {
    if (await this.dateInput.count() > 0) {
      await this.dateInput.fill(date);
    }
  }

  /**
   * Select an available time slot
   */
  async selectTimeSlot(slotText?: string): Promise<void> {
    if (slotText) {
      const specificSlot = this.page.locator(`button:has-text("${slotText}")`).first();
      if (await specificSlot.count() > 0) {
        await specificSlot.click();
        return;
      }
    }
    if (await this.slotPills.count() > 0) {
      await this.slotPills.first().click();
    }
  }

  /**
   * Confirm booking and request token generation
   */
  async confirmBooking(): Promise<void> {
    if (await this.confirmBookingButton.count() > 0) {
      await this.confirmBookingButton.click();
    }
  }

  /**
   * Book appointment and get issued token
   */
  async bookSlot(booking: BookingDetails): Promise<void> {
    await this.verifyPageLoaded();
    await this.selectDate(booking.preferredDate);
    await this.selectTimeSlot(booking.timeSlot);
    await this.confirmBooking();
  }

  /**
   * Navigate to live queue tracker page
   */
  async proceedToLiveQueue(): Promise<void> {
    if (await this.trackQueueButton.count() > 0) {
      await this.trackQueueButton.click();
    } else {
      await this.page.goto('/live-queue');
    }
  }
}
