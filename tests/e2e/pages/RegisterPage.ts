import { Page, expect } from '@playwright/test';

export class RegisterPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/register');
  }

  async register(patient: {
    fullName: string; phone: string; email: string; password: string; dob: string;
  }) {
    await this.page.getByTestId('register-fullname').fill(patient.fullName);
    await this.page.getByTestId('register-phone').fill(patient.phone);
    await this.page.getByTestId('register-email').fill(patient.email);
    await this.page.getByTestId('register-dob').fill(patient.dob);
    await this.page.getByTestId('register-password').fill(patient.password);
    await this.page.getByTestId('register-submit').click();
  }

  async expectSuccess() {
    // Adjust: could redirect to /verify-otp, /dashboard, or /select-hospital
    await expect(this.page).toHaveURL(/\/(verify-otp|dashboard|select-hospital)/);
  }

  async completeOtpIfPresent(otp = '123456') {
    const otpField = this.page.getByTestId('otp-input');
    if (await otpField.isVisible({ timeout: 3000 }).catch(() => false)) {
      await otpField.fill(otp);
      await this.page.getByTestId('otp-submit').click();
    }
  }
}
