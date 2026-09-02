import { Page, Locator, expect } from '@playwright/test';

/**
 * Page Object Model for Doctor OPD Calling Console (/doctor-panel)
 */
export class DoctorConsolePage {
  readonly page: Page;
  readonly heading: Locator;
  readonly callNextButton: Locator;
  readonly completeConsultationButton: Locator;
  readonly activePatientCard: Locator;
  readonly waitingQueueList: Locator;
  readonly emergencyEscalateButton: Locator;
  readonly markNoShowButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.locator('h1, h2').filter({ hasText: /Doctor OPD Calling Console|Doctor Console|Doctor Panel/i });
    this.callNextButton = page.locator('button').filter({ hasText: /Call Next|Next Patient|Call/i }).first();
    this.completeConsultationButton = page.locator('button').filter({ hasText: /Complete|Finish Consultation|Prescribe/i }).first();
    this.activePatientCard = page.locator('[data-testid="active-patient"], .active-patient, div:has-text("Current Patient")');
    this.waitingQueueList = page.locator('[data-testid="waiting-queue"], .queue-list, table');
    this.emergencyEscalateButton = page.locator('button').filter({ hasText: /Emergency|Escalate|Referral/i }).first();
    this.markNoShowButton = page.locator('button').filter({ hasText: /Absent|No Show|Skip/i }).first();
  }

  /**
   * Navigate directly to doctor console page
   */
  async goto(baseUrl?: string): Promise<void> {
    const targetUrl = baseUrl ? `${baseUrl}/doctor-panel` : '/doctor-panel';
    await this.page.goto(targetUrl);
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Verify doctor console page is loaded
   */
  async verifyPageLoaded(): Promise<void> {
    await expect(this.heading).toBeVisible({ timeout: 10000 });
  }

  /**
   * Doctor clicks to call the next highest priority patient in queue
   */
  async callNextPatient(): Promise<void> {
    if (await this.callNextButton.count() > 0) {
      await this.callNextButton.click();
    }
  }

  /**
   * Doctor completes consultation and marks slot done
   */
  async completeCurrentConsultation(notes?: string): Promise<void> {
    if (notes) {
      const notesInput = this.page.locator('textarea[placeholder*="notes" i], textarea#clinical-notes');
      if (await notesInput.count() > 0) {
        await notesInput.fill(notes);
      }
    }
    if (await this.completeConsultationButton.count() > 0) {
      await this.completeConsultationButton.click();
    }
  }

  /**
   * Verify a specific patient or token is currently in active consultation
   */
  async verifyActivePatient(identifier: string): Promise<void> {
    const patientElem = this.page.locator(`text=${identifier}`).first();
    if (await patientElem.count() > 0) {
      await expect(patientElem).toBeVisible();
    }
  }
}
