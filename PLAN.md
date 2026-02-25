# Mission: Recyclish Hub - Under Construction

This plan outlines the steps to verify the Porkbun API connection, create a branded 'Under Construction' landing page, and manage DNS records for `recyclish.pet`.

## 1. Porkbun API Verification
- **Objective**: Ensure the provided API keys in `.env` are valid and can communicate with Porkbun.
- **Action**: Create a verification script `scripts/porkbun-verify.ts` that:
  - Loads credentials from `.env`.
  - Calls the Porkbun `ping` endpoint (`https://porkbun.com/api/json/v3/ping`).
  - Lists current DNS records for `recyclish.pet` to verify domain access.
- **Verification**: Output the status of the connection and the current DNS configuration.

## 2. Branded 'Under Construction' Landing Page
- **Objective**: Create a professional, on-brand landing page for the upcoming animal shelter directory.
- **Design Specifications**:
  - **Colors**: Recyclish Palette (Terracotta, Ocean Blue, Cream).
  - **Typography**: Playfair Display (Headers), Source Sans 3 (Body).
  - **Content**: 
    - Heading: "Coming Soon: The Animal Shelter Directory"
    - Subheading: "We're building a new home for our furry friends. Stay tuned!"
    - Branding: "Powered by Recyclish"
- **Implementation**:
  - Create `client/src/pages/UnderConstruction.tsx`.
  - (Optional) Create a `client/src/components/layout/LandingLayout.tsx` for a clean, distraction-free view.
  - Add route in `client/src/App.tsx`.

## 3. DNS Record Management
- **Objective**: Prepare the domain for the new landing page.
- **Action**: 
  - Identify the target IP address or CNAME for deployment (if applicable).
  - Update the Porkbun DNS records for `recyclish.pet`.
  - **Notification**: I will notify you immediately when the DNS update process is initiated.

## 4. Execution Sequence
1. **Verify** API connection.
2. **Develop** the landing page component.
3. **Present** the design (screenshot/mockup).
4. **Update** DNS records upon confirmation (or as requested).

---
**Status**: Pending Approval.
