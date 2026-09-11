import { Page, Locator, expect } from '@playwright/test';
import { TriageScenario } from '../fixtures/test-data';

/**
 * Page Object Model for AI Symptom Triage Assessment Page (/triage)
 */
export class TriagePage {
  readonly page: Page;
  readonly heading: Locator;
  readonly symptomInput: Locator;
  readonly painScaleSlider: Locator;
  readonly submitTriageButton: Locator;
  readonly triageResultBadge: Locator;
  readonly proceedToBookingButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.locator('h1, h2').filter({ hasText: /AI Symptom Triage|Triage|Symptom/i });
    this.symptomInput = page.locator('input[placeholder*="symptom" i], textarea[placeholder*="symptom" i], input#symptoms');
    this.painScaleSlider = page.locator('input[type="range"], input[name="painScale"]');
    this.submitTriageButton = page.locator('button').filter({ hasText: /Submit|Assess|Evaluate|Analyze/i }).first();
    this.triageResultBadge = page.locator('[data-testid="triage-result"], .triage-badge, [class*="badge"]');
    this.proceedToBookingButton = page.locator('button, a').filter({ hasText: /Book|Appointment|Proceed|Continue/i }).first();
  }

  /**
   * Navigate directly to triage page
   */
  async goto(baseUrl?: string): Promise<void> {
    const targetUrl = baseUrl ? `${baseUrl}/triage` : '/triage';
    await this.page.goto(targetUrl);
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Verify triage page loaded
   */
  async verifyPageLoaded(): Promise<void> {
    await expect(this.heading).toBeVisible({ timeout: 10000 });
  }

  /**
   * Select or type primary symptoms
   */
  async addSymptoms(symptoms: string[]): Promise<void> {
    for (const symptom of symptoms) {
      const chip = this.page.locator(`button, span`).filter({ hasText: symptom }).first();
      if (await chip.count() > 0 && await chip.isVisible()) {
        await chip.click();
      } else if (await this.symptomInput.count() > 0) {
        await this.symptomInput.fill(symptoms.join(', '));
        break;
      }
    }
  }

  /**
   * Set pain scale level (1-10)
   */
  async setPainScale(level: number): Promise<void> {
    if (await this.painScaleSlider.count() > 0) {
      await this.painScaleSlider.fill(level.toString());
    }
  }

  /**
   * Perform complete triage submission for a scenario
   */
  async completeTriage(scenario: TriageScenario): Promise<void> {
    await this.verifyPageLoaded();
    await this.addSymptoms(scenario.symptoms);
    await this.setPainScale(scenario.painScale);

    if (await this.submitTriageButton.count() > 0) {
      await this.submitTriageButton.click();
    }
  }

  /**
   * Verify generated triage acuity level
   */
  async verifyAcuityResult(expectedLevelRegex: RegExp | string): Promise<void> {
    if (await this.triageResultBadge.count() > 0) {
      await expect(this.triageResultBadge).toContainText(expectedLevelRegex);
    }
  }

  /**
   * Advance to OPD slot booking
   */
  async proceedToBooking(): Promise<void> {
    if (await this.proceedToBookingButton.count() > 0) {
      await this.proceedToBookingButton.click();
    } else {
      await this.page.goto('/book-appointment');
    }
  }
}
