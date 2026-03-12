"use client";

import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { invalidateProfile, invalidateDashboard } from "@/hooks/use-dashboard";

export function useSettings() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phoneNumber: "",
        password: "",
        role: "STUDENT",
        createdAt: "",
        avatarUrl: null as string | null,
    });

    const [originalData, setOriginalData] = useState({
        name: "",
        email: "",
        phoneNumber: "",
    });

    const isDirty = formData.name !== originalData.name || formData.email !== originalData.email || formData.phoneNumber !== originalData.phoneNumber || formData.password.trim() !== "";

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await fetch("/api/student/profile");
                if (res.ok) {
                    const data = await res.json();
                    setFormData({
                        name: data.name || "",
                        email: data.email || "",
                        phoneNumber: data.phoneNumber || "",
                        password: "",
                        role: data.role || "STUDENT",
                        createdAt: data.createdAt ? format(new Date(data.createdAt), "MMMM yyyy", { locale: localeId }) : "",
                        avatarUrl: data.avatarUrl || null,
                    });
                    setOriginalData({
                        name: data.name || "",
                        email: data.email || "",
                        phoneNumber: data.phoneNumber || "",
                    });
                }
            } catch (error) {
                console.error("Failed to fetch profile", error);
                toast.error("Gagal memuat profil");
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Client-side validation
        const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
        if (!allowedTypes.includes(file.type)) {
            toast.error("Hanya file JPG dan PNG yang diperbolehkan.");
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            toast.error("Ukuran file maksimal 2MB.");
            return;
        }

        setUploading(true);

        try {
            const formDataUpload = new FormData();
            formDataUpload.append("file", file);

            const res = await fetch("/api/student/avatar", {
                method: "POST",
                body: formDataUpload,
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Upload gagal");
            }

            setFormData(prev => ({ ...prev, avatarUrl: data.avatarUrl }));
            toast.success("Foto profil berhasil diperbarui!");
            invalidateProfile();
        } catch (error: any) {
            console.error("Avatar upload error:", error);
            toast.error(error.message || "Gagal mengupload foto");
        } finally {
            setUploading(false);
            // Reset file input so same file can be re-selected
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const payload: Record<string, string> = { name: formData.name, email: formData.email };
            if (formData.password.trim() !== "") {
                payload.password = formData.password;
            }
            if (formData.phoneNumber !== originalData.phoneNumber) {
                payload.phoneNumber = formData.phoneNumber;
            }

            const res = await fetch("/api/student/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                toast.success("Profil berhasil diperbarui!");
                setFormData(prev => ({ ...prev, password: "" }));
                setOriginalData({ name: formData.name, email: formData.email, phoneNumber: formData.phoneNumber });
                invalidateProfile();
                invalidateDashboard();
            } else {
                const data = await res.json();
                toast.error(data.message || "Gagal memperbarui profil");
            }
        } catch (error) {
            console.error(error);
            toast.error("Terjadi kesalahan sistem");
        } finally {
            setSaving(false);
        }
    };

    const resetForm = () => {
        setFormData({ ...formData, name: originalData.name, email: originalData.email, phoneNumber: originalData.phoneNumber, password: "" });
    };

    return {
        loading,
        saving,
        uploading,
        formData,
        originalData,
        isDirty,
        fileInputRef,
        handleChange,
        handleAvatarChange,
        handleSubmit,
        resetForm,
    };
}

