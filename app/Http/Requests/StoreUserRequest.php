<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'nip' => ['nullable', 'string', 'max:255', 'unique:users'],
            'email' => ['nullable', 'string', 'email', 'max:255', 'unique:users'],
            'jabatan' => ['nullable', 'string', 'max:255'],
            'jenis_pegawai' => ['required', 'string', 'max:255'],
            'jenis_jabatan' => ['required', 'string', 'max:255'],
            'gender' => ['required', Rule::in(['L', 'P'])],
            'phone' => ['nullable', 'string', 'max:255'],
            'role' => ['nullable', 'string', 'max:255'],
            'is_active' => ['nullable', 'boolean'],
        ];
    }

    /**
     * Provide a synthetic email when the field is omitted so that the unique
     * database constraint remains satisfied while the UI does not require it.
     */
    protected function prepareForValidation(): void
    {
        if (! $this->filled('email')) {
            $this->merge([
                'email' => 'pegawai_'.uniqid().'@apel.local',
            ]);
        }
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Nama lengkap wajib diisi.',
            'jenis_pegawai.required' => 'Jenis pegawai wajib dipilih.',
            'jenis_jabatan.required' => 'Kategori jabatan wajib dipilih.',
            'gender.required' => 'Jenis kelamin wajib dipilih.',
            'gender.in' => 'Jenis kelamin harus Laki-laki atau Perempuan.',
            'email.email' => 'Format email tidak valid.',
            'email.unique' => 'Email sudah digunakan.',
            'nip.unique' => 'NIP sudah digunakan.',
        ];
    }
}
