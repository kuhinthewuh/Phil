import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Circle } from "lucide-react";

const FIELD_LABELS = {
  first_name:       "First Name",
  last_name:        "Last Name",
  phone_number:     "Phone",
  monthly_income:   "Monthly Income",
  dependents:       "Dependents",
  housing_status:   "Housing Status",
};

export default function CollectedDataPanel({ data, dynamicFields }) {
  const fields = dynamicFields && dynamicFields.length > 0 
    ? dynamicFields.map(f => [f.key, f.label || f.key])
    : Object.entries(FIELD_LABELS);
  const filled  = fields.filter(([k]) => data[k] && data[k] !== "Unknown").length;
  const total   = fields.length;
  const pct     = Math.round((filled / total) * 100);

  return (
    <div className="bg-muted/30 border border-border rounded-xl p-4">
      {/* Progress */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          Application Progress
        </span>
        <span className="text-xs font-bold text-primary">{pct}%</span>
      </div>
      <div className="w-full h-1.5 bg-muted rounded-full mb-4 overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-primary"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      </div>

      {/* Fields */}
      <div className="grid grid-cols-2 gap-1.5">
        {fields.map(([key, label]) => {
          const val = data[key];
          const collected = val && val !== "Unknown";
          return (
            <motion.div
              key={key}
              layout
              className="flex items-center gap-2"
            >
              <AnimatePresence mode="wait">
                {collected ? (
                  <motion.div
                    key="check"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                  </motion.div>
                ) : (
                  <Circle className="w-3.5 h-3.5 text-muted-foreground/30 flex-shrink-0" />
                )}
              </AnimatePresence>
              <span className={`text-[11px] truncate ${collected ? "text-foreground" : "text-muted-foreground/40"}`}>
                {label}
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}