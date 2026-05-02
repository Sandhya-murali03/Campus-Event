const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');

const generateParticipantsExcel = async (eventTitle, participants) => {
  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Participants');

    // Set up columns
    worksheet.columns = [
      { header: 'S.No', key: 'sno', width: 10 },
      { header: 'Name', key: 'name', width: 30 },
      { header: 'Email', key: 'email', width: 35 },
      { header: 'Department', key: 'department', width: 25 },
      { header: 'Year', key: 'year', width: 10 },
      { header: 'Registered At', key: 'registeredAt', width: 20 }
    ];

    // Style the header row
    worksheet.getRow(1).font = { bold: true, size: 12 };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4F46E5' }
    };
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

    // Add data rows
    participants.forEach((participant, index) => {
      worksheet.addRow({
        sno: index + 1,
        name: participant.name,
        email: participant.email,
        department: participant.department,
        year: participant.year || 'N/A',
        registeredAt: new Date(participant.registeredAt).toLocaleString()
      });
    });

    // Style all data rows
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) {
        row.alignment = { vertical: 'middle' };
        row.eachCell((cell) => {
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };
        });
      }
    });

    // Generate filename
    const filename = `${eventTitle.replace(/[^a-z0-9]/gi, '_')}_participants_${Date.now()}.xlsx`;
    const filepath = path.join(__dirname, '../uploads/pdfs', filename);

    // Ensure directory exists
    const dir = path.dirname(filepath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Write to file
    await workbook.xlsx.writeFile(filepath);

    return {
      success: true,
      filename: filename,
      filepath: filepath
    };
  } catch (error) {
    console.error('Error generating Excel:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

module.exports = { generateParticipantsExcel };
