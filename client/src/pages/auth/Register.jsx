import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";

const Register = () => {
  const { register, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    organizationName: "",
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    try {
      await register(
        form.name,
        form.email,
        form.password,
        form.organizationName,
      );
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    }
  };

  const isValid =
    form.name &&
    form.email &&
    form.password.length >= 8 &&
    form.organizationName;

  return (
    <div className="min-h-screen bg-[#0d1117] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo / brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-green-400/10 border border-green-400/20 mb-4">
            <span className="text-green-400 text-xl">🔒</span>
          </div>
          <h1 className="text-2xl font-bold text-white">SecureTeam</h1>
          <p className="text-gray-400 text-sm mt-1">
            Create your account and organization
          </p>
        </div>

        {/* Form card */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-8">
          {error && (
            <div className="mb-4 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="Full name"
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Abdulmujeeb"
              required
            />
            <Input
              label="Email"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
            />
            <Input
              label="Password"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Min. 8 characters"
              required
            />
            <Input
              label="Organization name"
              type="text"
              name="organizationName"
              value={form.organizationName}
              onChange={handleChange}
              placeholder="Your company or team name"
              required
            />
            <Button
              type="submit"
              loading={loading}
              disabled={!isValid}
              className="w-full mt-2">
              Create account
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-400 mt-6">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-green-400 hover:text-green-300 transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
