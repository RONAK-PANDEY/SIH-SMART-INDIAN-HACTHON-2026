import { Page, expect } from '@playwright/test';

export class DoctorConsolePage {
  constructor(private page: Page) {}

  async loginAsDoctor(email: string, password: string) {
    await this.page.goto('/staff/login');
    await this.page.getByTestId('staff-email').fill(email);
    await this.page.getByTestId('staff-password').fill(password);
    await this.page.getByTestId('staff-login-submit').click();
    await expect(this.page).toHaveURL(/\/staff\/dashboard/);
  }

  async goToQueue(department: string) {
    await this.page.goto('/staff/queue');
    await this.page.getByTestId('department-filter').selectOption({ label: department });
  }

  async callNextPatient(expectedToken: string) {
    const nextRow = this.page.getByTestId('queue-row').filter({ hasText: expectedToken });
    await expect(nextRow).toBeVisible({ timeout: 20_000 });
    await nextRow.getByTestId('call-next-btn').click();
    await expect(nextRow.getByTestId('row-status')).toHaveText(/called/i);
  }

  async markVisitComplete(expectedToken: string) {
    const row = this.page.getByTestId('queue-row').filter({ hasText: expectedToken });
    await row.getByTestId('complete-visit-btn').click();
    await expect(row.getByTestId('row-status')).toHaveText(/completed/i);
  }
}
