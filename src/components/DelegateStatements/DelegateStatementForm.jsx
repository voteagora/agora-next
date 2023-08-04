"use client";

import { useState } from "react";
import AgoraAPI from "../../app/lib/agoraAPI";

export default function DelegateStatementForm(address) {
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    bio: "",
    token: "",
    created_at: "",
    updated_at: "",
  });

  const [error, setError] = useState({ title: "", content: "", bio: "", token: "", created_at: "", updated_at: "" });

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    // TODO make this validation more robust
    let hasError = false;
    if (!formData.title) {
      setError((prevError) => ({ ...prevError, title: "Title is required." }));
      hasError = true;
    } else {
      setError((prevError) => ({ ...prevError, title: "" }));
    }

    if (!formData.content) {
      setError((prevError) => ({
        ...prevError,
        content: "Content is required.",
      }));
      hasError = true;
    } else {
      setError((prevError) => ({ ...prevError, content: "" }));
    }

    if (!formData.bio) {
      setError((prevError) => ({
        ...prevError,
        bio: "Bio is required.",
      }));
      hasError = true;
    } else {
      setError((prevError) => ({ ...prevError, bio: "" }));
    }

    if (!formData.token) {
      setError((prevError) => ({
        ...prevError,
        token: "Token is required.",
      }));
      hasError = true;
    } else {
      setError((prevError) => ({ ...prevError, token: "" }));
    }

    if (!formData.created_at) {
      setError((prevError) => ({
        ...prevError,
        created_at: "Created at is required.",
      }));
      hasError = true;
    } else {
      setError((prevError) => ({ ...prevError, created_at: "" }));
    }

    if (!formData.updated_at) {
      setError((prevError) => ({
        ...prevError,
        updated_at: "Updated at is required.",
      }));
      hasError = true;
    } else {
      setError((prevError) => ({ ...prevError, updated_at: "" }));
    }

    // If there's an error, stop form submission
    if (hasError) return;

    // Send POST request to your API
    const api = new AgoraAPI();

    const fullFormData = {
      ...formData,
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
                  <label
                    htmlFor="title"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    id="title"
                    autoComplete="off"
                    value={formData.title}
                    onChange={handleChange}
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  />
                  {error.title && (
                    <p className="text-red-500 text-xs mt-2">{error.title}</p>
                  )}
                </div>
                <div className="col-span-6">
                  <label
                    htmlFor="content"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Content
                  </label>
                  <textarea
                    id="content"
                    name="content"
                    rows={3}
                    value={formData.content}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 mt-1 block w-full sm:text-sm border border-gray-300 rounded-md"
                    placeholder="Enter your statement content"
                  ></textarea>
                  {error.content && (
                    <p className="text-red-500 text-xs mt-2">{error.content}</p>
                  )}
                </div>
                <div className="col-span-6 sm:col-span-4">
                  <label
                    htmlFor="bio"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Bio
                  </label>
                  <input
                    type="text"
                    name="bio"
                    id="bio"
                    autoComplete="off"
                    value={formData.bio}
                    onChange={handleChange}
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  />
                  {error.bio && (
                    <p className="text-red-500 text-xs mt-2">{error.bio}</p>
                  )}
                </div>
                <div className="col-span-6 sm:col-span-4">
                  <label
                    htmlFor="token"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Token
                  </label>
                  <input
                    type="text"
                    name="token"
                    id="token"
                    autoComplete="off"
                    value={formData.token}
                    onChange={handleChange}
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  />
                  {error.token && (
                    <p className="text-red-500 text-xs mt-2">{error.token}</p>
                  )}
                </div>
                <div className="col-span-6 sm:col-span-4">
                  <label
                    htmlFor="created_at"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Created At
                  </label>
                  <input
                    type="date"
                    name="created_at"
                    id="created_at"
                    autoComplete="off"
                    value={formData.created_at}
                    onChange={handleChange}
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  />
                  {error.created_at && (
                    <p className="text-red-500 text-xs mt-2">{error.created_at}</p>
                  )}
                </div>
                <div className="col-span-6 sm:col-span-4">
                  <label
                    htmlFor="updated_at"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Updated At
                  </label>
                  <input
                    type="date"
                    name="updated_at"
                    id="updated_at"
                    autoComplete="off"
                    value={formData.updated_at}
                    onChange={handleChange}
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  />
                  {error.updated_at && (
                    <p className="text-red-500 text-xs mt-2">{error.updated_at}</p>
                  )}
                </div>
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
