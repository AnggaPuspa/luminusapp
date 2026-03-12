'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import '@/styles/auth.css';

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (password !== passwordConfirmation) {
      setError('Password dan konfirmasi password tidak cocok');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          phoneNumber,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registrasi gagal.');
      }

      window.location.href = '/admin';
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat registrasi.');
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
            <h1>Daftar ke Luminus Education</h1>
            <p>Buat akun Anda untuk melanjutkan</p>
          </div>

          {/* Error Messages */}
          {error && (
            <div className="auth-error">
              <i className="fas fa-exclamation-circle"></i>
              <span>{error}</span>
            </div>
          )}

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="auth-form">
            {/* Name field */}
            <div className="auth-input-wrapper">
              <label htmlFor="name">Nama</label>
              <div className="auth-input-field-wrapper">
                <i className="fas fa-user auth-input-icon"></i>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="auth-input-field"
                  placeholder="Masukkan nama Anda"
                  required
                />
              </div>
            </div>

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

            {/* Phone Number field */}
            <div className="auth-input-wrapper">
              <label htmlFor="phoneNumber">Nomor Handphone</label>
              <div className="auth-input-field-wrapper">
                <i className="fas fa-phone auth-input-icon"></i>
                <input
                  type="text"
                  id="phoneNumber"
                  value={phoneNumber}
                  onChange={(e) => {
                    // Hanya izinkan input angka
                    const val = e.target.value;
                    if (val === '' || /^[0-9\b]+$/.test(val)) {
                      setPhoneNumber(val);
                    }
                  }}
                  className="auth-input-field"
                  placeholder="Contoh: 081234567890"
                  pattern="[0-9]*"
                  inputMode="numeric"
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

            {/* Confirm Password field */}
            <div className="auth-input-wrapper">
              <label htmlFor="password_confirmation">Konfirmasi Password</label>
              <div className="auth-input-field-wrapper">
                <i className="fas fa-lock auth-input-icon"></i>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="password_confirmation"
                  value={passwordConfirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
                  className="auth-input-field"
                  placeholder="Konfirmasi password"
                  required
                />
                <i
                  className={`fas ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'} auth-toggle-password`}
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                ></i>
              </div>
            </div>

            {/* Submit button */}
            <button type="submit" className="auth-btn-primary" disabled={loading}>
              {loading ? 'Memproses...' : 'Daftar'}
            </button>

            {/* Login link */}
            <div className="auth-link-section">
              <p>
                Sudah punya akun?{' '}
                <Link href="/login" className="auth-link">
                  Masuk sekarang
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
