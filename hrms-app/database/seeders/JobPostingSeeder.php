<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class JobPostingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        if (! DB::table('job_postings')->where('title', 'Staf Administrasi Biro Pembelajaran')->value('id'))
        {
            DB::table('job_postings')->insert([
                [
                    'id' => Str::uuid(),
                    'title' => 'Staf Administrasi Biro Pembelajaran',
                    'description' => 'Kami mencari Staf Administrasi yang teliti dan memiliki kemampuan komunikasi yang baik untuk mendukung operasional harian.',
                    'location' => 'Jakarta, Indonesia',
                    'departments' => 'Administrasi',
                    'requirements' => json_encode([
                        ['value' => 'Minimal lulusan D3 Administrasi atau bidang terkait'],
                        ['value' => 'Menguasai Microsoft Office (Word, Excel, PowerPoint)'],
                        ['value' => 'Mampu bekerja secara mandiri maupun tim'],
                        ['value' => 'Berpengalaman di bidang administrasi menjadi nilai tambah'],
                    ]),
                    'responsibilities' => json_encode([
                        ['value' => 'Mengelola data yudisium, menerbitkan ijazah'],
                        ['value' => 'Menyiapkan alat tulis untuk dosen'],
                        ['value' => 'Menghadirkan absensi dosen'],
                        ['value' => 'Menginput jadwal perkuliahan'],
                        ['value' => 'Menggandakan soal ujian'],
                    ]),
                    'benefits' => json_encode([
                        ['value' => 'Tunjangan kesehatan'],
                        ['value' => 'Bonus kinerja'],
                        ['value' => 'Kesempatan pengembangan karier'],
                    ]),
                    'salary' => 'IDR 5,000,000 - 8,000,000 / bulan',
                    'type' => 'full-time',
                    'status' => 'published',
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
            ]);

            // Optional: You can store related job questions in a separate table if you have one.
            DB::table('job_posting_questions')->insert([
                [
                    'id' => Str::uuid(),
                    'job_posting_id' => DB::table('job_postings')->where('title', 'Staf Administrasi Biro Pembelajaran')->value('id'),
                    'question' => 'Ceritakan pengalaman kerja terdahulu. Anda boleh menceritakan relevansi pengalaman kerja dulu dengan lowongan kerja yang Bapak/Ibu lamar',
                    'weight' => 0.3,
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'id' => Str::uuid(),
                    'job_posting_id' => DB::table('job_postings')->where('title', 'Staf Administrasi Biro Pembelajaran')->value('id'),
                    'question' => 'Apa motivasi Bapak/Ibu untuk bekerja di Universitas Trilogi?',
                    'weight' => 0.2,
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'id' => Str::uuid(),
                    'job_posting_id' => DB::table('job_postings')->where('title', 'Staf Administrasi Biro Pembelajaran')->value('id'),
                    'question' => 'Apa yang Bapak/Ibu ketahui tentang posisi ini?',
                    'weight' => 0.2,
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'id' => Str::uuid(),
                    'job_posting_id' => DB::table('job_postings')->where('title', 'Staf Administrasi Biro Pembelajaran')->value('id'),
                    'question' => 'Apa rencana pengembangan kedepannya apabila Anda diterima dalam posisi ini?',
                    'weight' => 0.15,
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'id' => Str::uuid(),
                    'job_posting_id' => DB::table('job_postings')->where('title', 'Staf Administrasi Biro Pembelajaran')->value('id'),
                    'question' => 'Jika Anda diterima, Apa yang Anda butuhkan dari Biro Sumber Daya Manusia jika Anda ingin mengembangkan diri Anda ?',
                    'weight' => 0.15,
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
            ]);
        }

    }
}
