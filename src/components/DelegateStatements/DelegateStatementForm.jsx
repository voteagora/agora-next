"use client";

import { useState } from "react";
import AgoraAPI from "../../app/lib/agoraAPI";

export default function DelegateStatementForm(address) {
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    twitter_handle: "",
    discord_handle: "",
    farcaster_handle: "",
    telegram_handle: "",
    email: "",
    website: "",
    github_handle: "",
    email_verified: "",
    open_to_delegation: "",
    open_to_proposals: "",
    open_to_questions: "",
    agreed_to_code_of_conduct: "",
  });

  const [error, setError] = useState({ title: "", content: "", twitter_handle: "", discord_handle: "", farcaster_handle: "", telegram_handle: "", email: "", website: "", github_handle: "", email_verified: "", open_to_delegation: "", open_to_proposals: "", open_to_questions: "", agreed_to_code_of_conduct: "" });

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

    if (!formData.field1) {
      setError((prevError) => ({
        ...prevError,
        field1: "Field1 is required.",
      }));
      hasError = true;
    } else {
      setError((prevError) => ({ ...prevError, field1: "" }));
    }

    if (!formData.field2) {
      setError((prevError) => ({
        ...prevError,
        field2: "Field2 is required.",
      }));
      hasError = true;
    } else {
      setError((prevError) => ({ ...prevError, field2: "" }));
    }

    if (!formData.field3) {
      setError((prevError) => ({
        ...prevError,
        field3: "Field3 is required.",
      }));
      hasError = true;
    } else {
      setError((prevError) => ({ ...prevError, field3: "" }));
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

    if (!response.ok) {
      // Handle error response here
    } else {
      // Handle successful response here
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
                    htmlFor="twitter_handle"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Twitter Handle
                  </label>
                  <input
                    type="text"
                    name="twitter_handle"
                    id="twitter_handle"
                    autoComplete="off"
                    value={formData.twitter_handle}
                    onChange={handleChange}
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  />
                  {error.twitter_handle && (
                    <p className="text-red-500 text-xs mt-2">{error.twitter_handle}</p>
                  )}
                </div>
                <div className="col-span-6 sm:col-span-4">
                  <label
                    htmlFor="discord_handle"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Discord Handle
                  </label>
                  <input
                    type="text"
                    name="discord_handle"
                    id="discord_handle"
                    autoComplete="off"
                    value={formData.discord_handle}
                    onChange={handleChange}
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  />
                  {error.discord_handle && (
                    <p className="text-red-500 text-xs mt-2">{error.discord_handle}</p>
                  )}
                </div>
                <div className="col-span-6 sm:col-span-4">
                  <label
                    htmlFor="farcaster_handle"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Farcaster Handle
                  </label>
                  <input
                    type="text"
                    name="farcaster_handle"
                    id="farcaster_handle"
                    autoComplete="off"
                    value={formData.farcaster_handle}
                    onChange={handleChange}
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  />
                  {error.farcaster_handle && (
                    <p className="text-red-500 text-xs mt-2">{error.farcaster_handle}</p>
                  )}
                </div>
                <div className="col-span-6 sm:col-span-4">
                  <label
                    htmlFor="telegram_handle"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Telegram Handle
                  </label>
                  <input
                    type="text"
                    name="telegram_handle"
                    id="telegram_handle"
                    autoComplete="off"
                    value={formData.telegram_handle}
                    onChange={handleChange}
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  />
                  {error.telegram_handle && (
                    <p className="text-red-500 text-xs mt-2">{error.telegram_handle}</p>
                  )}
                </div>
                <div className="col-span-6 sm:col-span-4">
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Email
                  </label>
                  <input
                    type="text"
                    name="email"
                    id="email"
                    autoComplete="off"
                    value={formData.email}
                    onChange={handleChange}
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  />
                  {error.email && (
                    <p className="text-red-500 text-xs mt-2">{error.email}</p>
                  )}
                </div>
                <div className="col-span-6 sm:col-span-4">
                  <label
                    htmlFor="website"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Website
                  </label>
                  <input
                    type="text"
                    name="website"
                    id="website"
                    autoComplete="off"
                    value={formData.website}
                    onChange={handleChange}
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  />
                  {error.website && (
                    <p className="text-red-500 text-xs mt-2">{error.website}</p>
                  )}
                </div>
                <div className="col-span-6 sm:col-span-4">
                  <label
                    htmlFor="github_handle"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Github Handle
                  </label>
                  <input
                    type="text"
                    name="github_handle"
                    id="github_handle"
                    autoComplete="off"
                    value={formData.github_handle}
                    onChange={handleChange}
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  />
                  {error.github_handle && (
                    <p className="text-red-500 text-xs mt-2">{error.github_handle}</p>
                  )}
                </div>
                <div className="col-span-6 sm:col-span-4">
                  <label
                    htmlFor="email_verified"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Email Verified
                  </label>
                  <input
                    type="text"
                    name="email_verified"
                    id="email_verified"
                    autoComplete="off"
                    value={formData.email_verified}
                    onChange={handleChange}
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  />
                  {error.email_verified && (
                    <p className="text-red-500 text-xs mt-2">{error.email_verified}</p>
                  )}
                </div>
                <div className="col-span-6 sm:col-span-4">
                  <label
                    htmlFor="open_to_delegation"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Open to Delegation
                  </label>
                  <input
                    type="text"
                    name="open_to_delegation"
                    id="open_to_delegation"
                    autoComplete="off"
                    value={formData.open_to_delegation}
                    onChange={handleChange}
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  />
                  {error.open_to_delegation && (
                    <p className="text-red-500 text-xs mt-2">{error.open_to_delegation}</p>
                  )}
                </div>
                <div className="col-span-6 sm:col-span-4">
                  <label
                    htmlFor="open_to_proposals"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Open to Proposals
                  </label>
                  <input
                    type="text"
                    name="open_to_proposals"
                    id="open_to_proposals"
                    autoComplete="off"
                    value={formData.open_to_proposals}
                    onChange={handleChange}
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  />
                  {error.open_to_proposals && (
                    <p className="text-red-500 text-xs mt-2">{error.open_to_proposals}</p>
                  )}
                </div>
                <div className="col-span-6 sm:col-span-4">
                  <label
                    htmlFor="open_to_questions"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Open to Questions
                  </label>
                  <input
                    type="text"
                    name="open_to_questions"
                    id="open_to_questions"
                    autoComplete="off"
                    value={formData.open_to_questions}
                    onChange={handleChange}
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  />
                  {error.open_to_questions && (
                    <p className="text-red-500 text-xs mt-2">{error.open_to_questions}</p>
                  )}
                </div>
                <div className="col-span-6 sm:col-span-4">
                  <label
                    htmlFor="agreed_to_code_of_conduct"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Agreed to Code of Conduct
                  </label>
                  <input
                    type="text"
                    name="agreed_to_code_of_conduct"
                    id="agreed_to_code_of_conduct"
                    autoComplete="off"
                    value={formData.agreed_to_code_of_conduct}
                    onChange={handleChange}
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  />
                  {error.agreed_to_code_of_conduct && (
                    <p className="text-red-500 text-xs mt-2">{error.agreed_to_code_of_conduct}</p>
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
