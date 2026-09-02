import { Page, expect } from '@playwright/test';

export class TriagePage {
  constructor(private page: Page) {}

  async expectLoaded() {
    await expect(this.page.getByTestId('triage-form')).toBeVisible();
  }

  async fillSymptoms(symptom: string) {
    await this.page.getByTestId('triage-symptom-input').fill(symptom);
  }

  async selectSeverity(level: 'low' | 'moderate' | 'high' | 'emergency') {
    await this.page.getByTestId(`triage-severity-${level}`).click();
  }

  async submit() {
    await this.page.getByTestId('triage-submit').click();
  }

  async expectRecommendationAndPriority() {
    const result = this.page.getByTestId('triage-result');
    await expect(result).toBeVisible();
    const priority = await result.getAttribute('data-priority');
    expect(priority).toBeTruthy();
    return priority;
  }

  async proceedToBooking() {
    await this.page.getByTestId('triage-proceed-booking').click();
  }
}
