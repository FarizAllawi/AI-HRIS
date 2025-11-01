<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('job_posting_questions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('job_posting_id')->constrained('job_postings')->onDelete('cascade');
            $table->text('question');
            $table->text('description')->nullable();
            $table->double('weight');
            /**
            # List of competency IDs mapped to this question
                Every Responsibility, Required skills, preferred skills
                and qualifications in job posting will have ID

                The mapped data will look like:
                [required_skills_id_1, qualification_id_2]
             * */
            $table->text('mapped_competencies'); // Store as JSON
            $table->integer('weight_version')->default(1);

            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('job_posting_questions');
    }
};
