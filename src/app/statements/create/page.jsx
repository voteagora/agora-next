"use client";
import React from "react";
import DelegateStatementForm from "../../../components/DelegateStatement/DelegateStatementForm";

export default function Page() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <h1 className="text-2xl font-semibold text-gray-900 mb-4">
        Create a New Statement
      </h1>
      <DelegateStatementForm />
    </div>
  );
}
