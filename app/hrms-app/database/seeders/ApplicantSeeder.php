<?php

namespace Database\Seeders;

use App\Models\Applicant;
use App\Models\AppliedJob;
use App\Models\AppliedJobAnswer;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class ApplicantSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $path = base_path('database/seeders/applicants_cleaned.csv');

        $rows = [];
        if (($handle = fopen($path, 'r')) !== false) {
            // Use built-in CSV reader — handles quoted fields and newlines
            while (($data = fgetcsv($handle)) !== false) {
                $rows[] = $data;
            }
            fclose($handle);
        }

        $csv = collect($rows);
        $headers = collect($csv->shift())->map(fn($h) => trim($h));

        // Only keep valid rows
        $data = $csv
            ->filter(fn($row) => count($row) === $headers->count())
            ->map(fn($row) => array_combine($headers->toArray(), $row));

        $jobPostingId = DB::table('job_postings')->where('title', 'Staf Administrasi Biro Pembelajaran')->value('id');
        $questionId1 = DB::table('job_posting_questions')->where('question', 'LIKE', 'Ceritakan pengalaman kerja terdahulu. Anda boleh menceritakan relevansi pengalaman kerja dulu dengan lowongan kerja yang Bapak/Ibu lamar.')->value('id');
        $questionId2 = DB::table('job_posting_questions')->where('question', 'Apa motivasi Bapak/Ibu untuk bekerja di Universitas Trilogi?')->value('id');
        $questionId3 = DB::table('job_posting_questions')->where('question', 'Apa yang Bapak/Ibu ketahui tentang posisi ini?')->value('id');
        $questionId4 = DB::table('job_posting_questions')->where('question', 'Apa rencana pengembangan ke depannya apabila Anda diterima dalam posisi ini?')->value('id');
        $questionId5 = DB::table('job_posting_questions')->where('question', 'Jika Anda diterima, apa yang Anda butuhkan dari Biro Sumber Daya Manusia untuk mengembangkan diri Anda?')->value('id');


        // Create User & Applicant
        foreach ($data as $record) {
            DB::transaction(function () use ($record, $jobPostingId, $questionId1, $questionId2, $questionId3, $questionId4, $questionId5) {
                $name = $record['Nama Lengkap'];
                $email = Str::slug($name,'.').'@gmail.com';
                $birthday = $record['Tanggal Lahir'];

                // Create User & Applicant
                $user = User::firstOrCreate(
                    ['email' => $email],
                    [
                        'name' => $name,
                        'password' => Hash::make('password'),
                        'email_verified_at' => now(),
                        'role' => 'user'
                    ]
                );

                $applicant = Applicant::firstOrCreate(
                    ['user_id' => $user->id],
                    [
                        'email' => $email,
                        'date_of_birth' => $birthday,
                    ]
                );

                // Apply Job
                $appliedJob = AppliedJob::create([
                    'job_posting_id' => $jobPostingId,
                    'applicant_id' => $applicant->id,
                    'ai_screening_score' => null,
                    'hr_screening_score' => null,
                ]);

                // Answer Question
                $answer1 = $record['Ceritakan pengalaman kerja terdahulu. Anda boleh menceritakan relevansi pengalaman kerja dulu dengan lowongan kerja yang Bapak/Ibu lamar'];
                AppliedJobAnswer::create([
                    'applied_job_id' => $appliedJob->id,
                    'job_posting_question_id' => $questionId1,
                    'answer' => $answer1,
                ]);
                $answer2 = $record['Apa motivasi Bapak/Ibu untuk bekerja di Universitas Trilogi?'];
                AppliedJobAnswer::create([
                    'applied_job_id' => $appliedJob->id,
                    'job_posting_question_id' => $questionId2,
                    'answer' => $answer2,
                ]);
                $answer3 = $record['Apa yang Bapak/Ibu ketahui tentang posisi ini?'];
                AppliedJobAnswer::create([
                    'applied_job_id' => $appliedJob->id,
                    'job_posting_question_id' => $questionId3,
                    'answer' => $answer3,
                ]);
                $answer4 = $record['Apa rencana pengembangan kedepannya apabila Anda diterima dalam posisi ini?'];
                AppliedJobAnswer::create([
                    'applied_job_id' => $appliedJob->id,
                    'job_posting_question_id' => $questionId4,
                    'answer' => $answer4,
                ]);
                $answer5 = $record['Jika Anda diterima, Apa yang Anda butuhkan dari Biro Sumber Daya Manusia jika Anda ingin mengembangkan diri Anda ?'];
                AppliedJobAnswer::create([
                    'applied_job_id' => $appliedJob->id,
                    'job_posting_question_id' => $questionId5,
                    'answer' => $answer5,
                ]);
            });
        }
    }
}
