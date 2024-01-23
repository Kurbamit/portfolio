import React, { useState } from "react";
import Title from "./Title";

function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
    setSuccessMessage(""); // Clear success message when user starts typing
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    let newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    if (!formData.message.trim()) {
      newErrors.message = "Message is required";
    }

    if (Object.keys(newErrors).length === 0) {
      try {
        const response = await fetch(
          "https://getform.io/f/3f29ffd2-03d6-425c-8ffc-4c253136f65a",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(formData),
          }
        );

        if (response.ok) {
          setSuccessMessage("Form submitted successfully");
          console.log("Form submitted successfully");

          // Clear form fields
          setFormData({
            name: "",
            email: "",
            message: "",
          });
        } else {
          console.error("Error submitting the form");
        }
      } catch (error) {
        console.error("Error submitting the form:", error);
      }
    } else {
      setErrors(newErrors);
    }
  };

  return (
    <div className="flex flex-col mb-10 mx-auto">
      <div className="flex justify-center items-center">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col w-full md:w-7/12"
        >
          <Title>Contact</Title>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Name"
            className="p-2 bg-transparent border-2 rounded-md focus:outline-none"
          />
          {errors.name && <div className="text-red-500">{errors.name}</div>}
          <input
            type="text"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email"
            className="my-2 p-2 bg-transparent border-2 rounded-md focus:outline-none"
          />
          {errors.email && <div className="text-red-500">{errors.email}</div>}
          <textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            placeholder="Message"
            rows="10"
            className="p-2 mb-4 bg-transparent border-2 rounded-md focus:outline-none"
          />
          {errors.message && (
            <div className="text-red-500">{errors.message}</div>
          )}
          <button
            type="submit"
            className="text-center inline-block px-8 py-3 w-max text-base font-medium rounded-md text-white bg-gradient-to-r from-blue-500 to-yellow-500 drop-shadow-md hover:from-blue-600 hover:to-yellow-600 focus:outline-none"
          >
            Send a message
          </button>
          {successMessage && (
            <div className="text-green-500 mt-2">{successMessage}</div>
          )}
        </form>
      </div>
    </div>
  );
}

export default Contact;
