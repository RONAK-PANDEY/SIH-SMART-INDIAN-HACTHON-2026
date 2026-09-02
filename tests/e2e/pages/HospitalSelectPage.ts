import { Page, expect } from '@playwright/test';

export class HospitalSelectPage {
  constructor(private page: Page) {}

  async selectHospital(name: string) {
    await this.page.getByTestId('hospital-search').fill(name);
    await this.page.getByTestId('hospital-card').filter({ hasText: name }).first().click();
  }

  async selectDepartment(name: string) {
    await this.page.getByTestId('department-card').filter({ hasText: name }).first().click();
  }

  async expectDepartmentListVisible() {
    await expect(this.page.getByTestId('department-card').first()).toBeVisible();
  }
}
