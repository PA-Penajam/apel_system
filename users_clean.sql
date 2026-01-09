-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Jan 02, 2026 at 02:49 PM
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
  `avatar_url` varchar(255) DEFAULT NULL,
  `role` varchar(20) NOT NULL DEFAULT 'pegawai',
  `nip` varchar(50) DEFAULT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `two_factor_secret` text DEFAULT NULL,
  `two_factor_recovery_codes` text DEFAULT NULL,
  `two_factor_confirmed_at` timestamp NULL DEFAULT NULL,
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `unit_id` bigint(20) UNSIGNED DEFAULT NULL,
  `jabatan` varchar(255) DEFAULT NULL,
  `settings` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`settings`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `avatar_url`, `role`, `nip`, `email_verified_at`, `password`, `two_factor_secret`, `two_factor_recovery_codes`, `two_factor_confirmed_at`, `remember_token`, `created_at`, `updated_at`, `unit_id`, `jabatan`, `settings`) VALUES
(1, 'Administrator', 'admin@pa-penajam.go.id', NULL, 'admin', '000000000000000000', NULL, '$2y$12$TVV7uWtfHis1hUwkcdu/Buncm54mcfPxyW/4F39VhpwtrhliQQ8Eq', NULL, NULL, NULL, NULL, '2026-01-01 00:05:05', '2026-01-01 02:23:35', NULL, NULL, '{\"completed_tours\":[\"assignment_list_tour\",\"dashboard_tour\"]}'),
(2, 'Awaluddin Nur S.H.I.', '198411192011011012@pa-penajam.go.id', NULL, 'pegawai', '198411192011011012', NULL, '$2y$12$TVV7uWtfHis1hUwkcdu/Buncm54mcfPxyW/4F39VhpwtrhliQQ8Eq', NULL, NULL, NULL, NULL, '2026-01-01 00:05:05', '2026-01-01 00:05:05', 7, 'Kepala Subbagian', '{}'),
(3, 'Muhammad Hamdi S.H., M.Hum.', '197503141996031002@pa-penajam.go.id', NULL, 'pegawai', '197503141996031002', NULL, '$2y$12$TVV7uWtfHis1hUwkcdu/Buncm54mcfPxyW/4F39VhpwtrhliQQ8Eq', NULL, NULL, NULL, NULL, '2026-01-01 00:05:05', '2026-01-01 00:05:05', 2, 'Panitera Tingkat Pertama', '{}'),
(4, 'Indra Yanita Yuliana S.E., M.Si.', '198301042006042003@pa-penajam.go.id', NULL, 'pegawai', '198301042006042003', NULL, '$2y$12$TVV7uWtfHis1hUwkcdu/Buncm54mcfPxyW/4F39VhpwtrhliQQ8Eq', NULL, NULL, NULL, NULL, '2026-01-01 00:05:05', '2026-01-01 16:49:49', 3, 'Sekretaris', '{\"completed_tours\":[\"dashboard_tour\"]}'),
(5, 'Faridah Fitriyani S.H.I.', '198108022009122002@pa-penajam.go.id', NULL, 'pegawai', '198108022009122002', NULL, '$2y$12$TVV7uWtfHis1hUwkcdu/Buncm54mcfPxyW/4F39VhpwtrhliQQ8Eq', NULL, NULL, NULL, NULL, '2026-01-01 00:05:06', '2026-01-01 00:05:06', 4, 'Panitera Muda', '{}'),
(6, 'Fattahurridlo Al Ghany S.H.I., M.S.I.', '198505092009041006@pa-penajam.go.id', NULL, 'pegawai', '198505092009041006', NULL, '$2y$12$TVV7uWtfHis1hUwkcdu/Buncm54mcfPxyW/4F39VhpwtrhliQQ8Eq', NULL, NULL, NULL, NULL, '2026-01-01 00:05:06', '2026-01-01 00:05:06', 1, 'Ketua Pengadilan', '{}'),
(7, 'Drs. Karani Kutni', '196405061993031004@pa-penajam.go.id', NULL, 'pegawai', '196405061993031004', NULL, '$2y$12$TVV7uWtfHis1hUwkcdu/Buncm54mcfPxyW/4F39VhpwtrhliQQ8Eq', NULL, NULL, NULL, NULL, '2026-01-01 00:05:06', '2026-01-01 00:05:06', 2, 'Panitera Pengganti', '{}'),
(8, 'Nahdiyanti S.H.I., M.H.', '198410092007042001@pa-penajam.go.id', NULL, 'pegawai', '198410092007042001', NULL, '$2y$12$TVV7uWtfHis1hUwkcdu/Buncm54mcfPxyW/4F39VhpwtrhliQQ8Eq', NULL, NULL, NULL, NULL, '2026-01-01 00:05:06', '2026-01-01 00:05:06', 1, 'Wakil Ketua Pengadilan', '{}'),
(9, 'Nuzula Yustisia S.H.I.', '198506052009042006@pa-penajam.go.id', NULL, 'pegawai', '198506052009042006', NULL, '$2y$12$TVV7uWtfHis1hUwkcdu/Buncm54mcfPxyW/4F39VhpwtrhliQQ8Eq', NULL, NULL, NULL, NULL, '2026-01-01 00:05:06', '2026-01-01 19:07:10', 5, 'Panitera Muda', '{\"completed_tours\":[\"dashboard_tour\"]}'),
(10, 'Muhammad Zaim Noor S.H.', '198802022008051001@pa-penajam.go.id', NULL, 'pegawai', '198802022008051001', NULL, '$2y$12$TVV7uWtfHis1hUwkcdu/Buncm54mcfPxyW/4F39VhpwtrhliQQ8Eq', NULL, NULL, NULL, 'wfvy9qUMpTxAuGNRCOhHfO9D2m1Uht5kLg1jFW29ScRAfjTMSCFYiGsvEHvR', '2026-01-01 00:05:06', '2026-01-01 19:01:09', 9, 'Kepala Subbagian', '{\"completed_tours\":[\"dashboard_tour\"]}'),
(11, 'Nurul Fitriani A.Md.Kom.', '199304112019032020@pa-penajam.go.id', NULL, 'pegawai', '199304112019032020', NULL, '$2y$12$TVV7uWtfHis1hUwkcdu/Buncm54mcfPxyW/4F39VhpwtrhliQQ8Eq', NULL, NULL, NULL, NULL, '2026-01-01 00:05:06', '2026-01-01 18:58:55', 2, 'Juru Sita Pengganti', '{\"completed_tours\":[\"dashboard_tour\"]}'),
(12, 'Raini Maulidina S.H.', '199408302020122007@pa-penajam.go.id', NULL, 'pegawai', '199408302020122007', NULL, '$2y$12$TVV7uWtfHis1hUwkcdu/Buncm54mcfPxyW/4F39VhpwtrhliQQ8Eq', NULL, NULL, NULL, NULL, '2026-01-01 00:05:06', '2026-01-01 00:05:06', 2, 'Panitera Pengganti', '{}'),
(13, 'Muhardiansyah S.Kom.', '199107132020121003@pa-penajam.go.id', NULL, 'pegawai', '199107132020121003', NULL, '$2y$12$TVV7uWtfHis1hUwkcdu/Buncm54mcfPxyW/4F39VhpwtrhliQQ8Eq', NULL, NULL, NULL, NULL, '2026-01-01 00:05:06', '2026-01-01 00:08:08', 7, 'Pranata Komputer Ahli Pertama', '{\"completed_tours\":[\"dashboard_tour\"]}'),
(14, 'Muhammad Miftahudin S.H.', '199705312020121004@pa-penajam.go.id', NULL, 'pegawai', '199705312020121004', NULL, '$2y$12$TVV7uWtfHis1hUwkcdu/Buncm54mcfPxyW/4F39VhpwtrhliQQ8Eq', NULL, NULL, NULL, NULL, '2026-01-01 00:05:06', '2026-01-01 00:05:06', 2, 'Panitera Pengganti', '{}'),
(15, 'Muhammad Ilham S.H., M.Kn.', '199702012022031004@pa-penajam.go.id', NULL, 'pegawai', '199702012022031004', NULL, '$2y$12$TVV7uWtfHis1hUwkcdu/Buncm54mcfPxyW/4F39VhpwtrhliQQ8Eq', NULL, NULL, NULL, 'IPhNF6r54fao1sQmEoMUIsFJmGNPrAvnaOv6EW39RsKb4zaSkxDUuk3l4p5Q', '2026-01-01 00:05:06', '2026-01-01 19:44:57', 4, 'Klerek - Analis Perkara Peradilan', '{\"completed_tours\":[\"dashboard_tour\"]}'),
(16, 'Irwan Syah Setiawan A.md', '199010082022031004@pa-penajam.go.id', NULL, 'pegawai', '199010082022031004', NULL, '$2y$12$TVV7uWtfHis1hUwkcdu/Buncm54mcfPxyW/4F39VhpwtrhliQQ8Eq', NULL, NULL, NULL, NULL, '2026-01-01 00:05:06', '2026-01-01 19:22:33', 4, 'Klerek - Pengelola Penanganan Perkara', '{\"completed_tours\":[\"dashboard_tour\"]}'),
(17, 'Nur Rizka Fani S.H.', '199702232022032013@pa-penajam.go.id', NULL, 'pegawai', '199702232022032013', NULL, '$2y$12$TVV7uWtfHis1hUwkcdu/Buncm54mcfPxyW/4F39VhpwtrhliQQ8Eq', NULL, NULL, NULL, NULL, '2026-01-01 00:05:06', '2026-01-01 00:05:06', 1, 'Hakim Tingkat Pertama', '{}'),
(18, 'Vidya Nurchaliza S.H.', '199704162022032013@pa-penajam.go.id', NULL, 'pegawai', '199704162022032013', NULL, '$2y$12$TVV7uWtfHis1hUwkcdu/Buncm54mcfPxyW/4F39VhpwtrhliQQ8Eq', NULL, NULL, NULL, NULL, '2026-01-01 00:05:06', '2026-01-01 00:05:06', 1, 'Hakim Tingkat Pertama', '{}'),
(19, 'Qurrotu Aini S.H.', '200106132024052001@pa-penajam.go.id', NULL, 'pegawai', '200106132024052001', NULL, '$2y$12$TVV7uWtfHis1hUwkcdu/Buncm54mcfPxyW/4F39VhpwtrhliQQ8Eq', NULL, NULL, NULL, 'ZdopSDqn26nLShyD8ZoiD0elvSDRqgZEIlPiH84OUzDybIK45MOn42XWXa0N', '2026-01-01 00:05:06', '2026-01-01 20:14:41', 6, 'Klerek - Analis Perkara Peradilan', '{\"completed_tours\":[\"dashboard_tour\"]}'),
(20, 'Nur Muflihah Putri Wijanarko S.T.', '199710252025062012@pa-penajam.go.id', NULL, 'pegawai', '199710252025062012', NULL, '$2y$12$TVV7uWtfHis1hUwkcdu/Buncm54mcfPxyW/4F39VhpwtrhliQQ8Eq', NULL, NULL, NULL, NULL, '2026-01-01 00:05:06', '2026-01-01 00:05:06', 9, 'Teknisi Sarana dan Prasarana', '{}'),
(21, 'Raina Putri Nasuha S.H.', '199712262025062010@pa-penajam.go.id', NULL, 'pegawai', '199712262025062010', NULL, '$2y$12$TVV7uWtfHis1hUwkcdu/Buncm54mcfPxyW/4F39VhpwtrhliQQ8Eq', NULL, NULL, NULL, NULL, '2026-01-01 00:05:06', '2026-01-01 19:01:07', 4, 'Klerek - Analis Perkara Peradilan', '{\"completed_tours\":[\"dashboard_tour\"]}'),
(22, 'Jakfar A.Md.A.B.', '199709082025061006@pa-penajam.go.id', NULL, 'pegawai', '199709082025061006', NULL, '$2y$12$TVV7uWtfHis1hUwkcdu/Buncm54mcfPxyW/4F39VhpwtrhliQQ8Eq', NULL, NULL, NULL, NULL, '2026-01-01 00:05:06', '2026-01-01 22:55:25', 4, 'Klerek - Dokumentalis Hukum', '{\"completed_tours\":[\"dashboard_tour\"]}'),
(23, 'Cucu Khofifah S.H.', '200009242025062019@pa-penajam.go.id', NULL, 'pegawai', '200009242025062019', NULL, '$2y$12$TVV7uWtfHis1hUwkcdu/Buncm54mcfPxyW/4F39VhpwtrhliQQ8Eq', NULL, NULL, NULL, 'qlVN1c2R85lwwSdBjuTNjoLRQGZBa2IRzm3CdngZnbAXIIFa4EYvZFWASDYG', '2026-01-01 00:05:06', '2026-01-01 19:20:53', 6, 'Klerek - Analis Perkara Peradilan', '{\"completed_tours\":[\"dashboard_tour\"]}'),
(24, 'Nuravita Pramesti A.Md.', '199604102025062008@pa-penajam.go.id', NULL, 'pegawai', '199604102025062008', NULL, '$2y$12$TVV7uWtfHis1hUwkcdu/Buncm54mcfPxyW/4F39VhpwtrhliQQ8Eq', NULL, NULL, NULL, NULL, '2026-01-01 00:05:06', '2026-01-01 22:47:57', 6, 'Klerek - Dokumentalis Hukum', '{\"completed_tours\":[\"dashboard_tour\"]}'),
(25, 'Ashar S.H.', '199406072025211039@pa-penajam.go.id', NULL, 'pegawai', '199406072025211039', NULL, '$2y$12$TVV7uWtfHis1hUwkcdu/Buncm54mcfPxyW/4F39VhpwtrhliQQ8Eq', NULL, NULL, NULL, NULL, '2026-01-01 00:05:06', '2026-01-01 19:36:12', 9, 'Operator - Penata Layanan Operasional', '{\"completed_tours\":[\"dashboard_tour\"]}'),
(26, 'Novayanti S.H.', '199711202025212035@pa-penajam.go.id', NULL, 'pegawai', '199711202025212035', NULL, '$2y$12$TVV7uWtfHis1hUwkcdu/Buncm54mcfPxyW/4F39VhpwtrhliQQ8Eq', NULL, NULL, NULL, NULL, '2026-01-01 00:05:06', '2026-01-01 22:57:27', 6, 'Operator - Penata Layanan Operasional', '{\"completed_tours\":[\"dashboard_tour\"]}'),
(27, 'Najwa Hijriana S.E.', '199605112025212037@pa-penajam.go.id', NULL, 'pegawai', '199605112025212037', NULL, '$2y$12$TVV7uWtfHis1hUwkcdu/Buncm54mcfPxyW/4F39VhpwtrhliQQ8Eq', NULL, NULL, NULL, 'ab5FnH68uOJp4WKRvB1VZsrsXlAxLMR51ZDYuEExtke8oKd8cgJZ2VEFItWV', '2026-01-01 00:05:06', '2026-01-01 00:05:06', 8, 'Operator - Penata Layanan Operasional', '{}'),
(28, 'Damai Azizu S.Kom.', '198510102025211065@pa-penajam.go.id', NULL, 'pegawai', '198510102025211065', NULL, '$2y$12$TVV7uWtfHis1hUwkcdu/Buncm54mcfPxyW/4F39VhpwtrhliQQ8Eq', NULL, NULL, NULL, NULL, '2026-01-01 00:05:06', '2026-01-01 19:01:30', 7, 'Operator - Penata Layanan Operasional', '{\"completed_tours\":[\"dashboard_tour\"]}'),
(29, 'Adi Irawan', '198210062025211034@pa-penajam.go.id', NULL, 'pegawai', '198210062025211034', NULL, '$2y$12$TVV7uWtfHis1hUwkcdu/Buncm54mcfPxyW/4F39VhpwtrhliQQ8Eq', NULL, NULL, NULL, NULL, '2026-01-01 00:05:06', '2026-01-01 19:34:47', 9, 'Pengelola Umum Operasional', '{\"completed_tours\":[\"dashboard_tour\"]}'),
(30, 'Amin Nur', '198204262025211027@pa-penajam.go.id', NULL, 'pegawai', '198204262025211027', NULL, '$2y$12$TVV7uWtfHis1hUwkcdu/Buncm54mcfPxyW/4F39VhpwtrhliQQ8Eq', NULL, NULL, NULL, NULL, '2026-01-01 00:05:06', '2026-01-01 19:01:23', 9, 'Operator Layanan Operasional', '{\"completed_tours\":[\"dashboard_tour\"]}'),
(31, 'Yulinda A.Md.Kom.', '199211132020122011@pa-penajam.go.id', NULL, 'pegawai', '199211132020122011', NULL, '$2y$12$TVV7uWtfHis1hUwkcdu/Buncm54mcfPxyW/4F39VhpwtrhliQQ8Eq', NULL, NULL, NULL, NULL, '2026-01-01 00:05:06', '2026-01-01 00:05:06', 5, 'Klerek - Pengelola Penanganan Perkara', '{}');

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
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=32;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `users`
--
ALTER TABLE `users`
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
