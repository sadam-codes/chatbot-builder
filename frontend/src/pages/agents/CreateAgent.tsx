import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { FiArrowLeft, FiMessageCircle, FiSave, FiCheck, FiUser, FiFileText, FiEye } from "react-icons/fi";

const OPENAI_MODELS = [
  { value: "gpt-4o", label: "GPT-4o" },
  { value: "gpt-4o-mini", label: "GPT-4o Mini" },
  { value: "gpt-4-turbo", label: "GPT-4 Turbo" },
  { value: "gpt-4", label: "GPT-4" },
  { value: "gpt-3.5-turbo", label: "GPT-3.5 Turbo" },
];

const STEPS = [
  { id: 1, title: "Basic Info", description: "Name & Model", icon: FiMessageCircle },
  { id: 2, title: "Agent Role", description: "Define Persona", icon: FiUser },
  { id: 3, title: "Instructions", description: "Set Guidelines", icon: FiFileText },
  { id: 4, title: "Review", description: "Confirm & Create", icon: FiEye },
];

export default function CreateAgent() {
  const navigate = useNavigate();
  // @ts-ignore
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000/api/v1";

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    model: "gpt-3.5-turbo",
    role: "",
    instructions: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
    if (!formData.name.trim()) {
      toast.error("Bot name is required");
          return false;
    }
        return true;
      case 2:
    if (!formData.role.trim()) {
      toast.error("Agent role is required");
          return false;
    }
        return true;
      case 3:
    if (!formData.instructions.trim()) {
      toast.error("Agent instructions are required");
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length));
    }
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) return;

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please login first");
        navigate("/auth");
        return;
      }

      const response = await fetch(`${BACKEND_URL}/chatbot/agents`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create agent");
      }

      const agent = await response.json();
      toast.success("Agent created successfully!");
      navigate(`/chat/${agent.id}`);
    } catch (error: any) {
      toast.error(error.message || "Failed to create agent");
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
  return (
          <div className="space-y-6 animate-in">
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-slate-700 mb-2">
                Bot Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Customer Support Bot"
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-slate-900"
                required
              />
              <p className="mt-2 text-sm text-slate-500">Give your agent a memorable name</p>
            </div>

            <div>
              <label htmlFor="model" className="block text-sm font-semibold text-slate-700 mb-2">
                OpenAI Model <span className="text-red-500">*</span>
              </label>
              <select
                id="model"
                name="model"
                value={formData.model}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-white text-slate-900"
                required
              >
                {OPENAI_MODELS.map((model) => (
                  <option key={model.value} value={model.value}>
                    {model.label}
                  </option>
                ))}
              </select>
              <p className="mt-2 text-sm text-slate-500">Choose the AI model powering your agent</p>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6 animate-in">
            <div>
              <label htmlFor="role" className="block text-sm font-semibold text-slate-700 mb-2">
                Agent Role <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                placeholder="e.g., Customer Support Specialist, Coding Assistant, Marketing Expert"
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-slate-900"
                required
              />
              <p className="mt-2 text-sm text-slate-500">
                Describe the role or persona of your agent. This helps define its character and expertise.
              </p>
            </div>
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
              <p className="text-sm text-emerald-800">
                <strong>Tip:</strong> Be specific about the role. For example, instead of "Helper", use "Customer Support Specialist focused on technical issues".
              </p>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6 animate-in">
            <div>
              <label htmlFor="instructions" className="block text-sm font-semibold text-slate-700 mb-2">
                Agent Instructions <span className="text-red-500">*</span>
              </label>
              <textarea
                id="instructions"
                name="instructions"
                value={formData.instructions}
                onChange={handleChange}
                placeholder="Enter detailed instructions for your agent. This will define how the agent behaves and responds to users..."
                rows={10}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all resize-none text-slate-900"
                required
              />
              <p className="mt-2 text-sm text-slate-500">
                Provide clear, detailed instructions. The agent will strictly follow these guidelines in all interactions.
              </p>
            </div>
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
              <p className="text-sm text-emerald-800">
                <strong>Example:</strong> "You are a friendly customer support agent. Always greet users warmly, listen carefully to their concerns, and provide helpful solutions. If you don't know something, admit it and escalate to human support."
              </p>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6 animate-in">
            <div className="bg-emerald-50 rounded-xl p-6 border border-emerald-200">
              <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <FiEye className="w-5 h-5 text-emerald-600" />
                Review Your Agent
              </h3>
              <div className="space-y-4">
                <div className="bg-white rounded-lg p-4 border border-slate-200">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Bot Name</p>
                  <p className="text-slate-900 font-medium">{formData.name || <span className="text-slate-400">Not set</span>}</p>
                </div>
                <div className="bg-white rounded-lg p-4 border border-slate-200">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Model</p>
                  <p className="text-slate-900 font-medium">{OPENAI_MODELS.find((m) => m.value === formData.model)?.label || formData.model}</p>
                </div>
                <div className="bg-white rounded-lg p-4 border border-slate-200">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Role</p>
                  <p className="text-slate-900 font-medium">{formData.role || <span className="text-slate-400">Not set</span>}</p>
                </div>
                <div className="bg-white rounded-lg p-4 border border-slate-200">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Instructions</p>
                  <p className="text-slate-900 text-sm whitespace-pre-wrap max-h-40 overflow-y-auto custom-scrollbar">
                    {formData.instructions || <span className="text-slate-400">Not set</span>}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
              <p className="text-sm text-emerald-800 flex items-center gap-2">
                <FiCheck className="w-4 h-4" />
                Ready to create your agent? Click "Create Agent" below to finalize.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-emerald-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 transition-colors group"
          >
            <FiArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span>Back</span>
          </button>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-14 h-14 rounded-2xl bg-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/25">
              <FiMessageCircle className="text-white w-7 h-7" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Create New Agent</h1>
              <p className="text-slate-600 mt-1">Step {currentStep} of {STEPS.length}</p>
            </div>
          </div>
        </div>

        {/* Stepper */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 border border-slate-100">
          <div className="flex items-center justify-between relative">
            {/* Connection Lines */}
            <div className="absolute top-6 left-0 right-0 h-0.5 bg-slate-200 -z-0" style={{ margin: '0 2rem' }}>
              <div
                className="h-full bg-emerald-600 transition-all duration-500 ease-out"
                style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
              />
            </div>

            {STEPS.map((step, index) => {
              const StepIcon = step.icon;
              const isCompleted = currentStep > step.id;
              const isCurrent = currentStep === step.id;
              const isUpcoming = currentStep < step.id;

              return (
                <div key={step.id} className="flex flex-col items-center relative z-10 flex-1">
                  <button
                    onClick={() => {
                      if (step.id < currentStep || validateStep(currentStep)) {
                        setCurrentStep(step.id);
                      }
                    }}
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                      isCompleted
                        ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/30 scale-110"
                        : isCurrent
                        ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/30 scale-110 ring-4 ring-emerald-200"
                        : "bg-slate-200 text-slate-400 hover:bg-slate-300"
                    } ${isUpcoming ? "cursor-not-allowed" : "cursor-pointer"}`}
                    disabled={isUpcoming}
                  >
                    {isCompleted ? (
                      <FiCheck className="w-6 h-6" />
                    ) : (
                      <StepIcon className="w-6 h-6" />
                    )}
                  </button>
                  <div className="mt-3 text-center">
                    <p
                      className={`text-sm font-semibold transition-colors ${
                        isCurrent || isCompleted ? "text-slate-900" : "text-slate-400"
                      }`}
                    >
                      {step.title}
                    </p>
                    <p
                      className={`text-xs mt-1 transition-colors ${
                        isCurrent || isCompleted ? "text-slate-600" : "text-slate-400"
                      }`}
                    >
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900">{STEPS[currentStep - 1].title}</h2>
            <p className="text-slate-600 mt-1">{STEPS[currentStep - 1].description}</p>
          </div>

          {renderStepContent()}

          {/* Navigation Buttons */}
          <div className="flex gap-4 pt-8 mt-8 border-t border-slate-200">
            <button
              type="button"
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className="flex-1 px-6 py-3 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium disabled:hover:bg-white"
            >
              Previous
            </button>

            {currentStep < STEPS.length ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all font-medium shadow-lg shadow-emerald-500/25"
              >
                Next
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <FiSave className="w-5 h-5" />
                    Create Agent
                  </>
                )}
              </button>
            )}
            </div>
        </div>
      </div>
    </div>
  );
}

