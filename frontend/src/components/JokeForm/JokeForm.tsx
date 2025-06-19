import React, { useState } from 'react';
import { jokesAPI } from '../../services/api';
import './JokeForm.css';

interface JokeFormData {
  title: string;
  content: string;
  category: string;
  author: string;
}

interface FormErrors {
  title?: string;
  content?: string;
  category?: string;
  author?: string;
  general?: string;
}

interface JokeFormProps {
  onSuccess?: () => void;
}

const CATEGORIES = [
  { value: '', label: 'Selecione uma categoria' },
  { value: 'comedy', label: 'Comédia' },
  { value: 'puns', label: 'Trocadilhos' },
  { value: 'dad-jokes', label: 'Piadas de Pai' },
  { value: 'programming', label: 'Programação' },
  { value: 'dark-humor', label: 'Humor Negro' },
  { value: 'one-liner', label: 'Uma Linha' },
];

const JokeForm: React.FC<JokeFormProps> = ({ onSuccess }) => {
  const [formData, setFormData] = useState<JokeFormData>({
    title: '',
    content: '',
    category: '',
    author: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Título é obrigatório';
    } else if (formData.title.length > 200) {
      newErrors.title = 'Título não pode exceder 200 caracteres';
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Conteúdo é obrigatório';
    } else if (formData.content.length > 1000) {
      newErrors.content = 'Conteúdo não pode exceder 1000 caracteres';
    }

    if (!formData.category) {
      newErrors.category = 'Categoria é obrigatória';
    }

    if (!formData.author.trim()) {
      newErrors.author = 'Autor é obrigatório';
    } else if (formData.author.length > 100) {
      newErrors.author = 'Nome do autor não pode exceder 100 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined,
      }));
    }

    if (showSuccess) {
      setShowSuccess(false);
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
      const response = await jokesAPI.create({
        title: formData.title.trim(),
        content: formData.content.trim(),
        category: formData.category,
        author: formData.author.trim(),
      });

      if (response.success) {
        setFormData({
          title: '',
          content: '',
          category: '',
          author: '',
        });
        setShowSuccess(true);
        
        if (onSuccess) {
          onSuccess();
        }
      } else {
        setErrors({ general: response.message || 'Erro ao criar piada' });
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Erro de conexão. Tente novamente.';
      setErrors({ general: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="joke-form-container">
      <h2>Adicionar Nova Piada</h2>
      
      {showSuccess && (
        <div className="success-message">
          🎉 Piada adicionada com sucesso!
        </div>
      )}

      {errors.general && (
        <div className="error-message general-error">
          {errors.general}
        </div>
      )}

      <form onSubmit={handleSubmit} className="joke-form">
        <div className="form-group">
          <label htmlFor="title">Título *</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            className={errors.title ? 'error' : ''}
            placeholder="Digite o título da piada..."
            disabled={isLoading}
            maxLength={200}
          />
          <div className="char-counter">
            {formData.title.length}/200
          </div>
          {errors.title && (
            <span className="error-message">{errors.title}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="content">Conteúdo *</label>
          <textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleInputChange}
            className={errors.content ? 'error' : ''}
            placeholder="Digite o conteúdo da piada..."
            disabled={isLoading}
            rows={4}
            maxLength={1000}
          />
          <div className="char-counter">
            {formData.content.length}/1000
          </div>
          {errors.content && (
            <span className="error-message">{errors.content}</span>
          )}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="category">Categoria *</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className={errors.category ? 'error' : ''}
              disabled={isLoading}
            >
              {CATEGORIES.map(cat => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
            {errors.category && (
              <span className="error-message">{errors.category}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="author">Autor *</label>
            <input
              type="text"
              id="author"
              name="author"
              value={formData.author}
              onChange={handleInputChange}
              className={errors.author ? 'error' : ''}
              placeholder="Nome do autor..."
              disabled={isLoading}
              maxLength={100}
            />
            <div className="char-counter">
              {formData.author.length}/100
            </div>
            {errors.author && (
              <span className="error-message">{errors.author}</span>
            )}
          </div>
        </div>

        <button 
          type="submit" 
          className="submit-btn"
          disabled={isLoading}
        >
          {isLoading ? 'Adicionando...' : 'Adicionar Piada'}
        </button>
      </form>
    </div>
  );
};

export default JokeForm;
