import { Page, Locator, expect } from '@playwright/test';

/**
 * Page Object Model for Hospital & OPD Selection Page (/hospital-select)
 */
export class HospitalSelectPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly searchInput: Locator;
  readonly hospitalCards: Locator;
  readonly departmentCards: Locator;
  readonly continueToTriageButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.locator('h1, h2').filter({ hasText: /Select Hospital|Hospital|OPD/i });
    this.searchInput = page.locator('input[placeholder*="Search hospital" i], input[type="search"], input#hospital-search');
    this.hospitalCards = page.locator('[data-testid="hospital-card"], .hospital-card, div:has(h3)');
    this.departmentCards = page.locator('[data-testid="dept-card"], .department-card, button:has-text("Cardiology"), button:has-text("Medicine")');
    this.continueToTriageButton = page.locator('button, a').filter({ hasText: /Triage|Continue|Next|Proceed/i }).first();
  }

  /**
   * Navigate directly to hospital select page
   */
  async goto(baseUrl?: string): Promise<void> {
    const targetUrl = baseUrl ? `${baseUrl}/hospital-select` : '/hospital-select';
    await this.page.goto(targetUrl);
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Verify hospital select page is loaded
   */
  async verifyPageLoaded(): Promise<void> {
    await expect(this.heading).toBeVisible({ timeout: 10000 });
  }

  /**
   * Search for a hospital by name or city
   */
  async searchHospital(keyword: string): Promise<void> {
    if (await this.searchInput.count() > 0) {
      await this.searchInput.fill(keyword);
      await this.page.keyboard.press('Enter');
    }
  }

  /**
   * Select a specific hospital by its title or text
   */
  async selectHospital(hospitalName: string): Promise<void> {
    const hospitalItem = this.page.locator(`text=${hospitalName}`).first();
    if (await hospitalItem.count() > 0) {
      await hospitalItem.click();
    }
  }

  /**
   * Select a specific clinical department (e.g., Cardiology, General Medicine)
   */
  async selectDepartment(departmentName: string): Promise<void> {
    const deptItem = this.page.locator(`text=${departmentName}`).first();
    if (await deptItem.count() > 0) {
      await deptItem.click();
    }
  }

  /**
   * Advance to the AI Symptom Triage Assessment
   */
  async proceedToTriage(): Promise<void> {
    if (await this.continueToTriageButton.count() > 0) {
      await this.continueToTriageButton.click();
    } else {
      await this.page.goto('/triage');
    }
  }
}
