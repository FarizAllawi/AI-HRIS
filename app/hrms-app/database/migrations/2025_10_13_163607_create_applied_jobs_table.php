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
        Schema::create('applied_jobs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('job_posting_id')->constrained('job_postings')->onDelete('cascade');
            $table->foreignUuid('applicant_id')->constrained('applicants')->onDelete('cascade');
            $table->double('ai_screening_score')->nullable();
            $table->double('hr_screening_score')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('applied_jobs');
    }
};
