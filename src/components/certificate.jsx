// src/components/Certificate.jsx
import React, { useRef } from "react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

const Certificate = ({
  studentName,
  courseName,
  hours,
  completionDate,
  instructorName = "Majed",
  certificateId,
}) => {
  const certificateRef = useRef(null);

  const downloadCertificate = async () => {
    const element = certificateRef.current;
    const canvas = await html2canvas(element, { scale: 2 });
    const data = canvas.toDataURL("image/png");

    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "px",
      format: [canvas.width, canvas.height],
    });

    pdf.addImage(data, "PNG", 0, 0, canvas.width, canvas.height);
    pdf.save(`${studentName}-${courseName}-Certificate.pdf`);
  };

  return (
    <div className="certificate-container">
      <div
        ref={certificateRef}
        className="certificate p-8 bg-white border-4 border-blue-800 relative w-full max-w-4xl mx-auto"
        style={{ aspectRatio: "1.414/1" }}
      >
        {/* Watermark */}
        <div className="absolute inset-0 flex items-center justify-center text-6xl font-bold text-gray-100 opacity-10">
          StudyNest
        </div>

        {/* Header */}
        <div className="flex justify-between mb-6">
          <div className="flex items-center">
            <div className="bg-blue-800 text-white font-bold w-12 h-12 flex items-center justify-center mr-4">
              NN
            </div>
            <div className="text-blue-800 font-bold text-xl">StudyNest</div>
          </div>
          <div className="rounded-lg px-3 py-2 border-2 border-yellow-500 bg-gradient-to-b from-yellow-300 to-yellow-500 text-center">
            <div className="text-yellow-800 font-bold text-xs">POWERED BY</div>
            <div className="font-bold text-sm">
              <span className="text-black">INDIANA</span>
              <span className="text-orange-600">TECH</span>
            </div>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-bold text-blue-800 text-center mt-4 mb-10">
          Certificate of Completion
        </h1>

        {/* Content */}
        <div className="text-center mb-10">
          <p className="text-gray-600 mb-4">This is to certify that</p>
          <h2 className="text-3xl md:text-4xl font-bold text-blue-800 mb-4">
            {studentName}
          </h2>
          <p className="text-gray-600 mb-4">has successfully completed</p>
          <h3 className="text-2xl md:text-3xl font-bold mb-4">{courseName}</h3>
          <p className="text-gray-600">
            with a total of {hours} learning hours
            <br />
            on {completionDate}
          </p>
        </div>

        {/* Footer */}
        <div className="flex justify-between mt-16">
          <div>
            <div className="border-t border-gray-400 w-48 pt-2">
              <p className="text-sm text-gray-600">Instructor Signature</p>
              <p className="font-medium">{instructorName}</p>
            </div>
          </div>
          <div>
            <div className="border-t border-gray-400 w-48 pt-2">
              <p className="text-sm text-gray-600">Certificate ID</p>
              <p className="font-medium">{certificateId}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 text-center">
        <button
          onClick={downloadCertificate}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg"
        >
          Download Certificate
        </button>
      </div>
    </div>
  );
};

export default Certificate;
