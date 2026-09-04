import { Page, Locator, expect } from '@playwright/test';
import { PatientProfile } from '../fixtures/test-data';

/**
 * Page Object Model for Patient Registration Page (/register)
 */
export class RegisterPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly fullNameInput: Locator;
  readonly phoneInput: Locator;
  readonly abhaIdInput: Locator;
  readonly ageInput: Locator;
  readonly genderSelect: Locator;
  readonly continueButton: Locator;
  readonly errorBanner: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.locator('h2, h1').filter({ hasText: /Patient Registration|Register/i });
    this.fullNameInput = page.locator('input[placeholder*="Full Name" i], input[name="fullName"], input#fullName');
    this.phoneInput = page.locator('input[placeholder*="Phone" i], input[type="tel"], input[name="phone"], input#phone');
    this.abhaIdInput = page.locator('input[placeholder*="ABHA" i], input[name="abhaId"], input#abhaId');
    this.ageInput = page.locator('input[placeholder*="Age" i], input[name="age"], input#age');
    this.genderSelect = page.locator('select[name="gender"], select#gender');
    this.continueButton = page.locator('button, a').filter({ hasText: /Continue|Register|Submit|Next/i }).first();
    this.errorBanner = page.locator('[role="alert"], .text-red-600, .error-message');
  }

  /**
   * Navigate directly to the registration page
   */
  async goto(baseUrl?: string): Promise<void> {
    const targetUrl = baseUrl ? `${baseUrl}/register` : '/register';
    await this.page.goto(targetUrl);
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Verify that the registration page is rendered correctly
   */
  async verifyPageLoaded(): Promise<void> {
    await expect(this.heading).toBeVisible({ timeout: 10000 });
  }

  /**
   * Fill the complete registration form
   */
  async fillRegistration(patient: PatientProfile): Promise<void> {
    if (await this.fullNameInput.count() > 0) {
      await this.fullNameInput.fill(patient.fullName);
    }
    if (await this.phoneInput.count() > 0) {
      await this.phoneInput.fill(patient.phone);
    }
    if (await this.abhaIdInput.count() > 0) {
      await this.abhaIdInput.fill(patient.abhaId);
    }
    if (await this.ageInput.count() > 0) {
      await this.ageInput.fill(patient.age.toString());
    }
    if (await this.genderSelect.count() > 0) {
      await this.genderSelect.selectOption(patient.gender);
    }
  }

  /**
   * Enter ABHA Health ID specifically
   */
  async fillAbhaId(abhaId: string): Promise<void> {
    await this.abhaIdInput.fill(abhaId);
  }

  /**
   * Submit or advance to next step
   */
  async submit(): Promise<void> {
    await expect(this.continueButton).toBeVisible();
    await this.continueButton.click();
  }

  /**
   * Complete registration flow end-to-end
   */
  async registerPatient(patient: PatientProfile): Promise<void> {
    await this.verifyPageLoaded();
    await this.fillRegistration(patient);
    await this.submit();
  }
}
