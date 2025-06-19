import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authAPI } from "../../services/api";
import { setAuthData } from "../../utils/auth";
import "./Login.css";

interface LoginFormData {
  email: string;
  password: string;
}

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email ou usuário é obrigatório";
    }

    if (!formData.password) {
      newErrors.password = "Senha é obrigatória";
    } else if (formData.password.length < 6) {
      newErrors.password = "Senha deve ter pelo menos 6 caracteres";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const response = await authAPI.login({
        email: formData.email,
        password: formData.password,
      });

      if (response.success) {
        setAuthData(response.data.user, response.data.token);
        navigate("/dashboard");
      } else {
        setErrors({ general: response.message || "Erro no login" });
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Erro de conexão. Tente novamente.";
      setErrors({ general: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-header">
        <h1>O Piadista</h1>
        <p>Gerador de piadas aleatórias em Português</p>
      </div>

      <form onSubmit={handleSubmit} className="login-form">
        <h2>Entre na sua conta</h2>

        {errors.general && (
          <div className="error-message general-error">{errors.general}</div>
        )}

        <div className="form-group">
          <label htmlFor="email">Email ou Usuário</label>
          <input
            type="text"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className={errors.email ? "error" : ""}
            placeholder="Digite seu email ou usuário"
            disabled={isLoading}
          />
          {errors.email && (
            <span className="error-message">{errors.email}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="password">Senha</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            className={errors.password ? "error" : ""}
            placeholder="Digite sua senha"
            disabled={isLoading}
          />
          {errors.password && (
            <span className="error-message">{errors.password}</span>
          )}
        </div>

        <button type="submit" className="login-btn" disabled={isLoading}>
          {isLoading ? "Entrando..." : "Entrar"}
        </button>

        <div className="login-info">
          <h3>Contas de Teste:</h3>
          <ul>
            <li>
              <strong>admin@test.com</strong> / admin123
            </li>
            <li>
              <strong>user@test.com</strong> / user123
            </li>
            <li>
              <strong>jokemaster@test.com</strong> / jokes123
            </li>
          </ul>
        </div>
      </form>
    </div>
  );
};

export default Login;
