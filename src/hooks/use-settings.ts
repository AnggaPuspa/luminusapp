"use client";

import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { invalidateProfile, invalidateDashboard } from "@/hooks/use-dashboard";

export function useSettings() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        role: "STUDENT",
        createdAt: "",
        avatarUrl: null as string | null,
    });

    const [originalData, setOriginalData] = useState({
        name: "",
        email: "",
    });

    const isDirty = formData.name !== originalData.name || formData.email !== originalData.email || formData.password.trim() !== "";

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await fetch("/api/student/profile");
                if (res.ok) {
                    const data = await res.json();
                    setFormData({
                        name: data.name || "",
                        email: data.email || "",
                        password: "",
                        role: data.role || "STUDENT",
                        createdAt: data.createdAt ? format(new Date(data.createdAt), "MMMM yyyy", { locale: localeId }) : "",
                        avatarUrl: data.avatarUrl || null,
                    });
                    setOriginalData({
                        name: data.name || "",
                        email: data.email || "",
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

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const imgUrl = URL.createObjectURL(file);
            setFormData(prev => ({ ...prev, avatarUrl: imgUrl }));
            toast.success("Foto profil berhasil diperbarui (Simulasi UX)");
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

            const res = await fetch("/api/student/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                toast.success("Profil berhasil diperbarui!");
                setFormData(prev => ({ ...prev, password: "" }));
                setOriginalData({ name: formData.name, email: formData.email });
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
        setFormData({ ...formData, name: originalData.name, email: originalData.email, password: "" });
    };

    return {
        loading,
        saving,
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
