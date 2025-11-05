<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use App\Models\JobPosting;
use App\Events\JobPostingEvent;

class JobPostingSeeder extends Seeder
{
    /**
     * Jalankan database seeder.
     */
    public function run(): void
    {
        if (! DB::table('job_postings')->where('title', 'Staf Administrasi Biro Pembelajaran')->exists()) {

            $requirements = [
                ['id' => 'requirement_1', 'value' => 'Minimal lulusan D3 Administrasi atau bidang terkait'],
                ['id' => 'requirement_2', 'value' => 'Menguasai Microsoft Office (Word, Excel, PowerPoint)'],
                ['id' => 'requirement_3', 'value' => 'Mampu bekerja secara mandiri maupun tim'],
                ['id' => 'requirement_4', 'value' => 'Berpengalaman di bidang administrasi menjadi nilai tambah'],
            ];

            $responsibilities = [
                ['id' => 'responsibility_1', 'value' => 'Mengelola data yudisium dan menerbitkan ijazah'],
                ['id' => 'responsibility_2', 'value' => 'Menyiapkan alat tulis untuk dosen'],
                ['id' => 'responsibility_3', 'value' => 'Mengelola absensi dosen'],
                ['id' => 'responsibility_4', 'value' => 'Menginput jadwal perkuliahan'],
                ['id' => 'responsibility_5', 'value' => 'Menggandakan dan mendistribusikan soal ujian'],
            ];

            $qualifications = [
                ['id' => 'qualification_1', 'value' => 'Teliti, disiplin, dan mampu bekerja sesuai prosedur administrasi'],
                ['id' => 'qualification_2', 'value' => 'Memiliki kemampuan komunikasi yang baik'],
                ['id' => 'qualification_3', 'value' => 'Dapat mengatur waktu dan prioritas pekerjaan dengan efektif'],
            ];

            $required_skills = [
                ['id' => 'required_skill_1', 'value' => 'Microsoft Excel dan Word tingkat menengah'],
                ['id' => 'required_skill_2', 'value' => 'Kemampuan mengetik cepat dan akurat'],
                ['id' => 'required_skill_3', 'value' => 'Kemampuan mengarsipkan dokumen dengan rapi'],
            ];

            $preferred_skills = [
                ['id' => 'preferred_skill_1', 'value' => 'Pengalaman menggunakan sistem informasi akademik (SIAKAD)'],
                ['id' => 'preferred_skill_2', 'value' => 'Memahami proses administrasi pendidikan tinggi'],
                ['id' => 'preferred_skill_3', 'value' => 'Mampu membuat laporan administrasi sederhana'],
            ];

            $benefits = [
                ['id' => 'benefit_1', 'value' => 'Tunjangan kesehatan'],
                ['id' => 'benefit_2', 'value' => 'Bonus kinerja tahunan'],
                ['id' => 'benefit_3', 'value' => 'Kesempatan pengembangan karier'],
            ];

            // Use DB transaction to ensure all data is saved before dispatching event
            DB::transaction(function () use (
                $requirements,
                $responsibilities,
                $qualifications,
                $required_skills,
                $preferred_skills,
                $benefits
            ) {
                $jobPostingId = Str::uuid();

                // Simpan job posting utama
                DB::table('job_postings')->insert([
                    'id' => $jobPostingId,
                    'title' => 'Staf Administrasi Biro Pembelajaran',
                    'description' => 'Kami mencari Staf Administrasi yang teliti dan memiliki kemampuan komunikasi yang baik untuk mendukung operasional harian Biro Pembelajaran.',
                    'location' => 'Jakarta, Indonesia',
                    'departments' => 'Administrasi',
                    'requirements' => json_encode($requirements),
                    'responsibilities' => json_encode($responsibilities),
                    'qualifications' => json_encode($qualifications),
                    'required_skills' => json_encode($required_skills),
                    'preferred_skills' => json_encode($preferred_skills),
                    'benefits' => json_encode($benefits),
                    'salary' => 'IDR 5,000,000 - 8,000,000 / bulan',
                    'type' => 'full-time',
                    'status' => 'published',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                // Pertanyaan wawancara + kompetensi yang terkait
                $questions = [
                    [
                        'question' => 'Ceritakan pengalaman kerja terdahulu. Anda boleh menceritakan relevansi pengalaman kerja dulu dengan lowongan kerja yang Bapak/Ibu lamar.',
                        'weight' => 0.35,
                        'mapped_competencies' => json_encode(['requirement_4', 'preferred_skill_3']),
                    ],
                    [
                        'question' => 'Apa motivasi Bapak/Ibu untuk bekerja di Universitas Trilogi?',
                        'weight' => 0.2,
                        'mapped_competencies' => json_encode(['qualification_2', 'qualification_3']),
                    ],
                    [
                        'question' => 'Apa yang Bapak/Ibu ketahui tentang posisi ini?',
                        'weight' => 0.2,
                        'mapped_competencies' => json_encode(['responsibility_1', 'responsibility_4']),
                    ],
                    [
                        'question' => 'Apa rencana pengembangan ke depannya apabila Anda diterima dalam posisi ini?',
                        'weight' => 0.15,
                        'mapped_competencies' => json_encode(['qualification_3', 'preferred_skill_1']),
                    ],
                    [
                        'question' => 'Jika Anda diterima, apa yang Anda butuhkan dari Biro Sumber Daya Manusia untuk mengembangkan diri Anda?',
                        'weight' => 0.15,
                        'mapped_competencies' => json_encode(['qualification_1', 'required_skill_1']),
                    ],
                ];

                foreach ($questions as $q) {
                    DB::table('job_posting_questions')->insert([
                        'id' => Str::uuid(),
                        'job_posting_id' => $jobPostingId,
                        'question' => $q['question'],
                        'weight' => $q['weight'],
                        'mapped_competencies' => $q['mapped_competencies'],
                        'weight_version' => 1,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }

                // Load the job posting with questions and dispatch event
                $jobPosting = JobPosting::with('questions')->find($jobPostingId);

                if ($jobPosting) {
                    // Dispatch the event to sync with external API
                    event(new JobPostingEvent($jobPosting, 'create'));

                    $this->command->info("✓ Job posting created and event dispatched: {$jobPosting->title}");
                }
            });
        } else {
            $this->command->info("Job posting 'Staf Administrasi Biro Pembelajaran' already exists.");
        }
    }
}
