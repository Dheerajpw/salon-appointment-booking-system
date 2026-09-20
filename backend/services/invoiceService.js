
const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");

const generateInvoice = async (invoiceData) => {
    return new Promise((resolve, reject) => {
        try {
            const invoiceDirectory = path.join(
                __dirname,
                "../invoices"
            );

            if (!fs.existsSync(invoiceDirectory)) {
                fs.mkdirSync(invoiceDirectory, {
                    recursive: true
                });
            }

            const invoiceNumber =
                `INV-${invoiceData.appointmentId}-${Date.now()}`;

            const fileName = `${invoiceNumber}.pdf`;

            const filePath = path.join(
                invoiceDirectory,
                fileName
            );

            const doc = new PDFDocument({
                margin: 50
            });

            const stream = fs.createWriteStream(filePath);

            doc.pipe(stream);

            doc
                .fontSize(24)
                .font("Helvetica-Bold")
                .text("SALON INVOICE", {
                    align: "center"
                });

            doc.moveDown();

            doc
                .fontSize(12)
                .font("Helvetica")
                .text(`Invoice Number: ${invoiceNumber}`);

            doc.text(
                `Invoice Date: ${new Date().toLocaleDateString()}`
            );

            doc.moveDown(2);

            doc
                .fontSize(15)
                .font("Helvetica-Bold")
                .text("Customer Details");

            doc.moveDown(0.5);

            doc
                .fontSize(12)
                .font("Helvetica")
                .text(
                    `Name: ${invoiceData.customerName}`
                );

            doc.text(
                `Email: ${invoiceData.customerEmail}`
            );

            doc.moveDown(2);

            doc
                .fontSize(15)
                .font("Helvetica-Bold")
                .text("Appointment Details");

            doc.moveDown(0.5);

            doc
                .fontSize(12)
                .font("Helvetica")
                .text(
                    `Service: ${invoiceData.serviceName}`
                );

            doc.text(
                `Staff: ${invoiceData.staffName}`
            );

            doc.text(
                `Date: ${invoiceData.appointmentDate}`
            );

            doc.text(
                `Time: ${invoiceData.startTime} - ${invoiceData.endTime}`
            );

            doc.moveDown(2);

            doc
                .fontSize(15)
                .font("Helvetica-Bold")
                .text("Payment Details");

            doc.moveDown(0.5);

            doc
                .fontSize(12)
                .font("Helvetica")
                .text(
                    `Amount: INR ${invoiceData.amount}`
                );

            doc.text(
                `Payment Status: ${invoiceData.paymentStatus}`
            );

            doc.text(
                `Payment ID: ${
                    invoiceData.razorpayPaymentId || "N/A"
                }`
            );

            doc.moveDown(2);

            doc
                .fontSize(16)
                .font("Helvetica-Bold")
                .text(
                    `Total Paid: INR ${invoiceData.amount}`,
                    {
                        align: "right"
                    }
                );

            doc.moveDown(3);

            doc
                .fontSize(11)
                .font("Helvetica")
                .text(
                    "Thank you for choosing our salon.",
                    {
                        align: "center"
                    }
                );

            doc.text(
                "This is a computer-generated invoice.",
                {
                    align: "center"
                }
            );

            doc.end();

            stream.on("finish", () => {
                resolve({
                    invoiceNumber,
                    fileName,
                    filePath
                });
            });

            stream.on("error", (error) => {
                reject(error);
            });

        } catch (error) {
            reject(error);
        }
    });
};

module.exports = {
    generateInvoice
};
