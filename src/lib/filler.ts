// RadOrderPadFiller - Fills RadOrderPad forms with captured patient data
import { PatientData, InsuranceData, FormFillingResult } from '../types';
import { AuditLogger } from '../security/audit/audit-logger';

export class RadOrderPadFiller {
  private fieldsFilled = 0;
  private errors: string[] = [];

  /**
   * Fills patient data into RadOrderPad forms
   * @param data - The patient data to fill
   * @returns Form filling result
   */
  async fillPatientData(data: PatientData): Promise<FormFillingResult> {
    try {
      this.fieldsFilled = 0;
      this.errors = [];

      // Fill basic demographics
      await this.fillField('[placeholder="First Name"], input[name*="firstName"], #firstName', data.firstName);
      await this.fillField('[placeholder="Last Name"], input[name*="lastName"], #lastName', data.lastName);
      
      if (data.middleName) {
        await this.fillField('[placeholder="Middle Name"], input[name*="middleName"], #middleName', data.middleName);
      }

      await this.fillField('[placeholder="MM/DD/YYYY"], input[name*="dob"], #dob', data.dateOfBirth);
      
      if (data.gender) {
        await this.selectDropdown('[name*="gender"], #gender, select[name*="sex"]', data.gender);
      }

      // Fill contact information
      await this.fillField('[placeholder*="Phone"], input[name*="phone"], #phone', data.phoneNumber);
      
      if (data.email) {
        await this.fillField('[placeholder*="Email"], input[name*="email"], #email', data.email);
      }

      // Fill address information
      await this.fillField('[placeholder*="Address"], input[name*="address"], #address', data.addressLine1);
      
      if (data.addressLine2) {
        await this.fillField('[placeholder*="Address Line 2"], input[name*="address2"], #address2', data.addressLine2);
      }

      await this.fillField('[placeholder*="City"], input[name*="city"], #city', data.city);
      await this.fillField('[placeholder*="State"], input[name*="state"], #state', data.state);
      await this.fillField('[placeholder*="Zip"], input[name*="zip"], #zip', data.zipCode);

      // Fill identifiers
      if (data.mrn) {
        await this.fillField('[placeholder*="MRN"], input[name*="mrn"], #mrn', data.mrn);
      }

      if (data.ssn) {
        await this.fillField('[placeholder*="SSN"], input[name*="ssn"], #ssn', data.ssn);
      }

      const success = this.errors.length === 0;
      AuditLogger.logFormFill(success, this.fieldsFilled);

      return {
        success,
        fieldsFilled: this.fieldsFilled,
        errors: this.errors
      };
    } catch (error) {
      this.errors.push(error instanceof Error ? error.message : 'Unknown error');
      AuditLogger.logFormFill(false, this.fieldsFilled);
      
      return {
        success: false,
        fieldsFilled: this.fieldsFilled,
        errors: this.errors
      };
    }
  }

  /**
   * Fills insurance data into RadOrderPad forms
   * @param data - The insurance data to fill
   * @returns Form filling result
   */
  async fillInsuranceData(data: InsuranceData): Promise<FormFillingResult> {
    try {
      if (!data.hasInsurance) {
        // Handle no insurance case
        await this.selectDropdown('[name*="insurance"], #insurance', 'No Insurance');
        return { success: true, fieldsFilled: 1 };
      }

      if (!data.primary) {
        return { success: false, fieldsFilled: 0, errors: ['No primary insurance data'] };
      }

      // Fill primary insurance
      await this.fillField('[placeholder*="Insurance Company"], input[name*="insurance"], #insurance', data.primary.company);
      await this.fillField('[placeholder*="Policy Number"], input[name*="policy"], #policy', data.primary.policyNumber);
      
      if (data.primary.groupNumber) {
        await this.fillField('[placeholder*="Group Number"], input[name*="group"], #group', data.primary.groupNumber);
      }

      await this.fillField('[placeholder*="Policy Holder"], input[name*="holder"], #holder', data.primary.policyHolderName);
      await this.selectDropdown('[name*="relationship"], #relationship', data.primary.relationshipToPatient);

      if (data.primary.policyHolderDOB) {
        await this.fillField('[placeholder*="Policy Holder DOB"], input[name*="holderDOB"], #holderDOB', data.primary.policyHolderDOB);
      }

      // Fill secondary insurance if available
      if (data.secondary) {
        if (data.secondary.company) {
          await this.fillField('[placeholder*="Secondary Insurance"], input[name*="secondaryInsurance"], #secondaryInsurance', data.secondary.company);
        }
        
        if (data.secondary.policyNumber) {
          await this.fillField('[placeholder*="Secondary Policy"], input[name*="secondaryPolicy"], #secondaryPolicy', data.secondary.policyNumber);
        }
      }

      return { success: true, fieldsFilled: this.fieldsFilled };
    } catch (error) {
      this.errors.push(error instanceof Error ? error.message : 'Unknown error');
      return {
        success: false,
        fieldsFilled: this.fieldsFilled,
        errors: this.errors
      };
    }
  }

  /**
   * Fills a form field with a value
   * @param selector - CSS selector for the field
   * @param value - Value to fill
   */
  private async fillField(selector: string, value: string): Promise<void> {
    if (!value) return;

    try {
      const input = document.querySelector(selector) as HTMLInputElement;
      if (!input) {
        this.errors.push(`Field not found: ${selector}`);
        return;
      }

      // Clear existing value
      input.value = '';
      input.dispatchEvent(new Event('input', { bubbles: true }));

      // Simulate character-by-character input for better compatibility
      for (const char of value) {
        input.value += char;
        input.dispatchEvent(new Event('input', { bubbles: true }));
        await this.wait(10); // Small delay between characters
      }

      // Trigger change event
      input.dispatchEvent(new Event('change', { bubbles: true }));
      input.dispatchEvent(new Event('blur', { bubbles: true }));

      this.fieldsFilled++;
    } catch (error) {
      this.errors.push(`Failed to fill field ${selector}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Selects a value in a dropdown
   * @param selector - CSS selector for the dropdown
   * @param value - Value to select
   */
  private async selectDropdown(selector: string, value: string): Promise<void> {
    if (!value) return;

    try {
      const select = document.querySelector(selector) as HTMLSelectElement;
      if (!select) {
        this.errors.push(`Dropdown not found: ${selector}`);
        return;
      }

      // Find the option with matching value or text
      let optionFound = false;
      for (const option of Array.from(select.options)) {
        if (option.value.toLowerCase() === value.toLowerCase() || 
            option.text.toLowerCase() === value.toLowerCase()) {
          select.value = option.value;
          optionFound = true;
          break;
        }
      }

      if (!optionFound) {
        // Try to set the value directly
        select.value = value;
      }

      // Trigger events
      select.dispatchEvent(new Event('change', { bubbles: true }));
      select.dispatchEvent(new Event('blur', { bubbles: true }));

      this.fieldsFilled++;
    } catch (error) {
      this.errors.push(`Failed to select dropdown ${selector}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Waits for a specified number of milliseconds
   * @param ms - Milliseconds to wait
   */
  private wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Checks if we're on a RadOrderPad page
   * @returns True if on RadOrderPad
   */
  isRadOrderPadPage(): boolean {
    return window.location.hostname.includes('radorderpad.com') ||
           window.location.hostname.includes('localhost') ||
           document.title.toLowerCase().includes('radorderpad');
  }

  /**
   * Gets form statistics
   * @returns Form statistics
   */
  getFormStats(): { fieldsFilled: number; errors: string[] } {
    return {
      fieldsFilled: this.fieldsFilled,
      errors: [...this.errors]
    };
  }

  /**
   * Clears form statistics
   */
  clearStats(): void {
    this.fieldsFilled = 0;
    this.errors = [];
  }
} 