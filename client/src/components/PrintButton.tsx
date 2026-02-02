import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { RecyclingFacility } from "./RecyclingCard";

interface PrintButtonProps {
  facility: RecyclingFacility;
}

export function PrintButton({ facility }: PrintButtonProps) {
  const handlePrint = () => {
    // Create a new window for printing
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) {
      alert('Please allow pop-ups to print facility details');
      return;
    }

    // Format category name
    const formatCategory = (cat: string) => {
      return cat
        .replace("Recycling ", "Recycling ")
        .replace("Secondary ", "Secondary ")
        .replace("Recyclers", "Recycling")
        .replace("(MRFs)", "")
        .trim();
    };

    // Generate the print content
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${facility.Name} - Recycling Facility Details</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              padding: 40px;
              max-width: 800px;
              margin: 0 auto;
            }
            .header {
              border-bottom: 3px solid #c45a35;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .logo {
              display: flex;
              align-items: center;
              gap: 10px;
              margin-bottom: 15px;
            }
            .logo-icon {
              width: 40px;
              height: 40px;
              background: #c45a35;
              border-radius: 8px;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-size: 20px;
            }
            .logo-text {
              font-size: 18px;
              font-weight: 600;
              color: #1a3a4a;
            }
            .facility-name {
              font-size: 28px;
              font-weight: 700;
              color: #1a3a4a;
              margin-bottom: 10px;
            }
            .category {
              display: inline-block;
              background: #c45a35;
              color: white;
              padding: 5px 15px;
              border-radius: 20px;
              font-size: 14px;
              font-weight: 500;
            }
            .section {
              margin-bottom: 25px;
            }
            .section-title {
              font-size: 14px;
              font-weight: 600;
              color: #666;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              margin-bottom: 8px;
              border-bottom: 1px solid #eee;
              padding-bottom: 5px;
            }
            .section-content {
              font-size: 16px;
              color: #333;
            }
            .info-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 20px;
            }
            .info-item {
              margin-bottom: 15px;
            }
            .info-label {
              font-size: 12px;
              font-weight: 600;
              color: #666;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .info-value {
              font-size: 15px;
              color: #333;
              margin-top: 3px;
            }
            .info-value a {
              color: #c45a35;
              text-decoration: none;
            }
            .materials {
              background: #f8f5f2;
              padding: 20px;
              border-radius: 10px;
              margin-top: 20px;
            }
            .materials-title {
              font-size: 14px;
              font-weight: 600;
              color: #1a3a4a;
              margin-bottom: 10px;
            }
            .materials-list {
              font-size: 15px;
              color: #333;
            }
            .footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #eee;
              font-size: 12px;
              color: #888;
              text-align: center;
            }
            .qr-section {
              margin-top: 30px;
              text-align: center;
            }
            .qr-text {
              font-size: 12px;
              color: #666;
              margin-top: 10px;
            }
            .directions-box {
              background: #1a3a4a;
              color: white;
              padding: 15px 20px;
              border-radius: 8px;
              margin-top: 20px;
              text-align: center;
            }
            .directions-box a {
              color: white;
              text-decoration: none;
              font-weight: 500;
            }
            @media print {
              body {
                padding: 20px;
              }
              .no-print {
                display: none;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">
              <div class="logo-icon">♻</div>
              <span class="logo-text">National Recycling Directory</span>
            </div>
            <h1 class="facility-name">${facility.Name}</h1>
            <span class="category">${formatCategory(facility.Category)}</span>
          </div>

          <div class="info-grid">
            <div class="section">
              <div class="section-title">Address</div>
              <div class="section-content">${facility.Address}</div>
            </div>

            ${facility.Phone ? `
            <div class="section">
              <div class="section-title">Phone</div>
              <div class="section-content">
                <a href="tel:${facility.Phone}">${facility.Phone}</a>
              </div>
            </div>
            ` : ''}

            ${facility.Email ? `
            <div class="section">
              <div class="section-title">Email</div>
              <div class="section-content">
                <a href="mailto:${facility.Email}">${facility.Email}</a>
              </div>
            </div>
            ` : ''}

            ${facility.Website ? `
            <div class="section">
              <div class="section-title">Website</div>
              <div class="section-content">
                <a href="${facility.Website.startsWith('http') ? facility.Website : 'https://' + facility.Website}" target="_blank">
                  ${facility.Website}
                </a>
              </div>
            </div>
            ` : ''}
          </div>

          ${facility.Feedstock ? `
          <div class="materials">
            <div class="materials-title">Materials Accepted</div>
            <div class="materials-list">${facility.Feedstock}</div>
          </div>
          ` : ''}

          <div class="directions-box">
            <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(facility.Address)}" target="_blank">
              📍 Get Directions on Google Maps
            </a>
          </div>

          <div class="footer">
            <p>Printed from National Recycling Directory by Recyclish LLC</p>
            <p>Visit us at recyclish.com for more recycling resources</p>
            <p style="margin-top: 10px; font-size: 11px; color: #aaa;">
              Printed on ${new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>

          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() {
                window.close();
              };
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className="text-muted-foreground hover:text-primary"
      onClick={(e) => {
        e.stopPropagation();
        handlePrint();
      }}
      title="Print facility details"
    >
      <Printer className="h-5 w-5" />
    </Button>
  );
}
