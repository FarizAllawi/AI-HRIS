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
        DB::table('job_postings')->insert([
            [
                'id' => Str::uuid(),
                'title' => 'Frontend Developer',
                'description' => 'We are looking for a skilled Frontend Developer to join our growing engineering team. You will be responsible for building and maintaining user interfaces for our web applications.',
                'location' => 'Jakarta, Indonesia',
                'departments' => 'Engineering',
                'requirements' => json_encode([
                    ['value' => 'Proficient in React.js and modern frontend tools (Vite, Next.js)'],
                    ['value' => 'Strong understanding of HTML, CSS, and JavaScript (ES6+)'],
                    ['value' => 'Experience with REST APIs and Git version control'],
                    ['value' => 'Ability to work collaboratively in a remote-first environment'],
                ]),
                'responsibilities' => json_encode([
                    ['value' => 'Develop and maintain user-facing features using React'],
                    ['value' => 'Collaborate with designers and backend developers to improve usability'],
                    ['value' => 'Write reusable, testable, and efficient code'],
                    ['value' => 'Participate in code reviews and contribute to team best practices'],
                ]),
                'benefits' => json_encode([
                    ['value' => 'Remote work flexibility'],
                    ['value' => 'Health insurance coverage'],
                    ['value' => 'Career growth and learning opportunities'],
                    ['value' => 'Performance-based bonuses'],
                ]),
                'salary' => 'IDR 12,000,000 - 20,000,000 / month',
                'type' => 'full-time',
                'status' => 'published',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => Str::uuid(),
                'title' => 'Backend Engineer',
                'description' => 'Responsible for building scalable APIs and managing databases.',
                'location' => 'Bandung, Indonesia',
                'departments' => 'Engineering',
                'requirements' => json_encode([
                    ['value' => 'Proficient in Laravel and PostgreSQL'],
                    ['value' => 'Knowledge of RESTful API design principles'],
                    ['value' => 'Experience with Redis and queue workers'],
                ]),
                'responsibilities' => json_encode([
                    ['value' => 'Design and implement RESTful APIs'],
                    ['value' => 'Optimize database performance and caching strategy'],
                    ['value' => 'Collaborate with frontend team for integration'],
                ]),
                'benefits' => json_encode([
                    ['value' => 'Health insurance'],
                    ['value' => 'Annual bonus'],
                    ['value' => 'Flexible working hours'],
                ]),
                'salary' => 'IDR 15,000,000 - 25,000,000 / month',
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
                'job_posting_id' => DB::table('job_postings')->where('title', 'Frontend Developer')->value('id'),
                'question' => 'How do you ensure accessibility in your frontend applications?',
                'description' => 'Assess candidate’s knowledge about accessibility standards like WCAG.',
                'weight' => 0.3,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => Str::uuid(),
                'job_posting_id' => DB::table('job_postings')->where('title', 'Frontend Developer')->value('id'),
                'question' => 'What is your approach to optimizing React performance?',
                'description' => 'Check understanding of React performance best practices.',
                'weight' => 0.4,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => Str::uuid(),
                'job_posting_id' => DB::table('job_postings')->where('title', 'Backend Engineer')->value('id'),
                'question' => 'Explain how you would design a scalable API for a job portal.',
                'description' => 'Evaluate system design thinking and scalability considerations.',
                'weight' => 0.5,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
