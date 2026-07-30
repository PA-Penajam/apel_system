<?php

namespace App\Services;

use App\Models\User;

/**
 * Central source of truth for apel role eligibility.
 *
 * Each role has a primary criterion plus ordered fallback criteria.
 * Gender is always required except for the "Pembina Apel" role.
 */
class RoleEligibilityService
{
    /**
     * Ordered list of role names used in an apel schedule.
     *
     * @return list<string>
     */
    public static function roles(): array
    {
        return [
            'Pembina Apel',
            'Pembaca Doa',
            'Pembaca 8 Nilai MA',
            'MC',
            'Pemimpin Apel',
            'Pembaca Lainnya',
        ];
    }

    /**
     * Get the eligibility criteria for a role.
     *
     * Returns an ordered list of criteria. The first criterion is the primary
     * rule; subsequent entries are fallback criteria.
     *
     * Each criterion is an array with optional keys:
     *   - jenis_jabatan: string|string[] (required value(s))
     *   - gender: 'L'|'P'
     *
     * @return list<array{jenis_jabatan?: string|list<string>, gender?: string}>
     */
    public static function criteriaForRole(string $roleName): array
    {
        return match ($roleName) {
            'Pembina Apel' => [
                ['jenis_jabatan' => 'Pimpinan'],
            ],

            'Pembaca Doa' => [
                ['jenis_jabatan' => ['Struktural', 'Fungsional'], 'gender' => 'L'],
                ['jenis_jabatan' => 'Staff', 'gender' => 'L'],
                ['jenis_jabatan' => ['Struktural', 'Fungsional'], 'gender' => 'P'],
                ['jenis_jabatan' => 'Staff', 'gender' => 'P'],
            ],

            'Pembaca 8 Nilai MA' => [
                ['jenis_jabatan' => ['Struktural', 'Fungsional'], 'gender' => 'P'],
                ['jenis_jabatan' => ['Struktural', 'Fungsional'], 'gender' => 'L'],
                ['jenis_jabatan' => 'Staff', 'gender' => 'P'],
                ['jenis_jabatan' => 'Staff', 'gender' => 'L'],
            ],

            'MC' => [
                ['jenis_jabatan' => 'Staff', 'gender' => 'P'],
                ['jenis_jabatan' => 'Staff', 'gender' => 'L'],
                ['jenis_jabatan' => ['Struktural', 'Fungsional'], 'gender' => 'P'],
                ['jenis_jabatan' => ['Struktural', 'Fungsional'], 'gender' => 'L'],
            ],

            'Pemimpin Apel' => [
                ['jenis_jabatan' => 'Staff', 'gender' => 'L'],
                ['jenis_jabatan' => 'Staff', 'gender' => 'P'],
                ['jenis_jabatan' => ['Struktural', 'Fungsional'], 'gender' => 'L'],
                ['jenis_jabatan' => ['Struktural', 'Fungsional'], 'gender' => 'P'],
            ],

            'Pembaca Lainnya' => [
                ['jenis_jabatan' => 'Staff', 'gender' => 'P'],
                ['jenis_jabatan' => 'Staff', 'gender' => 'L'],
                ['jenis_jabatan' => ['Struktural', 'Fungsional'], 'gender' => 'P'],
                ['jenis_jabatan' => ['Struktural', 'Fungsional'], 'gender' => 'L'],
            ],

            default => [],
        };
    }

    /**
     * Determine whether a user matches a given criterion.
     *
     * @param  array{jenis_jabatan?: string|list<string>, gender?: string}  $criterion
     */
    public static function userMatchesCriterion(User $user, array $criterion): bool
    {
        if (! $user->is_active) {
            return false;
        }

        if (isset($criterion['gender']) && $user->gender !== $criterion['gender']) {
            return false;
        }

        if (isset($criterion['jenis_jabatan'])) {
            $allowed = is_array($criterion['jenis_jabatan'])
                ? $criterion['jenis_jabatan']
                : [$criterion['jenis_jabatan']];

            if (! in_array(strtolower($user->jenis_jabatan), array_map('strtolower', $allowed), true)) {
                return false;
            }
        }

        return true;
    }

    /**
     * Check if a user is eligible for a role (primary or fallback).
     */
    public static function isEligible(User $user, string $roleName): bool
    {
        foreach (self::criteriaForRole($roleName) as $criterion) {
            if (self::userMatchesCriterion($user, $criterion)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Get the primary criterion for a role.
     *
     * @return array{jenis_jabatan?: string|list<string>, gender?: string}|null
     */
    public static function primaryCriterion(string $roleName): ?array
    {
        $criteria = self::criteriaForRole($roleName);

        return $criteria[0] ?? null;
    }
}
