import { useState } from "react";
import { registerUser } from "../api/authApi";
import { Link, useNavigate } from "react-router-dom";
import useRedirectIfLoggedIn from "../hooks/useRedirectIfLoggedIn";
import ErrorAlert from "../components/common/ErrorAlert";
import PrimaryButton from "../components/common/PrimaryButton";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  useRedirectIfLoggedIn();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (isSubmitting) return;
    setFormError("");

    try {
      setIsSubmitting(true);
      await registerUser(name, email, password);
      navigate("/dashboard");
    } catch (error: unknown) {
      if (error instanceof Error) {
        setFormError(error.message);
      } else {
        setFormError("Could not connect to server");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-5 w-full max-w-sm rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-semibold tracking-[-0.04em] text-slate-950">
          Create your account
        </h1>
        <p className="text-sm text-slate-500">
          Start organizing your team's work in TeamFlow.
        </p>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <input
          type="text"
          placeholder="Elguja Modebadze"
          onChange={(e) => setName(e.target.value)}
          value={name}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 placeholder:text-slate-400 outline-none focus:border-[#5e6ad2] focus:ring-2 focus:ring-[#5e69d1]/20"
        />
        <input
          type="email"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
          value={email}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 placeholder:text-slate-400 outline-none focus:border-[#5e6ad2] focus:ring-2 focus:ring-[#5e69d1]/20"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 placeholder:text-slate-400 outline-none focus:border-[#5e6ad2] focus:ring-2 focus:ring-[#5e69d1]/20"
        />
        <PrimaryButton type="submit" fullWidth disabled={isSubmitting}>
          {isSubmitting ? "Registering..." : "Register"}
        </PrimaryButton>
      </form>
      {formError && (
        <ErrorAlert message={formError} onClose={() => setFormError("")} />
      )}
      <p className="text-center text-sm text-slate-500">
        Already have an account?{" "}
        <Link
          to="/login"
          className="font-medium text-[#5e6ad2] hover:text-[#4f5cc8]"
        >
          Log in
        </Link>
      </p>
    </div>
  );
}
