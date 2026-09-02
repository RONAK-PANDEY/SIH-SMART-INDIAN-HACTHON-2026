import { test, expect } from '@playwright/test';
import { TEST_PATIENTS, TEST_HOSPITALS, TRIAGE_SCENARIOS, TEST_BOOKING_DEFAULTS, TEST_DOCTORS } from './fixtures/test-data';
import { RegisterPage } from './pages/RegisterPage';
import { HospitalSelectPage } from './pages/HospitalSelectPage';
import { TriagePage } from './pages/TriagePage';
import { BookingPage } from './pages/BookingPage';
import { QueueTrackerPage } from './pages/QueueTrackerPage';
import { DoctorConsolePage } from './pages/DoctorConsolePage';

/**
 * SmartCare E2E Test Suite - Smart Indian Hackathon 2026
 * Comprehensive Patient Journey & Doctor Queue Workflow
 */

test.describe('SmartCare E2E: Full Patient Journey & OPD Queue Management', () => {

  test('E2E-01: Patient registration with ABHA ID and demographic profile', async ({ page }) => {
    const registerPage = new RegisterPage(page);
    const patient = TEST_PATIENTS.primary;

    await registerPage.goto();
    await registerPage.verifyPageLoaded();
    await registerPage.fillRegistration(patient);
    await registerPage.submit();

    // Verify transition to hospital selection
    await expect(page).toHaveURL(/.*hospital-select.*/);
  });

  test('E2E-02: Hospital discovery and OPD department selection', async ({ page }) => {
    const hospitalSelectPage = new HospitalSelectPage(page);
    const hospital = TEST_HOSPITALS[0];
    const department = hospital.departments[0];

    await hospitalSelectPage.goto();
    await hospitalSelectPage.verifyPageLoaded();
    await hospitalSelectPage.searchHospital(hospital.city);
    await hospitalSelectPage.selectHospital(hospital.name);
    await hospitalSelectPage.selectDepartment(department.name);
    await hospitalSelectPage.proceedToTriage();

    // Verify navigation to AI Triage
    await expect(page).toHaveURL(/.*triage.*/);
  });

  test('E2E-03: AI Symptom Triage assessment & acuity score calculation', async ({ page }) => {
    const triagePage = new TriagePage(page);
    const scenario = TRIAGE_SCENARIOS.criticalChestPain;

    await triagePage.goto();
    await triagePage.verifyPageLoaded();
    await triagePage.completeTriage(scenario);
    await triagePage.verifyAcuityResult(/Level|Emergency|Cardiology/i);
    await triagePage.proceedToBooking();

    // Verify navigation to slot booking
    await expect(page).toHaveURL(/.*book-appointment.*/);
  });

  test('E2E-04: OPD slot reservation and digital token generation', async ({ page }) => {
    const bookingPage = new BookingPage(page);

    await bookingPage.goto();
    await bookingPage.verifyPageLoaded();
    await bookingPage.bookSlot(TEST_BOOKING_DEFAULTS);
    await bookingPage.proceedToLiveQueue();

    // Verify navigation to live queue tracking
    await expect(page).toHaveURL(/.*live-queue.*/);
  });

  test('E2E-05: Real-time Live Queue ticker & estimated wait tracking', async ({ page }) => {
    const queueTrackerPage = new QueueTrackerPage(page);

    await queueTrackerPage.goto();
    await queueTrackerPage.verifyPageLoaded();
    await queueTrackerPage.verifyServingTokenVisible();
  });

  test('E2E-06: Complete End-to-End Patient Journey with Doctor Consultation Sync', async ({ browser }) => {
    // 1. Patient Browser Context
    const patientContext = await browser.newContext();
    const patientPage = await patientContext.newPage();

    const registerPage = new RegisterPage(patientPage);
    const hospitalSelectPage = new HospitalSelectPage(patientPage);
    const triagePage = new TriagePage(patientPage);
    const bookingPage = new BookingPage(patientPage);
    const queueTrackerPage = new QueueTrackerPage(patientPage);

    // Step A: Register Patient
    await registerPage.goto();
    await registerPage.registerPatient(TEST_PATIENTS.primary);

    // Step B: Select Hospital and Specialty OPD
    await hospitalSelectPage.selectHospital(TEST_HOSPITALS[0].name);
    await hospitalSelectPage.proceedToTriage();

    // Step C: Complete AI Symptom Triage
    await triagePage.completeTriage(TRIAGE_SCENARIOS.criticalChestPain);
    await triagePage.proceedToBooking();

    // Step D: Book OPD Slot & Generate Token
    await bookingPage.bookSlot(TEST_BOOKING_DEFAULTS);
    await bookingPage.proceedToLiveQueue();

    // Step E: Patient monitors Live Queue
    await queueTrackerPage.verifyPageLoaded();

    // 2. Doctor Browser Context (Simulating Doctor OPD Console)
    const doctorContext = await browser.newContext();
    const doctorPage = await doctorContext.newPage();
    const doctorConsolePage = new DoctorConsolePage(doctorPage);

    await doctorConsolePage.goto();
    await doctorConsolePage.verifyPageLoaded();

    // Step F: Doctor calls next patient from the priority queue
    await doctorConsolePage.callNextPatient();

    // Step G: Doctor completes consultation and submits diagnosis
    await doctorConsolePage.completeCurrentConsultation('Prescribed ECG and sublingual nitrates. Follow-up in 48 hours.');

    // Cleanup contexts
    await patientContext.close();
    await doctorContext.close();
  });

});
