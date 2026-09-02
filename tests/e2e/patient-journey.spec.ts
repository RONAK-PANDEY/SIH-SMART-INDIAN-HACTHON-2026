import { test, expect, chromium, Browser } from '@playwright/test';
import { RegisterPage } from './pages/RegisterPage';
import { HospitalSelectPage } from './pages/HospitalSelectPage';
import { TriagePage } from './pages/TriagePage';
import { BookingPage } from './pages/BookingPage';
import { QueueTrackerPage } from './pages/QueueTrackerPage';
import { DoctorConsolePage } from './pages/DoctorConsolePage';
import { uniquePatient, hospital, department, triageAnswers } from './fixtures/test-data';

test.describe('Full patient journey', () => {
  test('register -> select hospital/dept -> triage -> book -> token -> live queue -> called -> visit recorded', async ({
    page,
    browser,
  }) => {
    const patient = uniquePatient();

    // --- 1. Register ---
    const registerPage = new RegisterPage(page);
    await registerPage.goto();
    await registerPage.register(patient);
    await registerPage.completeOtpIfPresent();
    await registerPage.expectSuccess();

    // --- 2. Select hospital / department ---
    const hospitalPage = new HospitalSelectPage(page);
    await page.goto('/select-hospital'); // adjust if register redirects here already
    await hospitalPage.selectHospital(hospital.name);
    await hospitalPage.expectDepartmentListVisible();
    await hospitalPage.selectDepartment(department.name);

    // --- 3. Triage ---
    const triagePage = new TriagePage(page);
    await triagePage.expectLoaded();
    await triagePage.fillSymptoms(triageAnswers.symptom);
    await triagePage.selectSeverity(triageAnswers.severity);
    await triagePage.submit();
    const priority = await triagePage.expectRecommendationAndPriority();
    expect(priority).not.toBeNull();
    await triagePage.proceedToBooking();

    // --- 4. Book appointment ---
    const bookingPage = new BookingPage(page);
    await bookingPage.expectLoaded();
    await bookingPage.selectFirstAvailableSlot();
    await bookingPage.confirmBooking();

    // --- 5. Receive token ---
    const token = await bookingPage.expectTokenIssued();
    expect(token).toMatch(/^[A-Z0-9-]+$/); // adjust to actual token format

    // --- 6. Track live queue ---
    await bookingPage.goToQueueTracker();
    const queuePage = new QueueTrackerPage(page);
    await queuePage.expectLoaded(token);
    const initialPosition = await queuePage.getCurrentPosition();
    expect(initialPosition).toBeGreaterThan(0);

    // --- 7. Doctor calls next patient (separate authenticated context) ---
    const doctorContext = await browser.newContext();
    const doctorPage = await doctorContext.newPage();
    const doctorConsole = new DoctorConsolePage(doctorPage);

    await doctorConsole.loginAsDoctor(
      process.env.DOCTOR_EMAIL || 'doctor.test@hospital.test',
      process.env.DOCTOR_PASSWORD || 'DoctorPass123!'
    );
    await doctorConsole.goToQueue(department.name);

    // Fast-forward: if there are patients ahead in test env, this may need
    // repeated calls; kept simple assuming test DB seeds this patient near-front.
    await doctorConsole.callNextPatient(token);

    // --- 8. Patient sees "called" status live (polling/websocket) ---
    await queuePage.waitForCalledStatus();

    // --- 9. Visit recorded ---
    await doctorConsole.markVisitComplete(token);

    // Confirm patient-side record reflects completed visit
    await page.goto('/appointments/history');
    await expect(
      page.getByTestId('appointment-row').filter({ hasText: token })
    ).toContainText(/completed/i);

    await doctorContext.close();
  });
});
