'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import '@/styles/auth.css';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:8000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login gagal');
      }

      // Save token to localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Redirect to home
      window.location.href = '/';
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Terjadi kesalahan';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-container">
      <div className="auth-left-side"></div>

      <div className="auth-card">
        <div className="auth-card-content">
          {/* Logo */}
          <div className="auth-logo-container">
            <Image src="/images/logo2.png" alt="Luminus Logo" width={40} height={40} />
            <span className="auth-logo-text">Luminus Education</span>
          </div>

          {/* Header */}
          <div className="auth-header">
            <h1>Masuk ke Luminus Education</h1>
            <p>Gunakan akun Anda untuk masuk</p>
          </div>

          {/* Error Messages */}
          {error && (
            <div className="auth-error">
              <i className="fas fa-exclamation-circle"></i>
              <span>{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="auth-form">
            {/* Email field */}
            <div className="auth-input-wrapper">
              <label htmlFor="email">Email</label>
              <div className="auth-input-field-wrapper">
                <i className="fas fa-envelope auth-input-icon"></i>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="auth-input-field"
                  placeholder="Masukkan email Anda"
                  required
                />
              </div>
            </div>

            {/* Password field */}
            <div className="auth-input-wrapper">
              <label htmlFor="password">Password</label>
              <div className="auth-input-field-wrapper">
                <i className="fas fa-lock auth-input-icon"></i>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="auth-input-field"
                  placeholder="Masukkan password"
                  required
                />
                <i
                  className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'} auth-toggle-password`}
                  onClick={() => setShowPassword(!showPassword)}
                ></i>
              </div>
            </div>

            {/* Remember me & Forgot password */}
            <div className="auth-options">
              <label className="auth-checkbox-label">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="auth-checkbox"
                />
                <span>Ingat saya</span>
              </label>
              <Link href="/forgot-password" className="auth-forgot-link">
                Lupa Password?
              </Link>
            </div>

            {/* Submit button */}
            <button type="submit" className="auth-btn-primary" disabled={loading}>
              {loading ? 'Memproses...' : 'Masuk'}
            </button>

            {/* Register link */}
            <div className="auth-link-section">
              <p>
                Belum punya akun?{' '}
                <Link href="/register" className="auth-link">
                  Daftar sekarang
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
