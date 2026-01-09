-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Jan 2025
-- Server version: 10.6.24-MariaDB-cll-lve
-- PHP Version: 8.4.16

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `papenaja_wfa`
--

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `gender` char(1) DEFAULT NULL COMMENT 'L=Laki, P=Perempuan',
  `jenis_pegawai` varchar(20) DEFAULT NULL COMMENT 'Hakim, PNS, CPAPES, PPPK',
  `jenis_jabatan` varchar(20) DEFAULT NULL COMMENT 'pimpinan, Struktural, Fungsional, Staff',
  `nip` varchar(50) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `two_factor_secret` text DEFAULT NULL,
  `two_factor_recovery_codes` text DEFAULT NULL,
  `two_factor_confirmed_at` timestamp NULL DEFAULT NULL,
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `jabatan` varchar(255) DEFAULT NULL,
  `unit_id` bigint(20) UNSIGNED DEFAULT NULL,
  `role` varchar(20) NOT NULL DEFAULT 'pegawai',
  `settings` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`settings`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `phone`, `gender`, `jenis_pegawai`, `jenis_jabatan`, `nip`, `jabatan`, `unit_id`, `role`) VALUES
-- ADMIN
(1, 'Administrator', 'admin@pa-penajam.go.id', NULL, NULL, 'admin', 'pimpinan', '000000000000000000', 'Administrator', NULL, 'admin'),

-- PIMPINAN (Hakim + Panitera + Sekretaris)
(2, 'FATTAHURRIDLO AL GHANY, S.H.I., M.S.I.', '198505092009041006@pa-penajam.go.id', NULL, 'L', 'Hakim', 'pimpinan', '198505092009041006', 'Ketua', 1, 'pegawai'),
(3, 'NAHDIYANTI, S.H.I., M.H.', '198410092007042001@pa-penajam.go.id', NULL, 'P', 'Hakim', 'pimpinan', '198410092007042001', ' Wakil Ketua', 1, 'pegawai'),
(4, 'NUR RIZKA FANI, S.H.', '199702232022032013@pa-penajam.go.id', NULL, 'P', 'Hakim', 'pimpinan', '199702232022032013', 'Hakim Pratama', 1, 'pegawai'),
(5, 'VIDYA NURCHALIZA, S.H.', '199704162022032013@pa-penajam.go.id', NULL, 'P', 'Hakim', 'pimpinan', '199704162022032013', 'Hakim Pratama', 1, 'pegawai'),
(6, 'MUHAMMAD HAMDI, S.H., M.Hum.', '197503141996031002@pa-penajam.go.id', NULL, 'L', 'PNS', 'pimpinan', '197503141996031002', 'Panitera', 2, 'pegawai'),
(7, 'INDRA YANITA YULIANA, S.E., M.Si.', '198301042006042003@pa-penajam.go.id', NULL, 'P', 'PNS', 'pimpinan', '198301042006042003', 'Sekretaris', 3, 'pegawai'),

-- STruktural (Panmud, Kasubbag)
(8, 'NUZULA YUSTISIA, S.H.I.', '198506052009042006@pa-penajam.go.id', NULL, 'P', 'PNS', 'Struktural', '198506052009042006', 'Panmud Permohonan', 6, 'pegawai'),
(9, 'FARIDAH FITRIYANI, S.H.I.', '198108022009122002@pa-penajam.go.id', NULL, 'P', 'PNS', 'Struktural', '198108022009122002', 'Panmud Gugatan', 4, 'pegawai'),
(10, 'AWALUDDIN NUR, S.H.I.', '198411192011011012@pa-penajam.go.id', NULL, 'L', 'PNS', 'Struktural', '198411192011011012', 'Kasubbag PTIP', 7, 'pegawai'),
(11, 'MUHAMMAD ZAIM NOOR, S.H.', '198802022008051001@pa-penajam.go.id', NULL, 'L', 'PNS', 'Struktural', '198802022008051001', 'Kasubbag Umum & Keu', 8, 'pegawai'),

-- Fungsional (Panitera Pengganti, Juru Sita, Pranata Komputer)
(12, 'RAINI MAULIDINA, S.H.', '199408302020122007@pa-penajam.go.id', NULL, 'P', 'PNS', 'Fungsional', '199408302020122007', 'Panitera Pengganti', 2, 'pegawai'),
(13, 'MUHAMMAD MIFTAHUDIN, S.H.', '199705312020121004@pa-penajam.go.id', NULL, 'L', 'PNS', 'Fungsional', '199705312020121004', 'Panitera Pengganti', 2, 'pegawai'),
(14, 'NURUL FITRIANI, A.Md.Kom.', '199304112019032020@pa-penajam.go.id', NULL, 'P', 'PNS', 'Fungsional', '199304112019032020', 'Juru Sita Pengganti', 2, 'pegawai'),
(15, 'MUHARDIANSYAH, S.Kom.', '199107132020121003@pa-penajam.go.id', NULL, 'L', 'PNS', 'Fungsional', '199107132020121003', 'Pranata Komputer', 7, 'pegawai'),

-- Staff PNS (Analis Perkara Peradilan)
(16, 'MUHAMMAD ILHAM, S.H., M.Kn.', '199702012022031004@pa-penajam.go.id', NULL, 'L', 'PNS', 'Staff', '199702012022031004', 'Analis Perkara Peradilan', 4, 'pegawai'),
(17, 'QURROTU AINI, S.H.', '200106132024052001@pa-penajam.go.id', NULL, 'P', 'PNS', 'Staff', '200106132024052001', 'Analis Perkara Peradilan', 5, 'pegawai'),
(18, 'CUCU KHOFIFAH, S.H.', '200009242025062019@pa-penajam.go.id', NULL, 'P', 'PNS', 'Staff', '200009242025062019', 'Analis Perkara Peradilan', 5, 'pegawai'),
(19, 'RAINA PUTRI NASUHA, S.H.', '199712262025062010@pa-penajam.go.id', NULL, 'P', 'PNS', 'Staff', '199712262025062010', 'Analis Perkara Peradilan', 4, 'pegawai'),

-- CPAPES Staff
(20, 'NUR MUFLIHAH P.W., S.T.', '199710252025062012@pa-penajam.go.id', NULL, 'P', 'CPNAS', 'Staff', '199710252025062012', 'Teknisi Sarpas', 8, 'pegawai'),
(21, 'YULINDA, A.Md.Kom.', '199211132020122011@pa-penajam.go.id', NULL, 'P', 'CPNAS', 'Staff', '199211132020122011', 'Pengelola Penanganan Perkara', 6, 'pegawai'),
(22, 'NURAVITA PRAMESTI, A.Md.', '199604102025062008@pa-penajam.go.id', NULL, 'P', 'CPNAS', 'Staff', '199604102025062008', 'Dokumentalis Hukum', 5, 'pegawai'),
(23, 'IRWAN SYAH SETIAWAN, A.md', '199010082022031004@pa-penajam.go.id', NULL, 'L', 'CPNAS', 'Staff', '199010082022031004', 'Pengelola Penanganan Perkara', 4, 'pegawai'),
(24, 'JAKFAR, A.Md.A.B.', '199709082025061006@pa-penajam.go.id', NULL, 'L', 'CPNAS', 'Staff', '199709082025061006', 'Dokumentalis Hukum', 4, 'pegawai'),

-- PPPK Staff
(25, 'NOVAYANTI, S.H.', '199711202025212035@pa-penajam.go.id', NULL, 'P', 'PPPK', 'Staff', '199711202025212035', 'Penata Layanan Operasional', 5, 'pegawai'),
(26, 'DAMAI AZIZU, S.Kom.', '198510102025211065@pa-penajam.go.id', NULL, 'L', 'PPPK', 'Staff', '198510102025211065', 'Penata Layanan Operasional', 7, 'pegawai'),
(27, 'NAJWA HIJRIANA, S.E.', '199605112025212037@pa-penajam.go.id', NULL, 'P', 'PPPK', 'Staff', '199605112025212037', 'Penata Layanan Operasional', 9, 'pegawai'),
(28, 'ASHAR, S.H.', '199406072025211039@pa-penajam.go.id', NULL, 'L', 'PPPK', 'Staff', '199406072025211039', 'Penata Layanan Operasional', 8, 'pegawai'),
(29, 'AMIN NUR', '198204262025211027@pa-penajam.go.id', NULL, 'L', 'PPPK', 'Staff', '198204262025211027', 'Operator Layanan', 8, 'pegawai'),
(30, 'ADI IRAWAN', '198210062025211034@pa-penajam.go.id', NULL, 'L', 'PPPK', 'Staff', '198210062025211034', 'Pengelola Umum', 8, 'pegawai');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_email_unique` (`email`),
  ADD UNIQUE KEY `users_nip_unique` (`nip`),
  ADD KEY `users_unit_id_foreign` (`unit_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;

COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
