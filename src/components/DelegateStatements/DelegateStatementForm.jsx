"use client";

import { useState } from "react";
import AgoraAPI from "../../app/lib/agoraAPI";

export default function DelegateStatementForm(address) {
  const [formData, setFormData] = useState({
    // replace with all the fields from the `delegate_statements` and `delegate_bios` definitions
  });

  const [error, setError] = useState({ 
    // replace with all the fields from the `delegate_statements` and `delegate_bios` definitions
  });

  const handleChange = (event) => {
    setFormData({
      ...formData,
      // update for all the fields from the `delegate_statements` and `delegate_bios` definitions
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    // TODO make this validation more robust
    let hasError = false;
    // add basic error handling for each field based on its type

    // If there's an error, stop form submission
    if (hasError) return;

    // Send POST request to your API
    const api = new AgoraAPI();

    const fullFormData = {
      // update for all the fields from the `delegate_statements` and `delegate_bios` definitions
      address: address,
    };

    const response = await api.post("/statements", fullFormData);
    console.log(response);

    if (!response.ok) {
      // Handle error response here
      console.log("There was an error submitting the form");
    } else {
      // Handle successful response here
      console.log("Form submitted successfully");
      setFormData({ title: "", content: "" });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mt-10 sm:mt-0">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <div className="px-4 sm:px-0">
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                Delegate Statement
              </h3>
              <p className="mt-1 text-sm text-gray-600">
                Create a new delegate statement here.
              </p>
            </div>
          </div>
          <div className="mt-5 md:mt-0 md:col-span-2">
            <div className="px-4 py-5 bg-white sm:p-6">
              <div className="grid grid-cols-6 gap-6">
                <div className="col-span-6 sm:col-span-4">
                  // replace with all the fields from the `delegate_statements` and `delegate_bios` definitions
              </div>
            </div>
            <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
              <button
                type="submit"
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Update Statement
              </button>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
