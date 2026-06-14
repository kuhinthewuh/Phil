import React, { useRef } from "react";
import { motion } from "framer-motion";
import { Download, FileCheck, Printer, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import FormField from "./FormField";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default function GovernmentForm({ data, onReset, onChange }) {
  const formRef = useRef(null);

  const handleDownloadPDF = async () => {
    if (!formRef.current) return;
    
    const canvas = await html2canvas(formRef.current, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
    });
    
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    
    const fileName = `Phil_Application_${data.first_name || "Applicant"}_${data.last_name || "Unknown"}.pdf`;
    pdf.save(fileName);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="flex flex-col h-full"
    >
      {/* Top bar */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FileCheck className="w-4 h-4 text-green-600" />
          <span className="text-xs font-semibold uppercase tracking-[0.15em] text-green-700">
            Application Generated
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onReset} className="text-xs gap-1.5">
            <RotateCcw className="w-3 h-3" />
            New
          </Button>
          <Button variant="ghost" size="sm" onClick={() => window.print()} className="text-xs gap-1.5">
            <Printer className="w-3 h-3" />
            Print
          </Button>
        </div>
      </div>

      {/* Form Document */}
      <div className="flex-1 overflow-y-auto">
        <div
          ref={formRef}
          className="bg-white border border-border rounded-xl shadow-sm p-8 max-w-2xl mx-auto"
          style={{ fontFamily: "'Source Serif 4', 'Times New Roman', serif" }}
        >
          {/* Letterhead */}
          <div className="text-center border-b-2 border-gray-800 pb-4 mb-6">
            <div className="text-[10px] uppercase tracking-[0.3em] text-gray-500 mb-1">
              United States Department of Housing and Urban Development
            </div>
            <h1 className="text-lg font-bold text-gray-900 tracking-wide">
              HOUSING ASSISTANCE APPLICATION
            </h1>
            <div className="text-[10px] text-gray-500 mt-1">
              Form HUD-92006 • Emergency Housing & Rental Assistance Program
            </div>
          </div>

          {/* Application ID */}
          <div className="flex justify-between text-[10px] text-gray-500 mb-6">
            <span>Application ID: FF-{Date.now().toString(36).toUpperCase()}</span>
            <span>Date: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span>
          </div>

          {/* Section 1 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="text-xs font-bold uppercase tracking-[0.15em] text-gray-700 border-b border-gray-300 pb-1 mb-4">
              Section I — Applicant Information
            </div>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <FormField label="First Name" value={data.first_name} onChange={(v) => onChange?.("first_name", v)} delay={0.3} />
              <FormField label="Last Name" value={data.last_name} onChange={(v) => onChange?.("last_name", v)} delay={0.4} />
              <FormField label="Phone Number" value={data.phone_number} onChange={(v) => onChange?.("phone_number", v)} delay={0.5} />
              <FormField label="Primary Language" value={data.primary_language} onChange={(v) => onChange?.("primary_language", v)} delay={0.6} />
            </div>
          </motion.div>

          {/* Section 2 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div className="text-xs font-bold uppercase tracking-[0.15em] text-gray-700 border-b border-gray-300 pb-1 mb-4">
              Section II — Household Details
            </div>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <FormField label="Number of Dependents" value={data.dependents} onChange={(v) => onChange?.("dependents", v)} delay={0.7} />
              <FormField label="Housing Status" value={data.housing_status} onChange={(v) => onChange?.("housing_status", v)} delay={0.8} />
            </div>
          </motion.div>

          {/* Section 3 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <div className="text-xs font-bold uppercase tracking-[0.15em] text-gray-700 border-b border-gray-300 pb-1 mb-4">
              Section III — Income Verification
            </div>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <FormField label="Monthly Income ($)" value={data.monthly_income} onChange={(v) => onChange?.("monthly_income", v)} delay={0.9} />
              <FormField label="Annual Income (Est. $)" value={data.monthly_income ? data.monthly_income * 12 : ""} onChange={() => {}} delay={1.0} disabled />
            </div>
          </motion.div>

          {/* Section 4 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1 }}
          >
            <div className="text-xs font-bold uppercase tracking-[0.15em] text-gray-700 border-b border-gray-300 pb-1 mb-4">
              Section IV — Hardship Statement
            </div>
            <div className="mb-6">
              <FormField label="Summary of Circumstances" value={data.hardship_summary} onChange={(v) => onChange?.("hardship_summary", v)} delay={1.2} wide multiline />
            </div>
          </motion.div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4 }}
            className="border-t border-gray-300 pt-4 mt-6"
          >
            <div className="flex justify-between text-[9px] text-gray-400">
              <span>Phil. AI-Assisted Intake System v1.0</span>
              <span>Generated electronically — signature required for submission</span>
            </div>
            <div className="flex gap-16 mt-6">
              <div className="flex-1">
                <div className="border-b border-gray-400 mb-1 h-8" />
                <div className="text-[9px] text-gray-500">Applicant Signature</div>
              </div>
              <div className="w-32">
                <div className="border-b border-gray-400 mb-1 h-8" />
                <div className="text-[9px] text-gray-500">Date</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Download Button */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.6 }}
        className="pt-4"
      >
        <Button
          onClick={handleDownloadPDF}
          size="lg"
          className="w-full h-12 text-sm font-semibold tracking-wide rounded-xl
                     bg-background text-foreground border border-foreground hover:bg-muted
                     shadow-sm"
        >
          <Download className="w-4 h-4 mr-2" />
          Download Official Application PDF
        </Button>
      </motion.div>
    </motion.div>
  );
}